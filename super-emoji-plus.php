<?php
/*
Plugin Name: Super Emoji Plus+
Description: Insert Emoji in your post content editor.
Author: Eric Andrew Lewis
Version: 0.1.4
Author URI: https://ericandrewlewis.com/
*/

define( 'SEP_VERSION', '0.1.4' );

function sep_wp_enqueue_editor() {
  wp_enqueue_style( 'sep-style', plugins_url( '/style.css', __FILE__ ) . '?version=' . SEP_VERSION );
}
add_action( 'wp_enqueue_editor', 'sep_wp_enqueue_editor' );

function sep_mce_external_plugin( $plugins ) {
  // Append a version number to bust cache appropriately.
  $plugins['sep_emoji'] = plugins_url( '/script.js', __FILE__ ) . '?version=' . SEP_VERSION;
  return $plugins;
}
add_filter( 'mce_external_plugins', 'sep_mce_external_plugin' );

function sep_mce_buttons( $buttons ) {
	$buttons[] = 'sep_emoji';
	return $buttons;
}
add_filter( 'mce_buttons', 'sep_mce_buttons');
