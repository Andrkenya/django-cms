'use strict';

// #############################################################################
// Edit page content

var globals = require('./settings/globals');
var messages = require('./settings/messages').page.editContent;
var randomString = require('./helpers/randomString').randomString;
// random text string for filtering and content purposes
var randomText = randomString({ length: 50, withWhitespaces: false });


casper.test.begin('Edit content', function (test) {
    var previousContentText;

    casper
        .start(globals.editUrl)

        // check edit modal window appearance after double click in content mode
        // double click on last added plugin content
        .waitUntilVisible('.cms-toolbar-expanded', function () {
            this.mouse.doubleclick('.cms-plugin:last-child');
        })
        .waitUntilVisible('.cms-modal-open')
        // change content inside appeared modal window
        .withFrame(0, function () {
            casper.waitUntilVisible('#text_form', function () {
                // explicitly put text to ckeditor
                previousContentText = this.evaluate(function (contentData) {
                    var previousContent = CMS.CKEditor.editor.document.getBody().getText();

                    CMS.CKEditor.editor.setData(contentData);
                    return previousContent;
                }, randomText);
            });
        })
        // submit changes in modal
        .then(function () {
            this.click('.cms-modal-buttons .cms-btn-action.default');
        })
        // check if content updated
        .waitWhileVisible('.cms-modal-open', function () {
            // ensure content updated with new one
            test.assertSelectorHasText(
                '.cms-plugin:last-child',
                randomText,
                messages.contentUpdatedDoubleClick
            );
        })
        // go to the Structure mode
        .then(function () {
            this.click('.cms-toolbar-item-cms-mode-switcher .cms-btn[href="?build"]');
        })

        // check edit modal window appearance after Edit button click in structure mode
        // click to Edit button for last plugin
        .waitUntilVisible('.cms-structure', function () {
            this.click('.cms-draggable:last-child .cms-submenu-edit');
        })
        // check if edit modal window appeared
        .waitUntilVisible('.cms-modal-open', function () {
            test.assertVisible('.cms-modal-open', messages.modalAppearsAfterEditButton);
        })
        // close edit modal
        .then(function () {
            this.click('.cms-modal-open .cms-modal-item-buttons:last-child > a');
        })
        .waitWhileVisible('.cms-modal-iframe')

        // check edit modal window appearance after double click in structure mode
        // double click on last plugin
        .then(function () {
            this.mouse.doubleclick('.cms-draggable:last-child .cms-dragitem');
        })
        // edit content inside opened editor modal
        .waitUntilVisible('.cms-modal-open')
        .withFrame(0, function () {
            casper.waitUntilVisible('#text_form', function () {
                // explicitly put text to ckeditor
                this.evaluate(function (contentData) {
                    CMS.CKEditor.editor.setData(contentData);
                }, previousContentText);
            });
        })
        // submit changes
        .then(function () {
            this.click('.cms-modal-buttons .cms-btn-action.default');
        })
        // go to the Content mode
        .waitWhileVisible('.cms-modal-open', function () {
            this.click('.cms-toolbar-item-cms-mode-switcher .cms-btn[href="?edit"]');
        })
        // check for applied changes
        .waitUntilVisible('.cms-toolbar-expanded', function () {
            // ensure content updated with new one
            test.assertSelectorHasText(
                '.cms-plugin:last-child',
                previousContentText,
                messages.contentUpdatedDoubleClickStructure
            );
        })
        .run(function () {
            test.done();
        });
});
