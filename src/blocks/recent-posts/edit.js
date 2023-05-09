import { times } from 'lodash';

import {
	BaseControl,
	Button,
	Disabled,
	Placeholder,
	RangeControl,
	SelectControl,
	Spinner,
	TextareaControl,
	ToggleControl,
	TreeSelect,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

import ServerSideRender from '@wordpress/server-side-render';

import { toNumber, buildTermsTree } from '@smb/helper';

import metadata from './block.json';

export default function ( { attributes, setAttributes } ) {
	const {
		postType,
		termId,
		postsPerPage,
		layout,
		ignoreStickyPosts,
		smCols,
		noPostsText,
		itemTitleTagName,
		itemThumbnailSizeSlug,
		forceDisplayItemMeta,
		forceDisplayItemTerms,
		arrows,
		dots,
		interval,
	} = attributes;

	const { allPostTypes, taxonomiesTerms } = useSelect( ( select ) => {
		const { getPostTypes, getEntityRecords, getTaxonomy } =
			select( 'core' );

		let _allPostTypes = getPostTypes( { per_page: -1 } ) || [];
		_allPostTypes = _allPostTypes.filter(
			( type ) =>
				type.viewable &&
				! type.hierarchical &&
				'media' !== type.rest_base
		);

		const _taxonomiesTerms = [];
		_allPostTypes.forEach( ( _postType ) => {
			_postType.taxonomies.forEach( ( _taxonomy ) => {
				const _taxonomyObj = getTaxonomy( _taxonomy );
				const terms =
					getEntityRecords( 'taxonomy', _taxonomy, {
						per_page: -1,
					} ) || [];

				if ( 0 < terms.length ) {
					_taxonomiesTerms.push( {
						taxonomy: _taxonomy,
						label: _taxonomyObj.name,
						terms,
					} );
				}
			} );
		} );

		return {
			allPostTypes: _allPostTypes,
			taxonomiesTerms: _taxonomiesTerms,
		};
	}, [] );

	const itemThumbnailSizeSlugOption = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );
		const { imageSizes } = getSettings();

		return imageSizes.map( ( imageSize ) => {
			return {
				value: imageSize.slug,
				label: imageSize.name,
			};
		} );
	}, [] );

	const itemTitleTagNames = [ 'h2', 'h3', 'h4' ];

	return (
		<>
			<InspectorControls>
				<ToolsPanel
					label={ __( 'Block settings', 'snow-monkey-blocks' ) }
				>
					<ToolsPanelItem
						hasValue={ () =>
							postType !== metadata.attributes.postType.default
						}
						isShownByDefault
						label={ __( 'Post type', 'snow-monkey-blocks' ) }
						onDeselect={ () =>
							setAttributes( {
								postType: metadata.attributes.postType.default,
							} )
						}
					>
						<SelectControl
							label={ __( 'Post type', 'snow-monkey-blocks' ) }
							value={ postType }
							onChange={ ( value ) =>
								setAttributes( {
									postType: value,
								} )
							}
							options={ allPostTypes.map( ( _postType ) => ( {
								label: _postType.name,
								value: _postType.slug,
							} ) ) }
						/>
					</ToolsPanelItem>

					{ ! taxonomiesTerms.length ? (
						<div style={ { gridColumn: '1/-1' } }>
							<BaseControl
								label={ __(
									'Loading taxonomies…',
									'snow-monkey-blocks'
								) }
								id="snow-monkey-blocks/taxonomy-posts/taxonomies"
							>
								<Spinner />
							</BaseControl>
						</div>
					) : (
						<ToolsPanelItem
							hasValue={ () =>
								termId !== metadata.attributes.termId.default
							}
							isShownByDefault
							label={ __( 'Taxonomy', 'snow-monkey-blocks' ) }
							onDeselect={ () =>
								setAttributes( {
									termId: metadata.attributes.termId.default,
									taxonomy:
										metadata.attributes.taxonomy.default,
								} )
							}
						>
							{ taxonomiesTerms.map( ( taxonomyTerms ) => {
								return (
									<TreeSelect
										key={ taxonomyTerms.taxonomy }
										label={ sprintf(
											// translators: %1$s: Term label
											__(
												'Filter by %1$s',
												'snow-monkey-blocks'
											),
											taxonomyTerms.label
										) }
										noOptionLabel="-"
										onChange={ ( value ) => {
											setAttributes( {
												termId: toNumber( value ),
												taxonomy:
													taxonomyTerms.taxonomy,
											} );
										} }
										selectedId={ termId }
										tree={ buildTermsTree(
											taxonomyTerms.terms
										) }
									/>
								);
							} ) }
						</ToolsPanelItem>
					) }

					<ToolsPanelItem
						hasValue={ () =>
							postsPerPage !==
							metadata.attributes.postsPerPage.default
						}
						isShownByDefault
						label={ __( 'Number of posts', 'snow-monkey-blocks' ) }
						onDeselect={ () =>
							setAttributes( {
								postsPerPage:
									metadata.attributes.postsPerPage.default,
							} )
						}
					>
						<RangeControl
							label={ __(
								'Number of posts',
								'snow-monkey-blocks'
							) }
							value={ postsPerPage }
							onChange={ ( value ) =>
								setAttributes( {
									postsPerPage: toNumber( value, 1, 12 ),
								} )
							}
							min="1"
							max="12"
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						hasValue={ () =>
							layout !== metadata.attributes.layout.default
						}
						isShownByDefault
						label={ __( 'Layout', 'snow-monkey-blocks' ) }
						onDeselect={ () =>
							setAttributes( {
								layout: metadata.attributes.layout.default,
							} )
						}
					>
						<SelectControl
							label={ __( 'Layout', 'snow-monkey-blocks' ) }
							value={ layout }
							onChange={ ( value ) =>
								setAttributes( {
									layout: value,
								} )
							}
							options={ [
								{
									value: 'rich-media',
									label: __(
										'Rich media',
										'snow-monkey-blocks'
									),
								},
								{
									value: 'simple',
									label: __( 'Simple', 'snow-monkey-blocks' ),
								},
								{
									value: 'text',
									label: __( 'Text', 'snow-monkey-blocks' ),
								},
								{
									value: 'text2',
									label: __( 'Text 2', 'snow-monkey-blocks' ),
								},
								{
									value: 'panel',
									label: __( 'Panels', 'snow-monkey-blocks' ),
								},
								{
									value: 'carousel',
									label: sprintf(
										// translators: %1$s: Layout
										__(
											'Carousel (%1$s)',
											'snow-monkey-blocks'
										),
										__( 'Rich media', 'snow-monkey-blocks' )
									),
								},
								{
									value: 'large-image',
									label: __(
										'Large image',
										'snow-monkey-blocks'
									),
								},
							] }
						/>
					</ToolsPanelItem>

					{ 'carousel' === layout && (
						<>
							<ToolsPanelItem
								hasValue={ () =>
									arrows !==
									metadata.attributes.arrows.default
								}
								isShownByDefault
								label={ __(
									'Display arrows',
									'snow-monkey-blocks'
								) }
								onDeselect={ () =>
									setAttributes( {
										arrows: metadata.attributes.arrows
											.default,
									} )
								}
							>
								<ToggleControl
									label={ __(
										'Display arrows',
										'snow-monkey-blocks'
									) }
									checked={ arrows }
									onChange={ ( value ) =>
										setAttributes( {
											arrows: value,
										} )
									}
								/>
							</ToolsPanelItem>

							<ToolsPanelItem
								hasValue={ () =>
									dots !== metadata.attributes.dots.default
								}
								isShownByDefault
								label={ __(
									'Display dots',
									'snow-monkey-blocks'
								) }
								onDeselect={ () =>
									setAttributes( {
										dots: metadata.attributes.dots.default,
									} )
								}
							>
								<ToggleControl
									label={ __(
										'Display dots',
										'snow-monkey-blocks'
									) }
									checked={ dots }
									onChange={ ( value ) =>
										setAttributes( {
											dots: value,
										} )
									}
								/>
							</ToolsPanelItem>

							<ToolsPanelItem
								hasValue={ () =>
									interval !==
									metadata.attributes.interval.default
								}
								isShownByDefault
								label={ __(
									'Autoplay Speed in seconds',
									'snow-monkey-blocks'
								) }
								onDeselect={ () =>
									setAttributes( {
										interval:
											metadata.attributes.interval
												.default,
									} )
								}
							>
								<RangeControl
									label={ __(
										'Autoplay Speed in seconds',
										'snow-monkey-blocks'
									) }
									help={ __(
										'If "0", no scroll.',
										'snow-monkey-blocks'
									) }
									value={ interval }
									onChange={ ( value ) =>
										setAttributes( {
											interval: toNumber( value, 0, 10 ),
										} )
									}
									min="0"
									max="10"
								/>
							</ToolsPanelItem>
						</>
					) }

					<ToolsPanelItem
						hasValue={ () =>
							itemTitleTagName !==
							metadata.attributes.itemTitleTagName.default
						}
						isShownByDefault
						label={ __(
							'Title tag of each items',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								itemTitleTagName:
									metadata.attributes.itemTitleTagName
										.default,
							} )
						}
					>
						<BaseControl
							label={ __(
								'Title tag of each items',
								'snow-monkey-blocks'
							) }
							id="snow-monkey-blocks/recent-posts/item-title-tag-name"
						>
							<div className="smb-list-icon-selector">
								{ times(
									itemTitleTagNames.length,
									( index ) => {
										const onClickItemTitleTagName = () =>
											setAttributes( {
												itemTitleTagName:
													itemTitleTagNames[ index ],
											} );

										return (
											<Button
												variant={
													itemTitleTagName ===
													itemTitleTagNames[ index ]
														? 'primary'
														: 'secondary'
												}
												onClick={
													onClickItemTitleTagName
												}
												key={ index }
											>
												{ itemTitleTagNames[ index ] }
											</Button>
										);
									}
								) }
							</div>
						</BaseControl>
					</ToolsPanelItem>

					<ToolsPanelItem
						hasValue={ () =>
							itemThumbnailSizeSlug !==
							metadata.attributes.itemThumbnailSizeSlug.default
						}
						isShownByDefault
						label={ __(
							'Images size of each items',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								itemThumbnailSizeSlug:
									metadata.attributes.itemThumbnailSizeSlug
										.default,
							} )
						}
					>
						<SelectControl
							label={ __(
								'Images size of each items',
								'snow-monkey-blocks'
							) }
							value={ itemThumbnailSizeSlug }
							options={ itemThumbnailSizeSlugOption }
							onChange={ ( value ) =>
								setAttributes( {
									itemThumbnailSizeSlug: value,
								} )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						hasValue={ () =>
							forceDisplayItemMeta !==
							metadata.attributes.forceDisplayItemMeta.default
						}
						isShownByDefault
						label={ __(
							'Force display meta of each items',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								forceDisplayItemMeta:
									metadata.attributes.forceDisplayItemMeta
										.default,
							} )
						}
					>
						<ToggleControl
							label={ __(
								'Force display meta of each items',
								'snow-monkey-blocks'
							) }
							help={ __(
								"If it's already displayed, this setting will be ignored.",
								'snow-monkey-blocks'
							) }
							checked={ forceDisplayItemMeta }
							onChange={ ( value ) =>
								setAttributes( {
									forceDisplayItemMeta: value,
								} )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						hasValue={ () =>
							forceDisplayItemTerms !==
							metadata.attributes.forceDisplayItemTerms.default
						}
						isShownByDefault
						label={ __(
							'Force display category label of each items',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								forceDisplayItemTerms:
									metadata.attributes.forceDisplayItemTerms
										.default,
							} )
						}
					>
						<ToggleControl
							label={ __(
								'Force display category label of each items',
								'snow-monkey-blocks'
							) }
							help={ __(
								"If it's already displayed, this setting will be ignored.",
								'snow-monkey-blocks'
							) }
							checked={ forceDisplayItemTerms }
							onChange={ ( value ) =>
								setAttributes( {
									forceDisplayItemTerms: value,
								} )
							}
						/>
					</ToolsPanelItem>

					{ ( 'rich-media' === layout || 'panel' === layout ) && (
						<ToolsPanelItem
							hasValue={ () =>
								smCols !== metadata.attributes.smCols.default
							}
							isShownByDefault
							label={ __(
								'Number of columns displayed on mobile device',
								'snow-monkey-blocks'
							) }
							onDeselect={ () =>
								setAttributes( {
									smCols: metadata.attributes.smCols.default,
								} )
							}
						>
							<SelectControl
								label={ __(
									'Number of columns displayed on mobile device',
									'snow-monkey-blocks'
								) }
								value={ smCols }
								onChange={ ( value ) =>
									setAttributes( {
										smCols: toNumber( value ),
									} )
								}
								options={ [
									{
										value: 0,
										label: __(
											'Default',
											'snow-monkey-blocks'
										),
									},
									{
										value: 1,
										label: __(
											'1 column',
											'snow-monkey-blocks'
										),
									},
									{
										value: 2,
										label: __(
											'2 columns',
											'snow-monkey-blocks'
										),
									},
								] }
							/>
						</ToolsPanelItem>
					) }

					<ToolsPanelItem
						hasValue={ () =>
							ignoreStickyPosts !==
							metadata.attributes.ignoreStickyPosts.default
						}
						isShownByDefault
						label={ __(
							'Ignore sticky posts',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								ignoreStickyPosts:
									metadata.attributes.ignoreStickyPosts
										.default,
							} )
						}
					>
						<ToggleControl
							label={ __(
								'Ignore sticky posts',
								'snow-monkey-blocks'
							) }
							checked={ ignoreStickyPosts }
							onChange={ ( value ) =>
								setAttributes( {
									ignoreStickyPosts: value,
								} )
							}
						/>
					</ToolsPanelItem>

					<ToolsPanelItem
						hasValue={ () =>
							noPostsText !==
							metadata.attributes.noPostsText.default
						}
						isShownByDefault
						label={ __(
							'Text if no posts matched',
							'snow-monkey-blocks'
						) }
						onDeselect={ () =>
							setAttributes( {
								noPostsText:
									metadata.attributes.noPostsText.default,
							} )
						}
					>
						<TextareaControl
							label={ __(
								'Text if no posts matched',
								'snow-monkey-blocks'
							) }
							help={ __( 'Allow HTML', 'snow-monkey-blocks' ) }
							value={ noPostsText || '' }
							onChange={ ( value ) =>
								setAttributes( {
									noPostsText: value,
								} )
							}
						/>
					</ToolsPanelItem>
				</ToolsPanel>
			</InspectorControls>

			<div { ...useBlockProps() }>
				{ ! allPostTypes ? (
					<Placeholder
						icon="editor-ul"
						label={ __( 'Recent posts', 'snow-monkey-blocks' ) }
					>
						<Spinner />
					</Placeholder>
				) : (
					<Disabled>
						<ServerSideRender
							block="snow-monkey-blocks/recent-posts"
							attributes={ attributes }
						/>
					</Disabled>
				) }
			</div>
		</>
	);
}
