<?php
/*
Plugin Name: Super Emoji Plus+
Version: 0.1
*/


add_action( 'admin_enqueue_scripts', function( $hook_suffix ) {
  $load_on = array( 'post.php', 'post-new.php' );
  if ( ! in_array( $hook_suffix, $load_on ) ) {
    return;
  }
  echo '<style>
  .mce-container .emoji-buttons-outer-wrapper {
    height: 219px;
    width: 500px;
    overflow-x: scroll;
  }
  .mce-container .emoji-buttons-inner-wrapper {
    width: 10000px;
  }
  .mce-container .emoji-button-column {
    float: left;
  }
  .emoji-button-column button {
    display: block;
    padding: 4px;
  }
  .emoji-button-column img {
    font-size: 24px;
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