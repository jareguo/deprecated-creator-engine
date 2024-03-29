/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Chukong Aipu reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

// MACROS

// if "global_defs" not preprocessed by uglify, just declare them globally,
// this may happened in release version's preview page.
eval(
    /* use EVAL to prevent the uglify from renaming symbols */
    'if(typeof CC_TEST=="undefined")' +
        'CC_TEST=typeof describe!="undefined"||typeof QUnit=="object";' +
    'if(typeof CC_EDITOR=="undefined")' +
        'CC_EDITOR=typeof Editor=="object"&&typeof process=="object"&&"electron" in process.versions;' +
    'if(typeof CC_DEV=="undefined")' +
        'CC_DEV=CC_EDITOR||CC_TEST;' +
    'if(typeof CC_JSB=="undefined")' +
        'CC_JSB=false;'
);

// PREDEFINE

require('./predefine');

// LOAD BUNDLED COCOS2D

var isCoreLevel = CC_EDITOR && Editor.isCoreLevel;
if (!isCoreLevel) {
    // LOAD ORIGIN COCOS2D COMPILED BY CLOSURE
    require('./bin/modular-cocos2d');
}
else {
    // load modules for editor's core-level which included in modular-cocos2d.js
    cc._initDebugSetting(1);    // DEBUG_MODE_INFO
}

// LOAD EXTENDS FOR FIREBALL

require('./extends');

if (CC_EDITOR) {
    /**
     * In editor, in addition to the modules defined in cc scope, you can also access to the internal modules by using _require.
     * @method _require
     * @example
     * var isDomNode = cc._require('./cocos2d/core/platform/utils').isDomNode;
     */
    cc._require = require;
}

if (isCoreLevel) {
    Editor.versions['cocos2d'] = require('./package.json').version;
}
else if (CC_DEV) {
    require('./cocos2d/deprecated');
}

module.exports = cc;
