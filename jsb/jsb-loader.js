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
'use strict';

require('../cocos2d/core/load-pipeline');

function empty (item, callback) {
    callback(null, null);
}

function downloadScript (item, callback) {
    var url = item.url;
    require(url);
    callback(null, url);
}

function downloadText (item, callback) {
    var url = item.url;
    var result = jsb.fileUtils.getStringFromFile(url);
    if (typeof result === 'string') {
        callback(null, result);
    }
    else {
        callback(new Error('Download text failed: ' + url));
    }
}

cc.loader.addDownloadHandlers({
    // JS
    'js' : downloadScript,

    // Images
    'png' : empty,
    'jpg' : empty,
    'bmp' : empty,
    'jpeg' : empty,
    'gif' : empty,
    'ico' : empty,
    'tiff' : empty,
    'webp' : empty,
    'image' : empty,

    // Audio
    'mp3' : empty,
    'ogg' : empty,
    'wav' : empty,
    'mp4' : empty,
    'm4a' : empty,

    // Txt
    'txt' : downloadText,
    'xml' : downloadText,
    'vsh' : downloadText,
    'fsh' : downloadText,
    'atlas' : downloadText,

    'tmx' : downloadText,
    'tsx' : downloadText,

    'json' : downloadText,
    'ExportJson' : downloadText,
    'plist' : downloadText,

    'fnt' : downloadText,

    // Font
    'font' : empty,
    'eot' : empty,
    'ttf' : empty,
    'woff' : empty,
    'svg' : empty,
    'ttc' : empty,

    'default' : downloadText
});


function loadImage (item, callback) {
    var url = item.url;

    var cachedTex = cc.textureCache.getTextureForKey(url);
    if (cachedTex) {
        callback && callback(null, cachedTex);
    }
    else if (url.match(jsb.urlRegExp)) {
        jsb.loadRemoteImg(url, function(succeed, tex) {
            if (succeed) {
                callback && callback(null, tex);
            }
            else {
                callback && callback(new Error('Load image failed: ' + url));
            }
        });
    }
    else {
        cc.textureCache._addImageAsync(url, function (tex){
            if (tex instanceof cc.Texture2D) {
                callback && callback(null, tex);
            }
            else {
                callback && callback(new Error('Load image failed: ' + url));
            }
        });
    }
}

cc.loader.addLoadHandlers({
    // Images
    'png' : loadImage,
    'jpg' : loadImage,
    'bmp' : loadImage,
    'jpeg' : loadImage,
    'gif' : loadImage,
    'ico' : loadImage,
    'tiff' : loadImage,
    'webp' : loadImage,
    'image' : loadImage,

    'default' : empty
});