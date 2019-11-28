<?php
/**
 * @package snow-monkey-blocks
 * @author inc2734
 * @license GPL-2.0+
 */

use Snow_Monkey\Plugin\Blocks;

$asset = include( SNOW_MONKEY_BLOCKS_DIR_PATH . '/dist/block/section/editor.asset.php' );

wp_register_script(
	'snow-monkey-blocks/section/editor',
	SNOW_MONKEY_BLOCKS_DIR_URL . '/dist/block/section/editor.js',
	array_merge( $asset['dependencies'], [ 'snow-monkey-blocks-editor' ] ),
	filemtime( SNOW_MONKEY_BLOCKS_DIR_PATH . '/dist/block/section/editor.js' ),
	true
);

wp_register_script(
	'snow-monkey-blocks/section/nopro',
	SNOW_MONKEY_BLOCKS_DIR_URL . '/dist/block/section/nopro.js',
	[],
	filemtime( SNOW_MONKEY_BLOCKS_DIR_PATH . '/dist/block/section/nopro.js' ),
	true
);

wp_register_style(
	'snow-monkey-blocks/section',
	SNOW_MONKEY_BLOCKS_DIR_URL . '/dist/block/section/front.css',
	[ 'snow-monkey-blocks' ],
	filemtime( SNOW_MONKEY_BLOCKS_DIR_PATH . '/dist/block/section/front.css' )
);

wp_register_style(
	'snow-monkey-blocks/section/nopro',
	SNOW_MONKEY_BLOCKS_DIR_URL . '/dist/block/section/nopro.css',
	[],
	filemtime( SNOW_MONKEY_BLOCKS_DIR_PATH . '/dist/block/section/nopro.css' )
);

register_block_type(
	'snow-monkey-blocks/section',
	[
		'script'        => ! Blocks\is_pro() && ! is_admin() ? 'snow-monkey-blocks/section/nopro' : null,
		'style'         => ! Blocks\is_pro() ? 'snow-monkey-blocks/section/nopro' : 'snow-monkey-blocks/section',
		'editor_script' => 'snow-monkey-blocks/section/editor',
	]
);
