/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * The global main namespace of Spine, all classes, functions, properties and constants of Spine are defined in this namespace
 * @module sp
 * @main sp
 */

/*
 * Reference:
 * http://esotericsoftware.com/spine-runtime-terminology
 * http://esotericsoftware.com/files/runtime-diagram.png
 * http://en.esotericsoftware.com/spine-using-runtimes
 */

sp = CC_JSB ? sp : {};

// The vertex index of spine.
sp.VERTEX_INDEX = {
    X1: 0,
    Y1: 1,
    X2: 2,
    Y2: 3,
    X3: 4,
    Y3: 5,
    X4: 6,
    Y4: 7
};

// The attachment type of spine. It contains three type: REGION(0), BOUNDING_BOX(1), MESH(2) and SKINNED_MESH.
sp.ATTACHMENT_TYPE = {
    REGION: 0,
    BOUNDING_BOX: 1,
    MESH: 2,
    SKINNED_MESH:3
};

/**
 * The event type of spine skeleton animation.
 * @enum AnimationEventType
 */
sp.AnimationEventType = cc.Enum({
    /**
     * @property {Number} START
     */
    START: 0,
    /**
     * @property {Number} END
     */
    END: 1,
    /**
     * @property {Number} COMPLETE
     */
    COMPLETE: 2,
    /**
     * @property {Number} EVENT
     */
    EVENT: 3
});

/**
 * @module sp
 */

if (!CC_EDITOR || !Editor.isCoreLevel) {
    
    if (!CC_JSB) {
        /**
         * The official spine runtime.
         * See http://en.esotericsoftware.com/spine-using-runtimes
         * @property {object} spine
         */
        sp.spine = require('./lib/spine');
    
        require('./SGSkeleton');
        require('./SGSkeletonCanvasRenderCmd');
        require('./SGSkeletonWebGLRenderCmd');
        require('./SGSkeletonAnimation');
    }
    
    require('./SkeletonData');
    require('./Skeleton');
}
else {
    require('./SkeletonData');
}
