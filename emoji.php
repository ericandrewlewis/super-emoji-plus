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
  .mce-container .emoji-buttons-outer-wrapper {
    height: 190px;
    width: 300px;
    overflow-x: scroll;
    overflow-y: hidden;
  }
  .mce-container .emoji-buttons-inner-wrapper {
    direction: rtl;
    /*
    Move the div to prepare it for rotation:
    x = ( width / 2 ) - (width / 2)
    y = - ( (height / 2) - (width / 2) )
     */
    -webkit-transform: translate(419px,-419px) rotate(-90deg);
    -moz-transform: translate(419px,-419px) rotate(-90deg);
    width: 162px;
    height: 1000px;
    unicode-bidi: bidi-override;
    white-space: normal;
  }
  .mce-container .emoji-buttons-inner-wrapper img.emoji {
    font-size: 24px;
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
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
