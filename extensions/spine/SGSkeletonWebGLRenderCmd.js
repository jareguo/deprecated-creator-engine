/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

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

var spine = sp.spine;


sp._SGSkeleton.WebGLRenderCmd = function (renderableObject) {
    _ccsg.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
    this.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    this._tmpQuad = new cc.V3F_C4B_T2F_Quad();
};

var proto = sp._SGSkeleton.WebGLRenderCmd.prototype = Object.create(_ccsg.Node.WebGLRenderCmd.prototype);
proto.constructor = sp._SGSkeleton.WebGLRenderCmd;

proto.rendering = function (ctx) {
    var node = this._node, tmpQuad = this._tmpQuad;
    var color = node.getColor(), locSkeleton = node._skeleton;

    var blendMode, textureAtlas, attachment, slot, i, n;
    var locBlendFunc = node._blendFunc;
    var premultiAlpha = node._premultipliedAlpha;

    this._shaderProgram.use();
    this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
//        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
    locSkeleton.r = color.r / 255;
    locSkeleton.g = color.g / 255;
    locSkeleton.b = color.b / 255;
    locSkeleton.a = node.getOpacity() / 255;
    if (premultiAlpha) {
        locSkeleton.r *= locSkeleton.a;
        locSkeleton.g *= locSkeleton.a;
        locSkeleton.b *= locSkeleton.a;
    }

    //for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
    for (i = 0, n = locSkeleton.drawOrder.length; i < n; i++) {
        slot = locSkeleton.drawOrder[i];
        if (!slot.attachment)
            continue;
        attachment = slot.attachment;

        switch(slot.attachment.type) {
            case sp.ATTACHMENT_TYPE.REGION:
                this._updateRegionAttachmentQuad(attachment, slot, tmpQuad, premultiAlpha);
                break;
            case sp.ATTACHMENT_TYPE.MESH:
                this._updateMeshAttachmentQuad(attachment, slot, tmpQuad, premultiAlpha);
                break;
            case sp.ATTACHMENT_TYPE.SKINNED_MESH:
                break;
            default:
                continue;
        }

        var regionTextureAtlas = node.getTextureAtlas(attachment);

        if (slot.data.blendMode != blendMode) {
            if (textureAtlas) {
                textureAtlas.drawQuads();
                textureAtlas.removeAllQuads();
            }
            blendMode = slot.data.blendMode;
            switch (blendMode) {
            case spine.BlendMode.additive:
                cc.glBlendFunc(premultiAlpha ? cc.ONE : cc.SRC_ALPHA, cc.ONE);
                break;
            case spine.BlendMode.multiply:
                cc.glBlendFunc(cc.DST_COLOR, cc.ONE_MINUS_SRC_ALPHA);
                break;
            case spine.BlendMode.screen:
                cc.glBlendFunc(cc.ONE, cc.ONE_MINUS_SRC_COLOR);
                break;
            default:
                cc.glBlendFunc(locBlendFunc.src, locBlendFunc.dst);
            }
        } else if (regionTextureAtlas != textureAtlas && textureAtlas) {
            textureAtlas.drawQuads();
            textureAtlas.removeAllQuads();
        }
        textureAtlas = regionTextureAtlas;

        var quadCount = textureAtlas.getTotalQuads();
        if (textureAtlas.getCapacity() == quadCount) {
            textureAtlas.drawQuads();
            textureAtlas.removeAllQuads();
            if (!textureAtlas.resizeCapacity(textureAtlas.getCapacity() * 2))
                return;
        }

        textureAtlas.updateQuad(tmpQuad, quadCount);
    }

    if (textureAtlas) {
        textureAtlas.drawQuads();
        textureAtlas.removeAllQuads();
    }

    if (node._debugBones || node._debugSlots) {
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        //cc.kmGLPushMatrixWitMat4(this._stackMatrix);
        cc.current_stack.stack.push(cc.current_stack.top);
        cc.current_stack.top = this._stackMatrix;
        var drawingUtil = cc._drawingUtil;

        if (node._debugSlots) {
            // Slots.
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);

            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                this._updateRegionAttachmentQuad(attachment, slot, tmpQuad);

                var points = [];
                points.push(cc.p(tmpQuad.bl.vertices.x, tmpQuad.bl.vertices.y));
                points.push(cc.p(tmpQuad.br.vertices.x, tmpQuad.br.vertices.y));
                points.push(cc.p(tmpQuad.tr.vertices.x, tmpQuad.tr.vertices.y));
                points.push(cc.p(tmpQuad.tl.vertices.x, tmpQuad.tl.vertices.y));

                drawingUtil.drawPoly(points, 4, true);
            }
        }

        if (node._debugBones) {
            // Bone lengths.
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(cc.p(bone.worldX, bone.worldY), cc.p(x, y));
            }

            // Bone origins.
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255); // Root bone is blue.

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint(cc.p(bone.worldX, bone.worldY));
                if (i == 0) {
                    drawingUtil.setDrawColor(0, 255, 0, 255);
                }
            }
        }
        cc.kmGLPopMatrix();
    }
};

proto._createChildFormSkeletonData = function(){};

proto._updateChild = function(){};

proto._updateRegionAttachmentQuad = function(self, slot, quad, premultipliedAlpha) {
    var vertices = {};
    self.computeVertices(slot.bone.skeleton.x, slot.bone.skeleton.y, slot.bone, vertices);
    var r = slot.bone.skeleton.r * slot.r * 255;
    var g = slot.bone.skeleton.g * slot.g * 255;
    var b = slot.bone.skeleton.b * slot.b * 255;
    var normalizedAlpha = slot.bone.skeleton.a * slot.a;

    if (premultipliedAlpha) {
        r *= normalizedAlpha;
        g *= normalizedAlpha;
        b *= normalizedAlpha;
    }
    var a = normalizedAlpha * 255;

    quad.bl.colors.r = quad.tl.colors.r = quad.tr.colors.r = quad.br.colors.r = r;
    quad.bl.colors.g = quad.tl.colors.g = quad.tr.colors.g = quad.br.colors.g = g;
    quad.bl.colors.b = quad.tl.colors.b = quad.tr.colors.b = quad.br.colors.b = b;
    quad.bl.colors.a = quad.tl.colors.a = quad.tr.colors.a = quad.br.colors.a = a;

    var VERTEX = sp.VERTEX_INDEX;
    quad.bl.vertices.x = vertices[VERTEX.X1];
    quad.bl.vertices.y = vertices[VERTEX.Y1];
    quad.tl.vertices.x = vertices[VERTEX.X2];
    quad.tl.vertices.y = vertices[VERTEX.Y2];
    quad.tr.vertices.x = vertices[VERTEX.X3];
    quad.tr.vertices.y = vertices[VERTEX.Y3];
    quad.br.vertices.x = vertices[VERTEX.X4];
    quad.br.vertices.y = vertices[VERTEX.Y4];

    quad.bl.texCoords.u = self.uvs[VERTEX.X1];
    quad.bl.texCoords.v = self.uvs[VERTEX.Y1];
    quad.tl.texCoords.u = self.uvs[VERTEX.X2];
    quad.tl.texCoords.v = self.uvs[VERTEX.Y2];
    quad.tr.texCoords.u = self.uvs[VERTEX.X3];
    quad.tr.texCoords.v = self.uvs[VERTEX.Y3];
    quad.br.texCoords.u = self.uvs[VERTEX.X4];
    quad.br.texCoords.v = self.uvs[VERTEX.Y4];
};

proto._updateMeshAttachmentQuad = function(self, slot, quad, premultipliedAlpha) {
    var vertices = {};
    self.computeWorldVertices(slot.bone.x, slot.bone.y, slot, vertices);
    var r = slot.bone.skeleton.r * slot.r * 255;
    var g = slot.bone.skeleton.g * slot.g * 255;
    var b = slot.bone.skeleton.b * slot.b * 255;
    var normalizedAlpha = slot.bone.skeleton.a * slot.a;
    if (premultipliedAlpha) {
        r *= normalizedAlpha;
        g *= normalizedAlpha;
        b *= normalizedAlpha;
    }
    var a = normalizedAlpha * 255;

    quad.bl.colors.r = quad.tl.colors.r = quad.tr.colors.r = quad.br.colors.r = r;
    quad.bl.colors.g = quad.tl.colors.g = quad.tr.colors.g = quad.br.colors.g = g;
    quad.bl.colors.b = quad.tl.colors.b = quad.tr.colors.b = quad.br.colors.b = b;
    quad.bl.colors.a = quad.tl.colors.a = quad.tr.colors.a = quad.br.colors.a = a;

    var VERTEX = sp.VERTEX_INDEX;
    quad.bl.vertices.x = vertices[VERTEX.X1];
    quad.bl.vertices.y = vertices[VERTEX.Y1];
    quad.tl.vertices.x = vertices[VERTEX.X2];
    quad.tl.vertices.y = vertices[VERTEX.Y2];
    quad.tr.vertices.x = vertices[VERTEX.X3];
    quad.tr.vertices.y = vertices[VERTEX.Y3];
    quad.br.vertices.x = vertices[VERTEX.X4];
    quad.br.vertices.y = vertices[VERTEX.Y4];

    quad.bl.texCoords.u = self.uvs[VERTEX.X1];
    quad.bl.texCoords.v = self.uvs[VERTEX.Y1];
    quad.tl.texCoords.u = self.uvs[VERTEX.X2];
    quad.tl.texCoords.v = self.uvs[VERTEX.Y2];
    quad.tr.texCoords.u = self.uvs[VERTEX.X3];
    quad.tr.texCoords.v = self.uvs[VERTEX.Y3];
    quad.br.texCoords.u = self.uvs[VERTEX.X4];
    quad.br.texCoords.v = self.uvs[VERTEX.Y4];
};
