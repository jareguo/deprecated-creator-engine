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
/**
 * <p>
 *     The base class of event listener.                                                                        <br/>
 *     If you need custom listener which with different callback, you need to inherit this class.               <br/>
 *     For instance, you could refer to EventListenerAcceleration, EventListenerKeyboard,                       <br/>
 *      EventListenerTouchOneByOne, EventListenerCustom.
 * </p>
 * @class EventListener
 */
cc.EventListener = cc._Class.extend(/** @lends cc.EventListener# */{
    _onEvent: null,                          // Event callback function
    _type: 0,                                 // Event listener type
    _listenerID: null,                       // Event listener ID
    _registered: false,                     // Whether the listener has been added to dispatcher.

    _fixedPriority: 0,                      // The higher the number, the higher the priority, 0 is for scene graph base priority.
    _node: null,                           // scene graph based priority
    _target: null,
    _paused: true,                        // Whether the listener is paused
    _isEnabled: true,                      // Whether the listener is enabled

    /**
     * Initializes event with type and callback function.
     * @param {Number} type
     * @param {String} listenerID
     * @param {Function} callback
     */
    ctor: function (type, listenerID, callback) {
        this._onEvent = callback;
        this._type = type || 0;
        this._listenerID = listenerID || "";
    },

    /**
     * <p>
     *     Sets paused state for the listener
     *     The paused state is only used for scene graph priority listeners.
     *     `EventDispatcher::resumeAllEventListenersForTarget(node)` will set the paused state to `true`,
     *     while `EventDispatcher::pauseAllEventListenersForTarget(node)` will set it to `false`.
     *     @note 1) Fixed priority listeners will never get paused. If a fixed priority doesn't want to receive events,
     *              call `setEnabled(false)` instead.
     *            2) In `Node`'s onEnter and onExit, the `paused state` of the listeners which associated with that node will be automatically updated.
     * </p>
     * @param {Boolean} paused
     * @private
     */
    _setPaused: function (paused) {
        this._paused = paused;
    },

    /**
     * Checks whether the listener is paused.
     * @returns {Boolean}
     * @private
     */
    _isPaused: function () {
        return this._paused;
    },

    /**
     * Marks the listener was registered by EventDispatcher.
     * @param {Boolean} registered
     * @private
     */
    _setRegistered: function (registered) {
        this._registered = registered;
    },

    /**
     * Checks whether the listener was registered by EventDispatcher
     * @returns {Boolean}
     * @private
     */
    _isRegistered: function () {
        return this._registered;
    },

    /**
     * Gets the type of this listener
     * @note It's different from `EventType`, e.g. TouchEvent has two kinds of event listeners - EventListenerOneByOne, EventListenerAllAtOnce
     * @returns {Number}
     * @private
     */
    _getType: function () {
        return this._type;
    },

    /**
     *  Gets the listener ID of this listener
     *  When event is being dispatched, listener ID is used as key for searching listeners according to event type.
     * @returns {String}
     * @private
     */
    _getListenerID: function () {
        return this._listenerID;
    },

    /**
     * Sets the fixed priority for this listener
     *  @note This method is only used for `fixed priority listeners`, it needs to access a non-zero value. 0 is reserved for scene graph priority listeners
     * @param {Number} fixedPriority
     * @private
     */
    _setFixedPriority: function (fixedPriority) {
        this._fixedPriority = fixedPriority;
    },

    /**
     * Gets the fixed priority of this listener
     * @returns {Number} 0 if it's a scene graph priority listener, non-zero for fixed priority listener
     * @private
     */
    _getFixedPriority: function () {
        return this._fixedPriority;
    },

    /**
     * Sets scene graph priority for this listener
     * @param {_ccsg.Node|Node} node
     * @private
     */
    _setSceneGraphPriority: function (node) {
        this._target = node;
        this._node = node;
    },

    /**
     * Gets scene graph priority of this listener
     * @returns {_ccsg.Node|cc.Node} if it's a fixed priority listener, non-null for scene graph priority listener
     * @private
     */
    _getSceneGraphPriority: function () {
        return this._node;
    },

    /**
     * Checks whether the listener is available.
     * @returns {Boolean}
     */
    checkAvailable: function () {
        return this._onEvent !== null;
    },

    /**
     * Clones the listener, its subclasses have to override this method.
     * @returns {EventListener}
     */
    clone: function () {
        return null;
    },

    /**
     *  Enables or disables the listener
     *  @note Only listeners with `enabled` state will be able to receive events.
     *          When an listener was initialized, it's enabled by default.
     *          An event listener can receive events when it is enabled and is not paused.
     *          paused state is always false when it is a fixed priority listener.
     * @param {Boolean} enabled
     */
    setEnabled: function(enabled){
        this._isEnabled = enabled;
    },

    /**
     * Checks whether the listener is enabled
     * @returns {Boolean}
     */
    isEnabled: function(){
        return this._isEnabled;
    },

    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created a listener and haven't added it any target node during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     *
     * @method retain
     * @see cc.EventListener#release
     */
    retain:function () {
    },
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created a listener and haven't added it any target node during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
     *
     * @method release
     * @see cc.EventListener#retain
     */
    release:function () {
    }
});

// event listener type
/**
 * The type code of unknown event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.UNKNOWN = 0;
/**
 * The type code of one by one touch event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
/**
 * The type code of all at once touch event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
/**
 * The type code of keyboard event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.KEYBOARD = 3;
/**
 * The type code of mouse event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.MOUSE = 4;
/**
 * The type code of focus event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.ACCELERATION = 6;
/**
 * The type code of Focus change event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.FOCUS = 7;
/**
 * The type code of custom event listener.
 * @constant
 * @type {Number}
 */
cc.EventListener.CUSTOM = 8;

cc._EventListenerCustom = cc.EventListener.extend({
    _onCustomEvent: null,
    ctor: function (listenerId, callback) {
        this._onCustomEvent = callback;
        var selfPointer = this;
        var listener = function (event) {
            if (selfPointer._onCustomEvent !== null)
                selfPointer._onCustomEvent(event);
        };

        cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, listenerId, listener);
    },

    checkAvailable: function () {
        return (cc.EventListener.prototype.checkAvailable.call(this) && this._onCustomEvent !== null);
    },

    clone: function () {
        return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent);
    }
});

cc._EventListenerCustom.create = function (eventName, callback) {
    return new cc._EventListenerCustom(eventName, callback);
};

cc._EventListenerMouse = cc.EventListener.extend({
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    onMouseScroll: null,

    ctor: function () {
        var selfPointer = this;
        var listener = function (event) {
            var eventType = cc.Event.EventMouse;
            switch (event._eventType) {
                case eventType.DOWN:
                    if (selfPointer.onMouseDown)
                        selfPointer.onMouseDown(event);
                    break;
                case eventType.UP:
                    if (selfPointer.onMouseUp)
                        selfPointer.onMouseUp(event);
                    break;
                case eventType.MOVE:
                    if (selfPointer.onMouseMove)
                        selfPointer.onMouseMove(event);
                    break;
                case eventType.SCROLL:
                    if (selfPointer.onMouseScroll)
                        selfPointer.onMouseScroll(event);
                    break;
                default:
                    break;
            }
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, listener);
    },

    clone: function () {
        var eventListener = new cc._EventListenerMouse();
        eventListener.onMouseDown = this.onMouseDown;
        eventListener.onMouseUp = this.onMouseUp;
        eventListener.onMouseMove = this.onMouseMove;
        eventListener.onMouseScroll = this.onMouseScroll;
        return eventListener;
    },

    checkAvailable: function () {
        return true;
    }
});

cc._EventListenerMouse.LISTENER_ID = "__cc_mouse";

cc._EventListenerMouse.create = function () {
    return new cc._EventListenerMouse();
};

cc._EventListenerTouchOneByOne = cc.EventListener.extend({
    _claimedTouches: null,
    swallowTouches: false,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,
    onTouchCancelled: null,

    ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = [];
    },

    setSwallowTouches: function (needSwallow) {
        this.swallowTouches = needSwallow;
    },

    isSwallowTouches: function(){
        return this.swallowTouches;
    },

    clone: function () {
        var eventListener = new cc._EventListenerTouchOneByOne();
        eventListener.onTouchBegan = this.onTouchBegan;
        eventListener.onTouchMoved = this.onTouchMoved;
        eventListener.onTouchEnded = this.onTouchEnded;
        eventListener.onTouchCancelled = this.onTouchCancelled;
        eventListener.swallowTouches = this.swallowTouches;
        return eventListener;
    },

    checkAvailable: function () {
        if(!this.onTouchBegan){
            cc.log(cc._LogInfos._checkEventListenerAvailable.touchOneByOne);
            return false;
        }
        return true;
    }
});

cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";

cc._EventListenerTouchOneByOne.create = function () {
    return new cc._EventListenerTouchOneByOne();
};

cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
    onTouchesBegan: null,
    onTouchesMoved: null,
    onTouchesEnded: null,
    onTouchesCancelled: null,

    ctor: function(){
       cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null);
    },

    clone: function(){
        var eventListener = new cc._EventListenerTouchAllAtOnce();
        eventListener.onTouchesBegan = this.onTouchesBegan;
        eventListener.onTouchesMoved = this.onTouchesMoved;
        eventListener.onTouchesEnded = this.onTouchesEnded;
        eventListener.onTouchesCancelled = this.onTouchesCancelled;
        return eventListener;
    },

    checkAvailable: function(){
        if (this.onTouchesBegan === null && this.onTouchesMoved === null
            && this.onTouchesEnded === null && this.onTouchesCancelled === null) {
            cc.log(cc._LogInfos._checkEventListenerAvailable.touchAllAtOnce);
            return false;
        }
        return true;
    }
});

cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";

cc._EventListenerTouchAllAtOnce.create = function(){
     return new cc._EventListenerTouchAllAtOnce();
};

/**
 * Create a EventListener object by json object
 * @method create
 * @static
 * @param {Object} argObj a json object
 * @returns {EventListener}
 * todo: It should be the direct use new
 * @example {@link utils/api/engine/docs/cocos2d/core/event-manager/CCEventListener/create.js}
 */
cc.EventListener.create = function(argObj){

    cc.assert(argObj&&argObj.event, cc._LogInfos.EventListener.create);

    var listenerType = argObj.event;
    delete argObj.event;

    var listener = null;
    if(listenerType === cc.EventListener.TOUCH_ONE_BY_ONE)
        listener = new cc._EventListenerTouchOneByOne();
    else if(listenerType === cc.EventListener.TOUCH_ALL_AT_ONCE)
        listener = new cc._EventListenerTouchAllAtOnce();
    else if(listenerType === cc.EventListener.MOUSE)
        listener = new cc._EventListenerMouse();
    else if(listenerType === cc.EventListener.CUSTOM){
        listener = new cc._EventListenerCustom(argObj.eventName, argObj.callback);
        delete argObj.eventName;
        delete argObj.callback;
    } else if(listenerType === cc.EventListener.KEYBOARD)
        listener = new cc._EventListenerKeyboard();
    else if(listenerType === cc.EventListener.ACCELERATION){
        listener = new cc._EventListenerAcceleration(argObj.callback);
        delete argObj.callback;
    } else if(listenerType === cc.EventListener.FOCUS)
        listener = new cc._EventListenerFocus();

    for(var key in argObj) {
        listener[key] = argObj[key];
    }

    return listener;
};

cc._EventListenerFocus = cc.EventListener.extend({
    clone: function(){
        var listener = new cc._EventListenerFocus();
        listener.onFocusChanged = this.onFocusChanged;
        return listener;
    },
    checkAvailable: function(){
        if(!this.onFocusChanged){
            cc.log("Invalid EventListenerFocus!");
            return false;
        }
        return true;
    },
    onFocusChanged: null,
    ctor: function(){
        var listener = function(event){
            if(this.onFocusChanged)
                this.onFocusChanged(event._widgetLoseFocus, event._widgetGetFocus);
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.FOCUS, cc._EventListenerFocus.LISTENER_ID, listener);
    }
});

cc._EventListenerFocus.LISTENER_ID = "__cc_focus_event";

//Acceleration
cc._EventListenerAcceleration = cc.EventListener.extend({
    _onAccelerationEvent: null,

    ctor: function (callback) {
        this._onAccelerationEvent = callback;
        var selfPointer = this;
        var listener = function (event) {
            selfPointer._onAccelerationEvent(event._acc, event);
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.ACCELERATION, cc._EventListenerAcceleration.LISTENER_ID, listener);
    },

    checkAvailable: function () {

        cc.assert(this._onAccelerationEvent, cc._LogInfos._checkEventListenerAvailable.acceleration);

        return true;
    },

    clone: function () {
        return new cc._EventListenerAcceleration(this._onAccelerationEvent);
    }
});

cc._EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";

cc._EventListenerAcceleration.create = function (callback) {
    return new cc._EventListenerAcceleration(callback);
};


//Keyboard
cc._EventListenerKeyboard = cc.EventListener.extend({
    onKeyPressed: null,
    onKeyReleased: null,

    ctor: function () {
        var selfPointer = this;
        var listener = function (event) {
            if (event._isPressed) {
                if (selfPointer.onKeyPressed)
                    selfPointer.onKeyPressed(event._keyCode, event);
            } else {
                if (selfPointer.onKeyReleased)
                    selfPointer.onKeyReleased(event._keyCode, event);
            }
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.KEYBOARD, cc._EventListenerKeyboard.LISTENER_ID, listener);
    },

    clone: function () {
        var eventListener = new cc._EventListenerKeyboard();
        eventListener.onKeyPressed = this.onKeyPressed;
        eventListener.onKeyReleased = this.onKeyReleased;
        return eventListener;
    },

    checkAvailable: function () {
        if (this.onKeyPressed === null && this.onKeyReleased === null) {
            cc.log(cc._LogInfos._checkEventListenerAvailable.keyboard);
            return false;
        }
        return true;
    }
});

cc._EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";

cc._EventListenerKeyboard.create = function () {
    return new cc._EventListenerKeyboard();
};