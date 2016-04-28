( function( tinymce ) {

  // keep this in this scope so it can be shared idk figure this out.
  var _editor = null;


  // I guess this is necessary? It is non-trivial to create a Unicode string
  // outside of the basic multilingual plane.
  function fromCodePoint() {
    var chars= Array.prototype.slice.call(arguments);
    for (var i= chars.length; i-->0;) {
      var n = chars[i]-0x10000;
      if (n>=0)
        chars.splice(i, 1, 0xD800+(n>>10), 0xDC00+(n&0x3FF));
    }
    return String.fromCharCode.apply(null, chars);
  }

  var emojiList = [0x1f600,0x1f601,0x1f602,0x1f603,0x1f604,0x1f605,0x1f606,0x1f607,0x1f608,0x1f47f,0x1f609,0x1f635,0x1f636,0x1f637,0x1f638,0x1f639,0x1f63a,0x1f63b,0x1f63c,0x1f63d,0x1f63e,0x1f63f,0x1f485,0x1f442,0x1f440,0x1f443,0x1f444,0x1f60a,0x263a,0x1f60b,0x1f60c,0x1f60d,0x1f60e,0x1f60f,0x1f610,0x1f611,0x1f612,0x1f613,0x1f640,0x1f463,0x1f464,0x1f465,0x1f466,0x1f467,0x1f468,0x1f469,0x1f46a,0x1f46b,0x1f48b,0x1f445,0x1f44b,0x1f44d,0x1f44e,0x1f449,0x1f614,0x1f615,0x1f616,0x1f617,0x1f618,0x1f619,0x1f61a,0x1f61b,0x1f61c,0x1f61d,0x1f61e,0x1f46c,0x1f46d,0x1f46e,0x1f46f,0x1f470,0x1f471,0x1f472,0x1f473,0x1f474,0x1f475,0x1f476,0x261d,0x1f446,0x1f447,0x1f448,0x270b,0x1f61f,0x1f620,0x1f621,0x1f622,0x1f623,0x1f624,0x1f625,0x1f626,0x1f627,0x1f628,0x1f629,0x1f477,0x1f478,0x1f482,0x1f47c,0x1f385,0x1f47b,0x1f479,0x1f47a,0x1f4a9,0x1f480,0x1f47d,0x1f44c,0x270c,0x1f44a,0x270a,0x1f62a,0x1f62b,0x1f62c,0x1f62d,0x1f62e,0x1f62f,0x1f630,0x1f631,0x1f632,0x1f633,0x1f634,0x1f47e,0x1f647,0x1f481,0x1f645,0x1f646,0x1f64b,0x1f64e,0x1f486,0x1f487,0x1f48f,0x1f4aa,0x1f450,0x1f64c,0x1f44f,0x1f64f];

	tinymce.ui.SEPEmojiInput = tinymce.ui.Control.extend( {
		renderHtml: function() {
      var buttonHtml = '<div class="emoji-buttons-outer-wrapper">';
      buttonHtml += '<div class="emoji-buttons-inner-wrapper">';
      for ( i = 0; i < emojiList.length; i++ ) {
        if ( i % 6 == 0 ) {
          buttonHtml += '<div class="emoji-button-column">';
        }
        buttonHtml += '<button data-code-point="' + emojiList[i] + '" type="button">' + fromCodePoint( emojiList[i] ) + '</button>';
        if ( i % 6 == 5 || i == emojiList.length - 1 ) {
          buttonHtml += '</div>';
        }
      }
      buttonHtml += '</div></div>';
			return (
				'<div id="' + this._id + '" class="sep-emoji-input">' +
					'<input type="text" value="" placeholder="' + tinymce.translate( 'Paste URL or type to search' ) + '" />' +
					buttonHtml +
				'</div>'
			);
		},
		setURL: function( url ) {
			this.getEl().firstChild.value = url;
		},
		getURL: function() {
			return tinymce.trim( this.getEl().firstChild.value );
		},
		getLinkText: function() {
			var text = this.getEl().firstChild.nextSibling.value;

			if ( ! tinymce.trim( text ) ) {
				return '';
			}

			return text.replace( /[\r\n\t ]+/g, ' ' );
		},
		reset: function() {
			var urlInput = this.getEl().firstChild;

			urlInput.value = '';
			urlInput.nextSibling.value = '';
		},
    postRender: function() {
      // debugger;
      jQuery('#' +this._id).find('button').on('click', function() {
        _editor.execCommand( 'mceInsertContent', false, fromCodePoint( jQuery(this).data('code-point') ) );
      });
    }
	} );

	tinymce.PluginManager.add( 'sep_emoji', function( editor ) {
    _editor = editor;
		var toolbar;
		var editToolbar;
		var previewInstance;
		var inputInstance;
		var linkNode;
		var doingUndoRedo;
		var doingUndoRedoTimer;
		var $ = window.jQuery;

    // A dumb piece of state to open the toolbar on the next `wptoolbar` event call.
    var openTheToolbar = false;

		function getSelectedLink() {
			var href, html,
				node = editor.selection.getNode(),
				link = editor.dom.getParent( node, 'a[href]' );

			if ( ! link ) {
				html = editor.selection.getContent({ format: 'raw' });

				if ( html && html.indexOf( '</a>' ) !== -1 ) {
					href = html.match( /href="([^">]+)"/ );

					if ( href && href[1] ) {
						link = editor.$( 'a[href="' + href[1] + '"]', node )[0];
					}

					if ( link ) {
						editor.selection.select( link );
					}
				}
			}

			return link;
		}

		function removePlaceholders() {
			editor.$( 'a' ).each( function( i, element ) {
				var $element = editor.$( element );

				if ( $element.attr( 'href' ) === '_wp_link_placeholder' ) {
					editor.dom.remove( element, true );
				} else if ( $element.attr( 'data-wplink-edit' ) ) {
					$element.attr( 'data-wplink-edit', null );
				}
			});
		}

		function removePlaceholderStrings( content, dataAttr ) {
			if ( dataAttr ) {
				content = content.replace( / data-wplink-edit="true"/g, '' );
			}

			return content.replace( /<a [^>]*?href="_wp_link_placeholder"[^>]*>([\s\S]+)<\/a>/g, '$1' );
		}

		editor.on( 'preinit', function() {
			if ( editor.wp && editor.wp._createToolbar ) {
        // toolbar = editor.wp._createToolbar( [
				// 	'wp_link_preview',
				// 	'wp_link_edit',
				// 	'wp_link_remove'
				// ], true );
        //
				var insertButtons = ['sep_emoji_input'];

				// if ( typeof window.wpLink !== 'undefined' ) {
					// editButtons.push( 'wp_link_advanced' );
				// }

        // Create the inline toolbar, which is what pops-up for the user
        // to select their emoji in.
				editToolbar = editor.wp._createToolbar( insertButtons, true );

				editToolbar.on( 'show', function() {
					if ( ! tinymce.$( document.body ).hasClass( 'modal-open' ) ) {
            // Set an immediate timeout presumably to avoid some race condition.
						window.setTimeout( function() {
							var element = editToolbar.$el.find( 'input.ui-autocomplete-input' )[0],
								selection = linkNode && ( linkNode.textContent || linkNode.innerText );

							if ( element ) {
								// if ( ! element.value && selection && typeof window.wpLink !== 'undefined' ) {
								// 	element.value = window.wpLink.getUrlFromSelection( selection );
								// }

								if ( ! doingUndoRedo ) {
									element.focus();
									element.select();
								}
							}
						} );
					}
				} );

				editToolbar.on( 'hide', function() {
					// if ( ! editToolbar.scrolling ) {
						// editor.execCommand( 'wp_link_cancel' );
					// }
				} );
			}
		} );

    /**
     * This is some sort of "command" that is invoked when I press the toolbar
     * button, which will set dumb global state properly so our `wptoolbar`
     * handler will open the toolbar.
     */
		editor.addCommand( 'SEP_Emoji', function() {
      openTheToolbar = true;
			editor.nodeChanged();
		} );

		// editor.addCommand( 'wp_link_apply', function() {
		// 	if ( editToolbar.scrolling ) {
		// 		return;
		// 	}
    //   return;
		// 	var href, text;
    //
		// 	if ( linkNode ) {
		// 		href = inputInstance.getURL();
		// 		text = inputInstance.getLinkText();
		// 		editor.focus();
    //
		// 		if ( ! href ) {
		// 			editor.dom.remove( linkNode, true );
		// 			return;
		// 		}
    //
		// 		if ( ! /^(?:[a-z]+:|#|\?|\.|\/)/.test( href ) ) {
		// 			href = 'http://' + href;
		// 		}
    //
		// 		editor.dom.setAttribs( linkNode, { href: href, 'data-wplink-edit': null } );
    //
		// 		if ( ! tinymce.trim( linkNode.innerHTML ) ) {
		// 			editor.$( linkNode ).text( text || href );
		// 		}
		// 	}
    //
		// 	inputInstance.reset();
		// 	editor.nodeChanged();
    //
		// 	// Audible confirmation message when a link has been inserted in the Editor.
		// 	if ( typeof window.wp !== 'undefined' && window.wp.a11y && typeof window.wpLinkL10n !== 'undefined' ) {
		// 		window.wp.a11y.speak( window.wpLinkL10n.linkInserted );
		// 	}
		// } );

		// editor.addCommand( 'wp_link_cancel', function() {
		// 	if ( ! editToolbar.tempHide ) {
		// 		inputInstance.reset();
		// 		removePlaceholders();
		// 		editor.focus();
		// 		editToolbar.tempHide = false;
		// 	}
		// } );

		// WP default shortcut
		// editor.addShortcut( 'access+a', '', 'SEP_Emoji' );
		// The "de-facto standard" shortcut, see #27305
		// editor.addShortcut( 'meta+k', '', 'SEP_Emoji' );

		editor.addButton( 'sep_emoji', {
			icon: 'link',
			tooltip: 'Insert Emoji',
			cmd: 'SEP_Emoji',
			stateSelector: ''
		});

		// editor.addButton( 'unlink', {
		// 	icon: 'unlink',
		// 	tooltip: 'Remove link',
		// 	cmd: 'unlink'
		// });

		// editor.addMenuItem( 'link', {
		// 	icon: 'link',
		// 	text: 'Insert/edit link',
		// 	cmd: 'SEP_Emoji',
		// 	stateSelector: 'a[href]',
		// 	context: 'insert',
		// 	prependToContext: true
		// });

		// editor.on( 'pastepreprocess', function( event ) {
		// 	var pastedStr = event.content,
		// 		regExp = /^(?:https?:)?\/\/\S+$/i;
    //
		// 	if ( ! editor.selection.isCollapsed() && ! regExp.test( editor.selection.getContent() ) ) {
		// 		pastedStr = pastedStr.replace( /<[^>]+>/g, '' );
		// 		pastedStr = tinymce.trim( pastedStr );
    //
		// 		if ( regExp.test( pastedStr ) ) {
		// 			editor.execCommand( 'mceInsertLink', false, {
		// 				href: editor.dom.decode( pastedStr )
		// 			} );
    //
		// 			event.preventDefault();
		// 		}
		// 	}
		// } );

		// Remove any remaining placeholders on saving.
		// editor.on( 'savecontent', function( event ) {
		// 	event.content = removePlaceholderStrings( event.content, true );
		// });

		// Prevent adding undo levels on inserting link placeholder.
		// editor.on( 'BeforeAddUndo', function( event ) {
		// 	if ( event.lastLevel && event.lastLevel.content && event.level.content &&
		// 		event.lastLevel.content === removePlaceholderStrings( event.level.content ) ) {
    //
		// 		event.preventDefault();
		// 	}
		// });

		// When doing undo and redo with keyboard shortcuts (Ctrl|Cmd+Z, Ctrl|Cmd+Shift+Z, Ctrl|Cmd+Y),
		// set a flag to not focus the inline dialog. The editor has to remain focused so the users can do consecutive undo/redo.
		// editor.on( 'keydown', function( event ) {
		// 	if ( event.altKey || ( tinymce.Env.mac && ( ! event.metaKey || event.ctrlKey ) ) ||
		// 		( ! tinymce.Env.mac && ! event.ctrlKey ) ) {
    //
		// 		return;
		// 	}
    //
		// 	if ( event.keyCode === 89 || event.keyCode === 90 ) { // Y or Z
		// 		doingUndoRedo = true;
    //
		// 		window.clearTimeout( doingUndoRedoTimer );
		// 		doingUndoRedoTimer = window.setTimeout( function() {
		// 			doingUndoRedo = false;
		// 		}, 500 );
		// 	}
		// } );

		// editor.addButton( 'wp_link_preview', {
		// 	type: 'WPLinkPreview',
		// 	onPostRender: function() {
		// 		previewInstance = this;
		// 	}
		// } );

		editor.addButton( 'sep_emoji_input', {
			type: 'SEPEmojiInput',
			onPostRender: function() {
				var element = this.getEl(),
					input = element.firstChild,
					$input, cache, last;

				inputInstance = this;

				if ( $ && $.ui && $.ui.autocomplete ) {
					$input = $( input );

					$input.on( 'keydown', function() {
						$input.removeAttr( 'aria-activedescendant' );
					} )
					.autocomplete( {
						source: function( request, response ) {
							if ( last === request.term ) {
								response( cache );
								return;
							}

							if ( /^https?:/.test( request.term ) || request.term.indexOf( '.' ) !== -1 ) {
								return response();
							}

							$.post( window.ajaxurl, {
								action: 'wp-link-ajax',
								page: 1,
								search: request.term,
								_ajax_linking_nonce: $( '#_ajax_linking_nonce' ).val()
							}, function( data ) {
								cache = data;
								response( data );
							}, 'json' );

							last = request.term;
						},
						focus: function( event, ui ) {
							$input.attr( 'aria-activedescendant', 'mce-wp-autocomplete-' + ui.item.ID );
							/*
							 * Don't empty the URL input field, when using the arrow keys to
							 * highlight items. See api.jqueryui.com/autocomplete/#event-focus
							 */
							event.preventDefault();
						},
						select: function( event, ui ) {
							$input.val( ui.item.permalink );
							$( element.firstChild.nextSibling ).val( ui.item.title );

							if ( 9 === event.keyCode && typeof window.wp !== 'undefined' &&
								window.wp.a11y && typeof window.wpLinkL10n !== 'undefined' ) {
								// Audible confirmation message when a link has been selected.
								window.wp.a11y.speak( window.wpLinkL10n.linkSelected );
							}

							return false;
						},
						open: function() {
							$input.attr( 'aria-expanded', 'true' );
							editToolbar.blockHide = true;
						},
						close: function() {
							$input.attr( 'aria-expanded', 'false' );
							editToolbar.blockHide = false;
						},
						minLength: 2,
						position: {
							my: 'left top+2'
						},
						messages: {
							noResults: ( typeof window.uiAutocompleteL10n !== 'undefined' ) ? window.uiAutocompleteL10n.noResults : '',
							results: function( number ) {
								if ( typeof window.uiAutocompleteL10n !== 'undefined' ) {
									if ( number > 1 ) {
										return window.uiAutocompleteL10n.manyResults.replace( '%d', number );
									}

									return window.uiAutocompleteL10n.oneResult;
								}
							}
						}
					} ).autocomplete( 'instance' )._renderItem = function( ul, item ) {
						return $( '<li role="option" id="mce-wp-autocomplete-' + item.ID + '">' )
						.append( '<span>' + item.title + '</span>&nbsp;<span class="wp-editor-float-right">' + item.info + '</span>' )
						.appendTo( ul );
					};

					$input.attr( {
						'role': 'combobox',
						'aria-autocomplete': 'list',
						'aria-expanded': 'false',
						'aria-owns': $input.autocomplete( 'widget' ).attr( 'id' )
					} )
					.on( 'focus', function() {
						var inputValue = $input.val();
						/*
						 * Don't trigger a search if the URL field already has a link or is empty.
						 * Also, avoids screen readers announce `No search results`.
						 */
						if ( inputValue && ! /^https?:/.test( inputValue ) ) {
							$input.autocomplete( 'search' );
						}
					} )
					// Returns a jQuery object containing the menu element.
					.autocomplete( 'widget' )
						.addClass( 'wplink-autocomplete' )
						.attr( 'role', 'listbox' )
						.removeAttr( 'tabindex' ) // Remove the `tabindex=0` attribute added by jQuery UI.
						/*
						 * Looks like Safari and VoiceOver need an `aria-selected` attribute. See ticket #33301.
						 * The `menufocus` and `menublur` events are the same events used to add and remove
						 * the `ui-state-focus` CSS class on the menu items. See jQuery UI Menu Widget.
						 */
						.on( 'menufocus', function( event, ui ) {
							ui.item.attr( 'aria-selected', 'true' );
						})
						.on( 'menublur', function() {
							/*
							 * The `menublur` event returns an object where the item is `null`
							 * so we need to find the active item with other means.
							 */
							$( this ).find( '[aria-selected="true"]' ).removeAttr( 'aria-selected' );
						});
				}

				tinymce.$( input ).on( 'keydown', function( event ) {
					if ( event.keyCode === 13 ) {
						editor.execCommand( 'wp_link_apply' );
						event.preventDefault();
					}
				} );
			}
		} );

    // On the `wptoolbar` event, set the toolbar if we should.
		editor.on( 'wptoolbar', function( event ) {
			// var linkNode = editor.dom.getParent( event.element, 'a' ),
			// 	$linkNode, href, edit;
      //
			// if ( tinymce.$( document.body ).hasClass( 'modal-open' ) ) {
			// 	editToolbar.tempHide = true;
			// 	return;
			// }
      //
			// editToolbar.tempHide = false;
      // event.element = linkNode;
      if ( openTheToolbar ) {
        openTheToolbar = false;
        event.toolbar = editToolbar;
      }
      return;
			if ( linkNode ) {
				$linkNode = editor.$( linkNode );
				href = $linkNode.attr( 'href' );
				edit = $linkNode.attr( 'data-wplink-edit' );

				if ( href === '_wp_link_placeholder' || edit ) {
					if ( href !== '_wp_link_placeholder' && ! inputInstance.getURL() ) {
						inputInstance.setURL( href );
					}

					event.element = linkNode;
					event.toolbar = editToolbar;
				} else if ( href && ! $linkNode.find( 'img' ).length ) {
					previewInstance.setURL( href );
					event.element = linkNode;
					event.toolbar = toolbar;
				}
			}
		} );

    // editor.addButton( 'wp_link_edit', {
		// 	tooltip: 'Edit ', // trailing space is needed, used for context
		// 	icon: 'dashicon dashicons-edit',
		// 	cmd: 'SEP_Emoji'
		// } );

    // editor.addButton( 'wp_link_edit', {
		// 	tooltip: 'Edit ', // trailing space is needed, used for context
		// 	icon: 'dashicon dashicons-edit',
		// 	cmd: 'SEP_Emoji'
		// } );

		// editor.addButton( 'wp_link_remove', {
		// 	tooltip: 'Remove',
		// 	icon: 'dashicon dashicons-no',
		// 	cmd: 'unlink'
		// } );

		// editor.addButton( 'wp_link_advanced', {
		// 	tooltip: 'Link options',
		// 	icon: 'dashicon dashicons-admin-generic',
		// 	onclick: function() {
		// 		if ( typeof window.wpLink !== 'undefined' ) {
		// 			var url = inputInstance.getURL() || null,
		// 				text = inputInstance.getLinkText() || null;
    //
		// 			/*
		// 			 * Accessibility note: moving focus back to the editor confuses
		// 			 * screen readers. They will announce again the Editor ARIA role
		// 			 * `application` and the iframe `title` attribute.
		// 			 *
		// 			 * Unfortunately IE looses the selection when the editor iframe
		// 			 * looses focus, so without returning focus to the editor, the code
		// 			 * in the modal will not be able to get the selection, place the caret
		// 			 * at the same location, etc.
		// 			 */
		// 			if ( tinymce.Env.ie ) {
		// 				editor.focus(); // Needed for IE
		// 			}
    //
		// 			window.wpLink.open( editor.id, url, text, linkNode );
    //
		// 			editToolbar.tempHide = true;
		// 			inputInstance.reset();
		// 		}
		// 	}
		// } );

		// editor.addButton( 'wp_link_apply', {
		// 	tooltip: 'Apply',
		// 	icon: 'dashicon dashicons-editor-break',
		// 	cmd: 'wp_link_apply',
		// 	classes: 'widget btn primary'
		// } );

		return {
			close: function() {
				editToolbar.tempHide = false;
				// editor.execCommand( 'wp_link_cancel' );
			}
		};
	} );
} )( window.tinymce );
