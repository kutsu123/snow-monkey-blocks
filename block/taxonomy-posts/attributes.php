<?php
/**
 * @package snow-monkey-blocks
 * @author inc2734
 * @license GPL-2.0+
 */

return [
	'taxonomy' => [
		'type'    => 'string',
		'default' => null,
	],
	'termId' => [
		'type'    => 'number',
		'default' => 0,
	],
	'postsPerPage' => [
		'type'    => 'number',
		'default' => 6,
	],
	'layout' => [
		'type'    => 'string',
		'default' => 'rich-media',
	],
	'ignoreStickyPosts' => [
		'type'    => 'boolean',
		'default' => true,
	],
	'noPostsText' => [
		'type'    => 'string',
		'default' => '',
	],
	'className' => [
		'type'    => 'string',
		'default' => '',
	],
	'myAnchor' => [
		'type'    => 'string',
		'default' => '',
	],
];
