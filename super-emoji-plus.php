<?php
/*
Plugin Name: Super Emoji Plus+
Description: Insert Emoji in your post content editor.
Author: Eric Andrew Lewis
Version: 0.1.1
Author URI: https://ericandrewlewis.com/
*/

function sep_admin_enqueue_scripts( $hook_suffix ) {
  $load_on = array( 'post.php', 'post-new.php' );
  if ( ! in_array( $hook_suffix, $load_on ) ) {
    return;
  }
  echo '<style>
  /** Use .sep-emoji-input as a selector to override specificity of TinyMCE default styles. **/
  .sep-emoji-input .sep-emoji-autocomplete {
    width: 232px;
    padding: 5px;
    margin: 10px 10px 0 10px;
  }
  .sep-emoji-input.text-input-hidden .sep-emoji-autocomplete {
    display: none;
  }
  .sep-emoji-input .sep-emoji-buttons {
    height: 116px;
    width: 232px;
    margin: 10px 7px 15px;
    overflow-x: hidden;
    overflow-y: hidden;
    white-space: normal;
  }
  .sep-emoji-input .sep-emoji-buttons button {
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;
  }
  .sep-emoji-input .sep-emoji-buttons button.does-not-match-filter {
    display: none;
  }
  .sep-emoji-input .sep-emoji-buttons button.selected {
    background-color: #C5C2C2;
  }
  .sep-emoji-input .sep-emoji-buttons button:hover {
    background-color: #E4E4E4;
  }
  .sep-emoji-input .sep-emoji-buttons img.emoji {
    font-size: 24px;
  }
  .sep-emoji-input .sep-emoji-buttons img.emoji {
    font-size: 24px;
  }
  .sep-emoji-input .sep-emoji-buttons-and-navigation {
    width: 262px;
    height: 136px;
    position: relative;
  }
  .sep-emoji-input .sep-emoji-navigation {
    position: absolute;
    left: 237px;
    top: 35px;
  }
  .sep-emoji-input .sep-emoji-navigation button {
    cursor: pointer;
  }
  .sep-emoji-input .sep-emoji-navigation [data-navigation-direction="down"] {
    position: absolute;
    top: 30px;
    left: 0;
  }
  i.mce-i-sep_emoji, i.sep-i-up, i.sep-i-down {
    font: normal 20px/1 dashicons;
    padding: 0;
    vertical-align: top;
    speak: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin-left: -2px;
    padding-right: 2px;
  }
  i.sep-i-up:before {
    content: "\f342";
  }
  i.sep-i-down:before {
    content: "\f346";
  }
  i.mce-i-sep_emoji:before {
    content: "\f328";
  }
  </style>';
}
add_action( 'admin_enqueue_scripts', 'sep_admin_enqueue_scripts');

function sep_mce_external_plugin( $plugins ) {
  $plugins['sep_emoji'] = plugins_url( '/script.js', __FILE__ );
  return $plugins;
}
add_filter( 'mce_external_plugins', 'sep_mce_external_plugin' );

function sep_mce_buttons( $buttons ) {
	$buttons[] = 'sep_emoji';
	return $buttons;
}
add_filter( 'mce_buttons', 'sep_mce_buttons');
