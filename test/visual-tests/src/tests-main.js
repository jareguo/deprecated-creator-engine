/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

// globals
var director = null;
var winSize = null;

var PLATFORM_JSB = 1 << 0;
var PLATFORM_HTML5 = 1 << 1;
var PLATFORM_HTML5_WEBGL = 1 << 2;
var PLATFROM_ANDROID = 1 << 3;
var PLATFROM_IOS = 1 << 4;
var PLATFORM_MAC = 1 << 5;
var PLATFORM_JSB_AND_WEBGL =  PLATFORM_JSB | PLATFORM_HTML5_WEBGL;
var PLATFORM_ALL = PLATFORM_JSB | PLATFORM_HTML5 | PLATFORM_HTML5_WEBGL | PLATFROM_ANDROID | PLATFROM_IOS;
var PLATFROM_APPLE = PLATFROM_IOS | PLATFORM_MAC;

// automation vars
var autoTestEnabled = autoTestEnabled || false;
var autoTestCurrentTestName = autoTestCurrentTestName || "N/A";

var TestScene = _ccsg.Scene.extend({
    ctor:function (bPortrait) {
        this._super();
        this.init();

        var label = new cc.LabelTTF("Main Menu", "Arial", 20);
        var menuItem = new cc.MenuItemLabel(label, this.onMainMenuCallback, this);

        var menu = new cc.Menu(menuItem);
        menu.x = 0;
        menu.y = 0;
        menuItem.x = winSize.width - 50;
        menuItem.y = 25;

        if(!window.sideIndexBar){
            this.addChild(menu, 1);
        }
    },
    onMainMenuCallback:function () {
        var scene = new _ccsg.Scene();
        var layer = new TestController();
        scene.addChild(layer);
        director.runScene(scene);
    },

    runThisTest:function () {
        // override me
    }

});

//Controller stuff
var LINE_SPACE = 40;
var curPos = cc.p(0,0);

var TestController = cc.LayerGradient.extend({
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    ctor:function() {
        this._super(cc.color(0,0,0,255), cc.color(70,130,180,255));

        // globals
        director = cc.director;
        winSize = director.getWinSize();

        // add close menu
        var closeItem = new cc.MenuItemImage(s_pathClose, s_pathClose, this.onCloseCallback, this);
        closeItem.x = winSize.width - 30;
	    closeItem.y = winSize.height - 30;

        var subItem1 = new cc.MenuItemFont("Automated Test: Off");
        subItem1.fontSize = 18;
        var subItem2 = new cc.MenuItemFont("Automated Test: On");
        subItem2.fontSize = 18;

        var toggleAutoTestItem = new cc.MenuItemToggle(subItem1, subItem2);
        toggleAutoTestItem.setCallback(this.onToggleAutoTest, this);
        toggleAutoTestItem.x = winSize.width - toggleAutoTestItem.width / 2 - 10;
        toggleAutoTestItem.y = 20;
        toggleAutoTestItem.setVisible(false);
        if( autoTestEnabled )
            toggleAutoTestItem.setSelectedIndex(1);


        var menu = new cc.Menu(closeItem, toggleAutoTestItem);//pmenu is just a holder for the close button
        menu.x = 0;
	    menu.y = 0;

        // sort the test title
        testNames.sort(function(first, second){
            if (first.title > second.title)
            {
                return 1;
            }
            return -1;
        });

        // add menu items for tests
        this._itemMenu = new cc.Menu();//item menu is where all the label goes, and the one gets scrolled

        for (var i = 0, len = testNames.length; i < len; i++) {
            var label = new cc.LabelTTF(testNames[i].title, "Arial", 24);
            var menuItem = new cc.MenuItemLabel(label, this.onMenuCallback, this);
            this._itemMenu.addChild(menuItem, i + 10000);
            menuItem.x = winSize.width / 2;
	        menuItem.y = (winSize.height - (i + 1) * LINE_SPACE);

            // enable disable
            if ( !cc.sys.isNative) {
                if( cc._renderType !== cc.game.RENDER_TYPE_CANVAS ){
                    menuItem.enabled = (testNames[i].platforms & PLATFORM_HTML5) | (testNames[i].platforms & PLATFORM_HTML5_WEBGL);
                }else{
                    menuItem.setEnabled( testNames[i].platforms & PLATFORM_HTML5 );
                }
            } else {
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    menuItem.setEnabled( testNames[i].platforms & ( PLATFORM_JSB | PLATFROM_ANDROID ) );
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    menuItem.setEnabled( testNames[i].platforms & ( PLATFORM_JSB | PLATFROM_IOS) );
                } else if (cc.sys.os == cc.sys.OS_OSX) {
                    menuItem.setEnabled( testNames[i].platforms & ( PLATFORM_JSB | PLATFORM_MAC) );
                } else {
                    menuItem.setEnabled( testNames[i].platforms & PLATFORM_JSB );
                }
            }
        }

        this._itemMenu.width = winSize.width;
	    this._itemMenu.height = (testNames.length + 1) * LINE_SPACE;
        this._itemMenu.x = curPos.x;
	    this._itemMenu.y = curPos.y;
        this.addChild(this._itemMenu);
        this.addChild(menu, 1);

        // 'browser' can use touches or mouse.
        // The benefit of using 'touches' in a browser, is that it works both with mouse events or touches events
        if ('touches' in cc.sys.capabilities)
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchesMoved: function (touches, event) {
                    var target = event.getCurrentTarget();
                    var delta = touches[0].getDelta();
                    target.moveMenu(delta);
                    return true;
                }
            }, this);
        else if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove: function (event) {
                    if(event.getButton() == cc.Event.EventMouse.BUTTON_LEFT)
                        event.getCurrentTarget().moveMenu(event.getDelta());
                },
                onMouseScroll: function (event) {
                    var delta = cc.sys.isNative ? event.getScrollY() * 6 : -event.getScrollY();
                    event.getCurrentTarget().moveMenu({y : delta});
                    return true;
                }
            }, this);
        }
    },
    onEnter:function(){
        this._super();
	    this._itemMenu.y = TestController.YOffset;
    },
    onMenuCallback:function (sender) {
        TestController.YOffset = this._itemMenu.y;
        var idx = sender.getLocalZOrder() - 10000;
        // get the userdata, it's the index of the menu item clicked
        // create the test scene and run it

        autoTestCurrentTestName = testNames[idx].title;

        var testCase = testNames[idx];
        var res = testCase.resource || [];
        cc.LoaderScene.preload(res, function () {
            var scene = testCase.testScene();
            if (scene) {
                scene.runThisTest();
            }
        }, this);
    },
    onCloseCallback:function () {
        if (cc.sys.isNative)
        {
            cc.director.end();
        }
        else {
            window.history && window.history.go(-1);
        }
    },
    onToggleAutoTest:function() {
        autoTestEnabled = !autoTestEnabled;
    },

    moveMenu:function(delta) {
        var newY = this._itemMenu.y + delta.y;
        if (newY < 0 )
            newY = 0;

        if( newY > ((testNames.length + 1) * LINE_SPACE - winSize.height))
            newY = ((testNames.length + 1) * LINE_SPACE - winSize.height);

	    this._itemMenu.y = newY;
    }
});
TestController.YOffset = 0;
var testNames = [
    {
        title:"ActionManager Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/ActionManagerTest/ActionManagerTest.js",
        testScene:function () {
            return new ActionManagerTestScene();
        }
    },
    {
        title:"Actions Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/ActionsTest/ActionsTest.js",
        testScene:function () {
            return new ActionsTestScene();
        }
    },
    {
        title:"Bake Layer Test",
        platforms: PLATFORM_HTML5,
        linksrc:"src/BakeLayerTest/BakeLayerTest.js",
        testScene:function () {
            return new BakeLayerTestScene();
        }
    },
    {
        title:"ClippingNode Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/ClippingNodeTest/ClippingNodeTest.js",
        testScene:function () {
            return new ClippingNodeTestScene();
        }
    },
    {
        title:"AudioEngine Test",
        resource:g_cocosdeshion,
        platforms: PLATFORM_ALL,
        linksrc:"src/CocosDenshionTest/CocosDenshionTest.js",
        testScene:function () {
            return new CocosDenshionTestScene();
        }
    },
    {
        title:"DrawNode Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/DrawPrimitivesTest/DrawPrimitivesTest.js",
        testScene:function () {
            return new DrawPrimitivesTestScene();
        }
    },
    {
        title:"EaseActions Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/EaseActionsTest/EaseActionsTest.js",
        testScene:function () {
            return new EaseActionsTestScene();
        }
    },
    {
        title:"Event Manager Test",
        resource:g_eventDispatcher,
        platforms: PLATFORM_ALL,
        linksrc:"src/NewEventManagerTest/NewEventManagerTest.js",
        testScene:function () {
            return new EventDispatcherTestScene();
        }
    },
    {
        title:"Event Node Test",
        resource:g_eventDispatcher,
        platforms: PLATFORM_ALL,
        linksrc:"src/NodeEventTest/NodeEventTest.js",
        testScene:function () {
            NodeEventTestFlow.start();
        }
    },
    {
        title:"Extensions Test",
        resource:g_extensions,
        platforms: PLATFORM_ALL,
        linksrc:"",
        testScene:function () {
            return new ExtensionsTestScene();
        }
    },
    {
        title:"Interval Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/IntervalTest/IntervalTest.js",
        testScene:function () {
            return new IntervalTestScene();
        }
    },
    {
        title:"Layer Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/LayerTest/LayerTest.js",
        testScene:function () {
            return new LayerTestScene();
        }
    },
    {
        title:"Node Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/CocosNodeTest/CocosNodeTest.js",
        testScene:function () {
            return new NodeTestScene();
        }
    },
    {
        title:"OpenGL Test",
        resource:g_opengl_resources,
        platforms: PLATFORM_JSB_AND_WEBGL,
        linksrc:"src/OpenGLTest/OpenGLTest.js",
        testScene:function () {
            return new OpenGLTestScene();
        }
    },
    {
        title:"Parallax Test",
        resource:g_parallax,
        platforms: PLATFORM_ALL,
        linksrc:"src/ParallaxTest/ParallaxTest.js",
        testScene:function () {
            return new ParallaxTestScene();
        }
    },
    {
        title:"Particle Test",
        platforms: PLATFORM_ALL,
        linksrc:"",
        resource:g_particle,
        testScene:function () {
            return new ParticleTestScene();
        }
    },
    {
        title:"Path Tests",
        platforms: PLATFORM_ALL,
        linksrc:"src/PathTest/PathTest.js",
        testScene:function () {
            return new PathTestScene();
        }
    },
    {
        title:"ProgressActions Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/ProgressActionsTest/ProgressActionsTest.js",
        testScene:function () {
            return new ProgressActionsTestScene();
        }
    },
    {
        title:"Reflection Test",
        platforms: PLATFROM_ANDROID | PLATFROM_APPLE,
        linksrc:"src/ReflectionTest/ReflectionTest.js",
        testScene:function () {
            return new ReflectionTestScene();
        }
    },
    {
        title:"RenderTexture Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/RenderTextureTest/RenderTextureTest.js",
        testScene:function () {
            return new RenderTextureTestScene();
        }
    },
    {
        title:"Scheduler Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/SchedulerTest/SchedulerTest.js",
        testScene:function () {
            return new SchedulerTestScene();
        }
    },
    {
        title:"Spine Test",
        resource: g_spine,
        platforms: PLATFORM_ALL,
        linksrc:"src/SpineTest/SpineTest.js",
        testScene:function () {
            return new SpineTestScene();
        }
    },
    {
        title:"SpritePolygon Test",
        platforms: PLATFORM_JSB,
        linksrc:"src/SpritePolygonTest/SpritePolygonTest.js",
        testScene:function () {
            return new SpritePolygonTestScene();
        }
    },
    {
        title:"Sprite Test",
        resource:g_sprites,
        platforms: PLATFORM_ALL,
        linksrc:"src/SpriteTest/SpriteTest.js",
        testScene:function () {
            return new SpriteTestScene();
        }
    },
    {
        title:"Scale9Sprite Test",
        resource:g_s9s_blocks,
        platforms: PLATFORM_ALL,
        linksrc:"src/ExtensionsTest/S9SpriteTest/S9SpriteTest.js",
        testScene:function () {
            return new S9SpriteTestScene();
        }
    },
    {
        title:"TextureCache Test",
        platforms: PLATFORM_ALL,
        linksrc:"src/TextureCacheTest/TextureCacheTest.js",
        testScene:function () {
            return new TexCacheTestScene();
        }
    },
    {
        title:"TileMap Test",
        resource:g_tilemaps,
        platforms: PLATFORM_ALL,
        linksrc:"src/TileMapTest/TileMapTest.js",
        testScene:function () {
            return new TileMapTestScene();
        }
    },
    {
        title:"Sys Tests",
        platforms: PLATFORM_ALL,
        linksrc:"src/SysTest/SysTest.js",
        testScene:function () {
            return new SysTestScene();
        }
    },
    {
        title:"XMLHttpRequest",
        platforms: PLATFORM_ALL,
        linksrc:"src/XHRTest/XHRTest.js",
        testScene:function () {
            return new XHRTestScene();
        }
    },
    {
        title:"XMLHttpRequest send ArrayBuffer",
        platforms: PLATFORM_ALL,
        linksrc:"src/XHRTest/XHRArrayBufferTest.js",
        testScene:function () {
            return new XHRArrayBufferTestScene();
        }
    }
];
