// ==UserScript==
// @name         Mouse Gestures like Opera
// @namespace    https://greasyfork.org/users/37096/
// @homepage     https://greasyfork.org/scripts/33398/
// @supportURL   https://greasyfork.org/scripts/33398/feedback
// @version      1.0.10
// @description  A Mouse Gestures script is the same as in the old Opera
// @author       Hồng Minh Tâm
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @icon         https://png.icons8.com/mouse-right-click/ultraviolet/40
// @include      *
// @compatible   chrome
// @license      GNU GPLv3
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        window.close
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle([
        '.mouse-gestures { display: none; z-index: 9999999999; position: fixed; overflow: hidden; border: 1px solid #CCC; white-space: nowrap; font-family: sans-serif; background-color: rgba(0, 0, 0, 0.7); color: #333; border-radius: 50%; width: 400px; height: 400px; }',

        '.mouse-gestures .mouse-gestures-middle, .mouse-gestures .mouse-gestures-up, .mouse-gestures .mouse-gestures-down, .mouse-gestures .mouse-gestures-left, .mouse-gestures .mouse-gestures-right { display: table; position: absolute; height: 160px; width: 160px; padding: 0; margin: 0; }',
        '.mouse-gestures .mouse-gestures-middle { top: 50%; left: 50%; margin-top: -20px; margin-left: -80px; width: 160px; height: 160px; text-align: center; }',
        '.mouse-gestures .mouse-gestures-up { top: 0; left: 50%; margin-left: -80px; }',
        '.mouse-gestures .mouse-gestures-down { bottom: 0; left: 50%; margin-left: -80px; }',
        '.mouse-gestures .mouse-gestures-left { top: 50%; left: 0; margin-top: -80px; }',
        '.mouse-gestures .mouse-gestures-right { top: 50%; right: 0; margin-top: -80px; }',

        '.mouse-gestures .mouse-gestures-label { color: #fff; font-family: Arial,"Helvetica Neue",Helvetica,sans-serif; font-weight: 700; font-size: 16px; text-transform: none; letter-spacing: normal; white-space: pre-wrap; padding: 0; margin: 0; -webkit-transition: all .2s; -moz-transition: all .2s; transition: all .2s; line-height: 22px; }',
        '.mouse-gestures .mouse-gestures-up > .mouse-gestures-label { display: table-cell; vertical-align: bottom; text-align: center; padding-bottom: 50px; }',
        '.mouse-gestures .mouse-gestures-down > .mouse-gestures-label { display: table-cell; vertical-align: top; text-align: center; padding-top: 50px; }',
        '.mouse-gestures .mouse-gestures-left > .mouse-gestures-label { display: table-cell; vertical-align: middle; text-align: right; padding-right: 50px; }',
        '.mouse-gestures .mouse-gestures-right > .mouse-gestures-label { display: table-cell; vertical-align: middle; text-align: left; padding-left: 50px; }',

        '.mouse-gestures .mouse-gestures-icon { position: absolute; width: initial; }',
        '.mouse-gestures .mouse-gestures-middle > .mouse-gestures-icon { position: initial; }',
        '.mouse-gestures .mouse-gestures-up > .mouse-gestures-icon { bottom: 0; left: 50%; margin-left: -20px; }',
        '.mouse-gestures .mouse-gestures-down > .mouse-gestures-icon { top: 0; left: 50%; margin-left: -20px; }',
        '.mouse-gestures .mouse-gestures-left > .mouse-gestures-icon { top: 50%; right: 0; margin-top: -20px; }',
        '.mouse-gestures .mouse-gestures-right > .mouse-gestures-icon { top: 50%; left: 0; margin-top: -20px; }',

        '.mouse-gestures .active > .mouse-gestures-label { color: #ffff00; }',
        '.mouse-gestures .mouse-gestures-up.active > .mouse-gestures-label { padding-bottom: 10px; }',
        '.mouse-gestures .mouse-gestures-down.active > .mouse-gestures-label { padding-top: 10px; }',
        '.mouse-gestures .mouse-gestures-left.active > .mouse-gestures-label { padding-right: 10px; }',
        '.mouse-gestures .mouse-gestures-right.active > .mouse-gestures-label { padding-left: 10px; }',
        '.mouse-gestures .active > .mouse-gestures-icon { display: none; }',

        '.mouse-gestures .hide { display: none; }',
    ].join('\n'));

    var SENSITIVITY = 20;
    var startX;
    var startY;
    var gesture = '';
    var preventContextMenu = false;
    var mouseDownTriggered = false;
    var values = {};
    var types = {};
    var defaultFn = {
        close: function () {
            window.top.close();
        },
        newTab: function () {
            defaultFn.openInNewTab();
        },
        duplicateTab: function () {
            defaultFn.openInNewTab(window.location.href);
        },
        openInNewTab: function (link) {
            GM_openInTab(link, false);
        },
        openInNewBackgroundTab: function (link) {
            GM_openInTab(link, true);
        },
        scrollUp: function () {
            $('html, body').animate({
                scrollTop: '-=700'
            }, 'slow');
        },
        scrollDown: function () {
            $('html, body').animate({
                scrollTop: '+=700'
            }, 'slow');
        },
        scrollToTop: function () {
            $('html, body').animate({
                scrollTop: 0
            }, 'slow');
        },
        scrollToBottom: function () {
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 'slow');
        },
        back: function () {
            window.history.back();
        },
        forward: function () {
            window.history.forward();
        },
        reload: function () {
            window.location.reload();
        },
        reloadWithoutCache: function () {
            window.location.reload(true);
        }
    };
    var gestures = {
        u: {
            label: 'Scroll up',
            fn: defaultFn.scrollUp,
        },
        d: {
            label: 'Scroll down',
            fn: defaultFn.scrollDown,
        },
        l: {
            label: 'Back',
            fn: defaultFn.back,
        },
        r: {
            label: 'Forward',
            fn: defaultFn.forward,
        },
        ud: {
            label: 'Reload',
            fn: defaultFn.reload,
        },
        ur: {
            label: 'New tab',
            fn: defaultFn.newTab,
        },
        du: {
            label: 'Duplicate tab',
            fn: defaultFn.duplicateTab,
        },
        dl: {
            label: 'Open link in new tab',
            fn: defaultFn.openInNewTab,
            onLink: true
        },
        dr: {
            label: 'Close tab',
            fn: defaultFn.close,
        },
        ru: {
            label: 'Scroll to top',
            fn: defaultFn.scrollToTop,
        },
        rd: {
            label: 'Scroll to bottom',
            fn: defaultFn.scrollToBottom,
        },
        udu: {
            label: 'Reload without cache',
            fn: defaultFn.reloadWithoutCache,
        },
        dld: {
            label: 'Open link in new background tab',
            fn: defaultFn.openInNewBackgroundTab,
            onLink: true
        },
    };

    var $mouseGestures = $('<div/>', {
        class: 'mouse-gestures'
    }).appendTo($('body'));

    var $up = $('<div/>', {
        class: 'mouse-gestures-up'
    }).appendTo($mouseGestures);
    var $upIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'https://png.icons8.com/up/ultraviolet/40'
    }).appendTo($up);
    var $upLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'u'].label).appendTo($up);

    var $down = $('<div/>', {
        class: 'mouse-gestures-down'
    }).appendTo($mouseGestures);
    var $downIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'https://png.icons8.com/down-arrow/ultraviolet/40'
    }).appendTo($down);
    var $downLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'd'].label).appendTo($down);

    var $left = $('<div/>', {
        class: 'mouse-gestures-left'
    }).appendTo($mouseGestures);
    var $leftIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'https://png.icons8.com/left/ultraviolet/40'
    }).appendTo($left);
    var $leftLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'l'].label).appendTo($left);

    var $right = $('<div/>', {
        class: 'mouse-gestures-right'
    }).appendTo($mouseGestures);
    var $rightIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'https://png.icons8.com/right/ultraviolet/40'
    }).appendTo($right);
    var $rightLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).text(gestures[gesture + 'r'].label).appendTo($right);

    var $middle = $('<div/>', {
        class: 'mouse-gestures-middle'
    }).appendTo($mouseGestures);
    var $middleIcon = $('<img/>', {
        class: 'mouse-gestures-icon',
        src: 'https://png.icons8.com/mouse-right-click/ultraviolet/40'
    }).appendTo($middle);
    var $middleLabel = $('<div/>', {
        class: 'mouse-gestures-label'
    }).appendTo($middle);

    var timeoutDelay;
    $(document).on('mousedown', function (e) {
        if (e.which == 3) {
            getValues(e);
            getTypes();
            preventContextMenu = false;
            mouseDownTriggered = true;
            startX = e.clientX;
            startY = e.clientY;
            gesture = '';
            loadMG();
            timeoutDelay = setTimeout(function () {
                showMG(e);
            }, 500);
            $(this).on('mousemove', function (e) {
                if (startY - e.clientY > 10 || e.clientY - startY > 10 || startX - e.clientX > 10 || e.clientX - startX > 10) {
                    preventContextMenu = false;
                    if (mouseDownTriggered) {
                        mouseDownTriggered = false;
                    } else {
                        clearTimeout(timeoutDelay);
                        showMG(e);
                        checkMG(e);
                    }
                }
            });
        }
    }).on('mouseup', function (e) {
        clearTimeout(timeoutDelay);
        $(this).off('mousemove');
        if (checkTypeItemMG('link', gesture, true)) {
            switch (gesture.slice(-1)) {
                case 'u':
                    $down.addClass('hide');
                    $left.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'd':
                    $up.addClass('hide');
                    $left.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'l':
                    $up.addClass('hide');
                    $down.addClass('hide');
                    $right.addClass('hide');
                    break;
                case 'r':
                    $up.addClass('hide');
                    $down.addClass('hide');
                    $left.addClass('hide');
                    break;
            }
            $mouseGestures.delay(300).hide(0);
        } else {
            $mouseGestures.hide();
        }
        gesture = '';
    }).on('contextmenu', function (e) {
        if (preventContextMenu) e.preventDefault();
    });

    function showMG(e) {
        preventContextMenu = true;
        $mouseGestures.css({
            left: (e.clientX - $mouseGestures.width() / 2) + "px",
            top: (e.clientY - $mouseGestures.height() / 2) + "px"
        }).stop(true, true).show();
    }

    function checkMG(e) {
        checkMove(startY - e.clientY, 'u', e);
        checkMove(e.clientY - startY, 'd', e);
        checkMove(startX - e.clientX, 'l', e);
        checkMove(e.clientX - startX, 'r', e);
    }

    function checkMove(p, t, e) {
        if (p >= SENSITIVITY) {
            startX = e.clientX;
            startY = e.clientY;
            if (gesture[gesture.length - 1] != t) {
                gesture += t;
                loadMG();
            }
        }
    }

    function loadMG() {
        if (checkTypeItemMG('link', gesture + 'u')) {
            $up.removeClass('active hide');
            $upLabel.text(gestures[gesture + 'u'].label);
        } else {
            $up.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'd')) {
            $down.removeClass('active hide');
            $downLabel.text(gestures[gesture + 'd'].label);
        } else {
            $down.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'l')) {
            $left.removeClass('active hide');
            $leftLabel.text(gestures[gesture + 'l'].label);
        } else {
            $left.addClass('hide');
        }
        if (checkTypeItemMG('link', gesture + 'r')) {
            $right.removeClass('active hide');
            $rightLabel.text(gestures[gesture + 'r'].label);
        } else {
            $right.addClass('hide');
        }

        if (checkTypeItemMG('link', gesture)) {
            switch (gesture.slice(-1)) {
                case 'u':
                    $up.removeClass('hide').addClass('active');
                    break;
                case 'd':
                    $down.removeClass('hide').addClass('active');
                    break;
                case 'l':
                    $left.removeClass('hide').addClass('active');
                    break;
                case 'r':
                    $right.removeClass('hide').addClass('active');
                    break;
            }
        }
    }

    function getValues(e) {
        values = {};
        values.$target = $(e.target);
        if (values.$target.closest('a').length) {
            values.link = values.$target.closest('a').prop('href');
        }
    }

    function getTypes() {
        types = {};
        if (typeof values.link !== 'undefined') {
            types.link = true;
        }
    }

    function checkTypeItemMG(type, gesture, runFunction) {
        if (gestures[gesture]) {
            if (gestures[gesture]['on' + type.toCapitalize().replace(' ', '')]) {
                if (types[type]) {
                    if (runFunction === true) {
                        gestures[gesture].fn(values[type]);
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                if (runFunction === true) {
                    gestures[gesture].fn();
                }
                return true;
            }
        } else {
            return false;
        }
    }

    String.prototype.toCapitalize = function () {
        return this.replace(/(\b)([a-zA-Z])/g, function (m) {
            return m.toUpperCase();
        });
    };
})();