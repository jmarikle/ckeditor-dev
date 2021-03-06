/* bender-tags: editor */
/* bender-ckeditor-plugins: colorbutton,colordialog,undo,toolbar,wysiwygarea */

( function() {
	'use strict';

	bender.editor = true;

	function onDialogShow( editor ) {
		editor.on( 'dialogShow', function( evt ) {
			setTimeout( function() {
				var dialog = evt.data;
				dialog.setValueOf( 'picker', 'selectedColor', '#ff3333' );
				dialog.getButton( 'ok' ).click();
				resume();
			}, 0 );
		} );
	}

	function openColorDialog( frame ) {
		setTimeout( function() {
			frame = document.querySelector( '.cke_panel_frame' );
			frame.contentDocument.querySelector( '.cke_colormore' ).click();
		}, 0 );

		wait();
	}

	function assertUndoRedo( editor, firstUndo, secondUndo, firstRedo, secondRedo ) {
		editor.execCommand( 'undo' );
		assert.areEqual( firstUndo, editor.getData(), 'after 1st undo' );

		editor.execCommand( 'undo' );
		assert.areEqual( secondUndo, editor.getData(), 'after 2nd undo' );

		editor.execCommand( 'redo' );
		assert.areEqual( firstRedo, editor.getData(), 'after 1st redo' );

		editor.execCommand( 'redo' );
		assert.areEqual( secondRedo, editor.getData(), 'after 2nd redo' );
	}

	bender.test( {
		'test opening text/background color': function() {
			var ed = this.editor, bot = this.editorBot;
			var txtColorBtn = ed.ui.get( 'TextColor' ),
				bgColorBtn = ed.ui.get( 'BGColor' );

			bot.setHtmlWithSelection( '[<h1 style="color: #00FF00; background: #FF0000">Moo</h1>]' );

			// Check if automatic text color is obtained correctly.
			txtColorBtn.click( ed );
			assert.areEqual( '#00ff00', CKEDITOR.tools.convertRgbToHex( txtColorBtn.onOpen() ), 'Text color must match.' );

			// Check if automatic background color is obtained correctly.
			bgColorBtn.click( ed );
			assert.areEqual( '#ff0000', CKEDITOR.tools.convertRgbToHex( bgColorBtn.onOpen() ), 'Text color must match.' );
		},

		// http://dev.ckeditor.com/ticket/10975
		'test open palette without focus': function() {
			var editor = CKEDITOR.replace( 'noFocus' );
			editor.on( 'instanceReady', function() {
				resume( function() {
					var txtColorBtn = editor.ui.get( 'TextColor' );
					txtColorBtn.click( editor );

					assert.areEqual( CKEDITOR.TRISTATE_ON, txtColorBtn._.state, 'txtColorBtn.click should not throw an error.' );
				} );
			} );

			wait();
		},

		'test background color transformation': function() {
			var input = '<p><span style="background:#ff0000">foo</span><span style="background:yellow">bar</span></p>',
				expected = '<p><span style="background-color:#ff0000">foo</span><span style="background-color:yellow">bar</span></p>';

			assert.areSame( expected, this.editor.dataProcessor.toHtml( input ) );
		},

		'test enableAutomatic=true option': function() {
			bender.editorBot.create( {
				name: 'editor1',
				config: {
					colorButton_enableAutomatic: true
				}
			}, function( bot ) {
				var editor = bot.editor,
					txtColorBtn = editor.ui.get( 'TextColor' ),
					bgColorBtn = editor.ui.get( 'BGColor' );

				txtColorBtn.click( editor );
				assert.areEqual( 1, txtColorBtn._.panel.getBlock( txtColorBtn._.id ).element.find( '.cke_colorauto' ).count(), 'Automatic button should be visible.' );

				bgColorBtn.click( editor );
				assert.areEqual( 1, bgColorBtn._.panel.getBlock( bgColorBtn._.id ).element.find( '.cke_colorauto' ).count(), 'Automatic button should be visible.' );
			} );
		},

		'test enableAutomatic=false option': function() {
			bender.editorBot.create( {
				name: 'editor2',
				config: {
					colorButton_enableAutomatic: false
				}
			}, function( bot ) {
				var editor = bot.editor,
					txtColorBtn = editor.ui.get( 'TextColor' ),
					bgColorBtn = editor.ui.get( 'BGColor' );

				txtColorBtn.click( editor );
				assert.areEqual( 0, txtColorBtn._.panel.getBlock( txtColorBtn._.id ).element.find( '.cke_colorauto' ).count(), 'Automatic button should not be visible.' );

				bgColorBtn.click( editor );
				assert.areEqual( 0, bgColorBtn._.panel.getBlock( bgColorBtn._.id ).element.find( '.cke_colorauto' ).count(), 'Automatic button should not be visible.' );
			} );
		},

		// 590
		'test changing text color': function() {
			var ed = this.editor,
				bot = this.editorBot,
				txtColorBtn = ed.ui.get( 'TextColor' ),
				frame;

			ed.on( 'dialogHide', function() {
				assert.areEqual( '<h1><span style="color:#ff3333">Moo</span></h1>', ed.getData() );
				assertUndoRedo( ed, '<h1>Moo</h1>', '', '<h1>Moo</h1>', '<h1><span style="color:#ff3333">Moo</span></h1>' );
			} );

			onDialogShow( ed );
			bot.setHtmlWithSelection( '[<h1>Moo</h1>]' );

			txtColorBtn.click( ed );
			openColorDialog( frame );
		},

		// 590
		'test changing text color with no focus': function() {
			bender.editorBot.create( {
				name: 'editor3',
				config: {
					colorButton_enableAutomatic: false
				}
			}, function( bot ) {
				var editor = bot.editor,
					txtColorBtn = editor.ui.get( 'TextColor' ),
					frame;

				resume( function() {
					editor.on( 'dialogHide', function() {
						editor.insertText( 'foo' );

						assert.areEqual( '<p><span style="color:#ff3333">foo</span></p>', editor.getData(), 'after text insert' );
						assertUndoRedo( editor, '', '', '', '<p><span style="color:#ff3333">foo</span></p>' );
					} );

					onDialogShow( editor );

					txtColorBtn.click( editor );
					openColorDialog( frame );
				} );

				wait();
			} );
		}
	} );
} )();
