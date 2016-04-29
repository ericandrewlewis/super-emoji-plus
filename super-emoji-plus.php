<?php
/*
Plugin Name: Super Emoji Plus+
Description: Insert Emoji in your post content editor.
Author: Eric Andrew Lewis
Version: 0.1
Author URI: https://ericandrewlewis.com/
*/

add_action( 'admin_enqueue_scripts', function( $hook_suffix ) {
  $load_on = array( 'post.php', 'post-new.php' );
  if ( ! in_array( $hook_suffix, $load_on ) ) {
    return;
  }
  echo '<style>
  .mce-container .sep-emoji-autocomplete {
    width: 232px;
    padding: 5px;
    margin: 10px;
  }
  .mce-container .emoji-buttons-wrapper {
    height: 181px;
    width: 252px;
    margin: 0 7px 15px;
    overflow-x: hidden;
    overflow-y: hidden;
    white-space: normal;
  }
  .mce-container .emoji-buttons-wrapper button {
    margin: 2px;
  }
  .mce-container .emoji-buttons-wrapper img.emoji {
    font-size: 24px;
  }
  i.mce-i-sep_emoji {
    font: normal 20px/1 dashicons;
    padding: 0;
    vertical-align: top;
    speak: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin-left: -2px;
    padding-right: 2px;
  }
  i.mce-i-sep_emoji:before {
    content: "\f328";
  }
  </style>';
});

add_filter( 'mce_external_plugins', function( $plugins ) {
	$plugins['sep_emoji'] = plugins_url( '/script.js', __FILE__ );
	return $plugins;
});

add_filter( 'mce_buttons', function($buttons) {
	$buttons[] = 'sep_emoji';
	return $buttons;
});
