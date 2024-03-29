'use strict';

/*
 * Reference:
 * http://en.esotericsoftware.com/spine-json-format
 */

const Fs = require('fire-fs');
const Path = require('fire-path');
const Spine = require('../lib/spine');

const ATLAS_EXTS = ['.atlas', '.txt', ''];
const SPINE_ENCODING = { encoding: 'utf-8' };

const CustomAssetMeta = Editor.metas['custom-asset'];

function searchAtlas (skeletonPath, callback) {
    skeletonPath = Path.stripExt(skeletonPath);

    function next (index) {
        var suffix = ATLAS_EXTS[index];
        var path = skeletonPath + suffix;
        Fs.exists(path, exists => {
            if (exists) {
                return callback(null, path);
            }
            else if (index + 1 < ATLAS_EXTS.length) {
                next(index + 1);
            }
            else {
                callback(new Error(`Can not find ${skeletonPath + ATLAS_EXTS[0]}`));
            }
        });
    }

    next(0);
}

function loadAtlasText (skeletonPath, callback) {
    searchAtlas(skeletonPath, (err, path) => {
        if (err) {
            return callback(err);
        }
        Fs.readFile(path, SPINE_ENCODING, (err, data) => {
            callback(err, {
                data: data,
                atlasPath: path
            });
        });
    });
}

// A dummy texture loader to record all textures in atlas
class TextureParser {
    constructor (atlasPath) {
        this.atlasPath = atlasPath;
        // the loaded texture array
        this.textures = [];
    }
    load (page, line) {
        var name = Path.basename(line);
        var base = Path.dirname(this.atlasPath);
        var path = Path.resolve(base, name);
        var uuid = Editor.assetdb.fspathToUuid(path);
        if (!uuid) {
            return;
        }
        //if (!uuid) {
        //    cc.error('Can not find texture "%s" for atlas "%s"', line, this.atlasPath);
        //    return;
        //}
        //var texture = Editor.serialize.asAsset(uuid);
        var url = Editor.assetdb.uuidToUrl(uuid);
        this.textures.push(url);
    }
    unload () {}
}

class SpineMeta extends CustomAssetMeta {
    constructor (assetdb) {
        super(assetdb);
        this.textures = [];
        this.atlas = '';
        this.scale = 1;
    }

    // HACK - for inspector
    get texture () {
        //return this.textures[0];
        return Editor.assetdb.uuidToUrl(this.textures[0]);
    }
    set texture (value) {
        this.textures[0] = Editor.assetdb.urlToUuid(value);
        //this.textures[0] = value;
    }

    static version () { return '1.0.1'; }
    static defaultType () {
        return 'spine';
    }

    static validate (assetpath) {
        // TODO - import as a folder named '***.spine'
        var json;
        var text = Fs.readFileSync(assetpath, 'utf8');
        var fastTest = text.slice(0, 30);
        var maybe = ( fastTest.indexOf('slots') > 0 ||
                      fastTest.indexOf('skins') > 0 ||
                      fastTest.indexOf('events') > 0 ||
                      fastTest.indexOf('animations') > 0 ||
                      fastTest.indexOf('bones') > 0 ||
                      fastTest.indexOf('skeleton') > 0 ||
                      fastTest.indexOf('\"ik\"') > 0
                    );
        if (maybe) {
            try {
                json = JSON.parse(text);
            }
            catch (e) {
                return false;
            }
            return Array.isArray(json.bones);
        }
        return false;
    }

    dests () {
        var res = super.dests();
        // for JSB
        res.push(this._assetdb._uuidToImportPathNoExt(this.uuid) + '.raw.json');
        if (this.atlas) {
            res.push(this._assetdb._uuidToImportPathNoExt(this.atlas) + '.atlas');
        }
        return res;
    }
    
    import (fspath, cb) {
        Fs.readFile(fspath, SPINE_ENCODING, (err, data) => {
            if (err) {
                return cb(err);
            }

            var json;
            try {
                json = JSON.parse(data);
            }
            catch (e) {
                return cb(e);
            }

            var asset = new sp.SkeletonData();
            asset.name = Path.basenameNoExt(fspath);
            asset.skeletonJson = json;
            asset.scale = this.scale;

            loadAtlasText(fspath, (err, res) => {
                if (err) {
                    return cb(err);
                }

                var db = this._assetdb;

                // parse atlas textures
                var textureParser = new TextureParser(res.atlasPath);
                try {
                    new Spine.Atlas(res.data, textureParser);
                }
                catch (err) {
                    return cb(new Error(`Failed to load atlas file: "${res.atlasPath}". ${err.stack || err}`));
                }
                if (textureParser.textures.length > 0) {
                    asset.textures = textureParser.textures;
                    this.textures = textureParser.textures.map(url => Editor.assetdb.urlToUuid(url));
                }
                else {
                    asset.textures = this.textures.map(uuid => Editor.assetdb.uuidToUrl(uuid));
                }

                //
                asset.atlasText = res.data;
                
                // save raw assets for JSB..
                
                var atlasUuid = db.fspathToUuid(res.atlasPath);
                asset.atlasUrl = db.uuidToUrl(atlasUuid);
                
                db.mkdirForAsset(this.uuid);
                var rawJsonPath = db._uuidToImportPathNoExt(this.uuid) + '.raw.json';
                Fs.copySync(fspath, rawJsonPath);
                
                this.atlas = atlasUuid;     // save for dest()
                
                //
                
                db.saveAssetToLibrary(this.uuid, asset);
                cb();
            });
        });
    }
}

SpineMeta.prototype.export = null;

module.exports = SpineMeta;
