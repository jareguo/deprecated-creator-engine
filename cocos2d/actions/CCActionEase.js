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

/**
 * @module cc
 */

/**
 * Base class for Easing actions
 * @class ActionEase
 * @extends ActionInterval
 * @param {ActionInterval} action
 */
cc.ActionEase = cc.ActionInterval.extend({
    _inner:null,

    ctor: function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        action && this.initWithAction(action);
    },

    /**
     * initializes the action
     *
     * @param {ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw new Error("cc.ActionEase.initWithAction(): action must be non nil");

        if (this.initWithDuration(action.getDuration())) {
            this._inner = action;
            return true;
        }
        return false;
    },

    clone:function(){
       var action = new cc.ActionEase();
        action.initWithAction(this._inner.clone());
        return action;
    },

    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._inner.startWithTarget(this.target);
    },

    stop:function () {
        this._inner.stop();
        cc.ActionInterval.prototype.stop.call(this);
    },

    update:function (dt) {
        this._inner.update(dt);
    },

    reverse:function () {
        return new cc.ActionEase(this._inner.reverse());
    },

    /**
     * Get inner Action.
     *
     * @return {ActionInterval}
     */
    getInnerAction:function(){
       return this._inner;
    }
});

cc.actionEase = function (action) {
    return new cc.ActionEase(action);
};

cc.ActionEase.create = cc.actionEase;

/**
 * Base class for Easing actions with rate parameters
 *
 * @class EaseRateAction
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} rate
 */
cc.EaseRateAction = cc.ActionEase.extend({
    _rate:0,

    ctor: function(action, rate){
        cc.ActionEase.prototype.ctor.call(this);

		rate !== undefined && this.initWithAction(action, rate);
    },

    /**
     * set rate value for the actions
     * @param {Number} rate
     */
    setRate:function (rate) {
        this._rate = rate;
    },

    /** get rate value for the actions
     * @return {Number}
     */
    getRate:function () {
        return this._rate;
    },

    /**
     * Initializes the action with the inner action and the rate parameter
     * @param {ActionInterval} action
     * @param {Number} rate
     * @return {Boolean}
     */
    initWithAction:function (action, rate) {
        if (cc.ActionEase.prototype.initWithAction.call(this, action)) {
            this._rate = rate;
            return true;
        }
        return false;
    },

    clone:function(){
        var action = new cc.EaseRateAction();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    reverse:function () {
        return new cc.EaseRateAction(this._inner.reverse(), 1 / this._rate);
    }
});

cc.easeRateAction = function (action, rate) {
    return new cc.EaseRateAction(action, rate);
};

cc.EaseRateAction.create = cc.easeRateAction;

/**
 * @module cc
 */

/*
 * cc.EaseIn action with a rate. From slow to fast.
 *
 * @class EaseIn
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeIn(3));
 *
 * @example
 * //The old usage
 * cc.EaseIn.create(action, 3);
 * //The new usage
 * action.easing(cc.easeIn(3.0));
 */
cc.EaseIn = cc.EaseRateAction.extend({

    update:function (dt) {
        this._inner.update(Math.pow(dt, this._rate));
    },

    reverse:function () {
        return new cc.EaseIn(this._inner.reverse(), 1 / this._rate);
    },

    clone:function(){
        var action = new cc.EaseIn();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    }
});

cc.EaseIn.create = function (action, rate) {
    return new cc.EaseIn(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * From slow to fast.
 *
 * @method easeIn
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeIn(3.0));
 */
cc.easeIn = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, this._rate);
        },
        reverse: function(){
            return cc.easeIn(1 / this._rate);
        }
    };
};

/*
 * cc.EaseOut action with a rate. From fast to slow.
 *
 * @class EaseOut
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeOut(3))
 *
 * @example
 * //The old usage
 * cc.EaseOut.create(action, 3);
 * //The new usage
 * action.easing(cc.easeOut(3.0));
 */
cc.EaseOut = cc.EaseRateAction.extend({
    update:function (dt) {
        this._inner.update(Math.pow(dt, 1 / this._rate));
    },

    reverse:function () {
        return new cc.EaseOut(this._inner.reverse(), 1 / this._rate);
    },

    clone:function(){
        var action = new cc.EaseOut();
        action.initWithAction(this._inner.clone(),this._rate);
        return action;
    }
});

cc.EaseOut.create = function (action, rate) {
    return new cc.EaseOut(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * From fast to slow.
 *
 * @method easeOut
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeOut(3.0));
 */
cc.easeOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, 1 / this._rate);
        },
        reverse: function(){
            return cc.easeOut(1 / this._rate);
        }
    };
};

/*
 * cc.EaseInOut action with a rate. <br />
 * Slow to fast then to slow.
 * @class EaseInOut
 * @extends EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeInOut(3.0))
 *
 * @example
 * //The old usage
 * cc.EaseInOut.create(action, 3);
 * //The new usage
 * action.easing(cc.easeInOut(3.0));
 */
cc.EaseInOut = cc.EaseRateAction.extend({
    update:function (dt) {
        dt *= 2;
        if (dt < 1)
            this._inner.update(0.5 * Math.pow(dt, this._rate));
        else
            this._inner.update(1.0 - 0.5 * Math.pow(2 - dt, this._rate));
    },

    clone:function(){
        var action = new cc.EaseInOut();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    reverse:function () {
        return new cc.EaseInOut(this._inner.reverse(), this._rate);
    }
});

cc.EaseInOut.create = function (action, rate) {
    return new cc.EaseInOut(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * Slow to fast then to slow.
 * @method easeInOut
 * @param {Number} rate
 * @return {Object}
 *
 * @example
 * //The new usage
 * action.easing(cc.easeInOut(3.0));
 */
cc.easeInOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(dt, this._rate);
            else
                return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
        },
        reverse: function(){
            return cc.easeInOut(this._rate);
        }
    };
};

/*
 * cc.Ease Exponential In. Slow to Fast. <br />
 * Reference easeInExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseExponentialIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 please action.easing(cc.easeExponentialIn())
 *
 * @example
 * //The old usage
 * cc.EaseExponentialIn.create(action);
 * //The new usage
 * action.easing(cc.easeExponentialIn());
 */
cc.EaseExponentialIn = cc.ActionEase.extend({
    update:function (dt) {
        this._inner.update(dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1)));
    },

    reverse:function () {
        return new cc.EaseExponentialOut(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseExponentialIn.create = function (action) {
    return new cc.EaseExponentialIn(action);
};

cc._easeExponentialInObj = {
    easing: function(dt){
        return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1));
    },
    reverse: function(){
        return cc._easeExponentialOutObj;
    }
};

/**
 * Creates the action easing object with the rate parameter. <br />
 * Reference easeInExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeExponentialIn
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeExponentialIn());
 */
cc.easeExponentialIn = function(){
    return cc._easeExponentialInObj;
};

/*
 * Ease Exponential Out. <br />
 * Reference easeOutExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseExponentialOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeExponentialOut())
 *
 * @example
 * //The old usage
 * cc.EaseExponentialOut.create(action);
 * //The new usage
 * action.easing(cc.easeExponentialOut());
 */
cc.EaseExponentialOut = cc.ActionEase.extend({
    update:function (dt) {
        this._inner.update(dt === 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1));
    },

    reverse:function () {
        return new cc.EaseExponentialIn(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseExponentialOut.create = function (action) {
    return new cc.EaseExponentialOut(action);
};

cc._easeExponentialOutObj = {
    easing: function(dt){
        return dt === 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1);
    },
    reverse: function(){
        return cc._easeExponentialInObj;
    }
};

/**
 * creates the action easing object. <br />
 * Reference easeOutExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeExponentialOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeExponentialOut());
 */
cc.easeExponentialOut = function(){
    return cc._easeExponentialOutObj;
};

/*
 * Ease Exponential InOut. <br />
 * Reference easeInOutExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 *
 * @class EaseExponentialInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeExponentialInOut)
 *
 * @example
 * //The old usage
 * cc.EaseExponentialInOut.create(action);
 * //The new usage
 * action.easing(cc.easeExponentialInOut());
 */
cc.EaseExponentialInOut = cc.ActionEase.extend({
    update:function (dt) {
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                dt = 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                dt = 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        this._inner.update(dt);
    },

    reverse:function () {
        return new cc.EaseExponentialInOut(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseExponentialInOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseExponentialInOut.create = function (action) {
    return new cc.EaseExponentialInOut(action);
};

cc._easeExponentialInOutObj = {
    easing: function(dt){
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        return dt;
    },
    reverse: function(){
        return cc._easeExponentialInOutObj;
    }
};

/**
 * creates an EaseExponentialInOut action easing object. <br />
 * Reference easeInOutExpo: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeExponentialInOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeExponentialInOut());
 */
cc.easeExponentialInOut = function(){
    return cc._easeExponentialInOutObj;
};

/*
 * Ease Sine In. <br />
 * Reference easeInSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseSineIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineIn())
 *
 * @example
 * //The old usage
 * cc.EaseSineIn.create(action);
 * //The new usage
 * action.easing(cc.easeSineIn());
 */
cc.EaseSineIn = cc.ActionEase.extend({
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
        this._inner.update(dt);
    },

    reverse:function () {
        return new cc.EaseSineOut(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseSineIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseSineIn.create = function (action) {
    return new cc.EaseSineIn(action);
};

cc._easeSineInObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
    },
    reverse: function(){
        return cc._easeSineOutObj;
    }
};
/**
 * creates an EaseSineIn action. <br />
 * Reference easeInSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeSineIn
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeSineIn());
 */
cc.easeSineIn = function(){
    return cc._easeSineInObj;
};

/*
 * Ease Sine Out. <br />
 * Reference easeOutSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseSineOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineOut())
 *
 * @example
 * //The old usage
 * cc.EaseSineOut.create(action);
 * //The new usage
 * action.easing(cc.easeSineOut());
 */
cc.EaseSineOut = cc.ActionEase.extend({
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : Math.sin(dt * Math.PI / 2);
        this._inner.update(dt);
    },

    reverse:function () {
        return new cc.EaseSineIn(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseSineOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseSineOut.create = function (action) {
    return new cc.EaseSineOut(action);
};

cc._easeSineOutObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : Math.sin(dt * Math.PI / 2);
    },
    reverse: function(){
        return cc._easeSineInObj;
    }
};

/**
 * Creates an EaseSineOut action easing object. <br />
 * Reference easeOutSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeSineOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeSineOut());
 */
cc.easeSineOut = function(){
    return cc._easeSineOutObj;
};

/*
 * Ease Sine InOut. <br />
 * Reference easeInOutSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class cc.EaseSineInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineInOut())
 *
 * @example
 * //The old usage
 * cc.EaseSineInOut.create(action);
 * //The new usage
 * action.easing(cc.easeSineInOut());
 */
cc.EaseSineInOut = cc.ActionEase.extend({
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
        this._inner.update(dt);
    },

    clone:function(){
        var action = new cc.EaseSineInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse:function () {
        return new cc.EaseSineInOut(this._inner.reverse());
    }
});

cc.EaseSineInOut.create = function (action) {
    return new cc.EaseSineInOut(action);
};

cc._easeSineInOutObj = {
    easing: function(dt){
        return (dt === 0 || dt === 1) ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
    },
    reverse: function(){
        return cc._easeSineInOutObj;
    }
};

/**
 * creates the action easing object. <br />
 * Reference easeInOutSine: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeSineInOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeSineInOut());
 */
cc.easeSineInOut = function(){
    return cc._easeSineInOutObj;
};

/**
 * Ease Elastic abstract class.
 * @class EaseElastic
 * @extends ActionEase
 * @param {ActionInterval} action
 * @param {Number} [period=0.3]
 */
cc.EaseElastic = cc.ActionEase.extend({
    _period: 0.3,

    ctor:function(action, period){
        cc.ActionEase.prototype.ctor.call(this);

		action && this.initWithAction(action, period);
    },

    /**
     * get period of the wave in radians. default is 0.3
     * @return {Number}
     */
    getPeriod:function () {
        return this._period;
    },

    /**
     * set period of the wave in radians.
     * @param {Number} period
     */
    setPeriod:function (period) {
        this._period = period;
    },

    /**
     * Initializes the action with the inner action and the period in radians (default is 0.3)
     * @param {ActionInterval} action
     * @param {Number} [period=0.3]
     * @return {Boolean}
     */
    initWithAction:function (action, period) {
        cc.ActionEase.prototype.initWithAction.call(this, action);
        this._period = (period == null) ? 0.3 : period;
        return true;
    },

    reverse:function () {
        cc.log("cc.EaseElastic.reverse(): it should be overridden in subclass.");
        return null;
    },

    clone:function(){
        var action = new cc.EaseElastic();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

cc.EaseElastic.create = function (action, period) {
    return new cc.EaseElastic(action, period);
};

/**
 * @module cc
 */

/*
 * Ease Elastic In action. <br />
 * Reference easeInElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseElasticIn
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(cc.easeElasticIn())
 *
 * @example
 * //The old usage
 * cc.EaseElasticIn.create(action, period);
 * //The new usage
 * action.easing(cc.easeElasticIn(period));
 */
cc.EaseElasticIn = cc.EaseElastic.extend({
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            dt = dt - 1;
            newT = -Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period);
        }
        this._inner.update(newT);
    },

    reverse:function () {
        return new cc.EaseElasticOut(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticIn();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

cc.EaseElasticIn.create = function (action, period) {
    return new cc.EaseElasticIn(action, period);
};

//default ease elastic in object (period = 0.3)
cc._easeElasticInObj = {
   easing:function(dt){
       if (dt === 0 || dt === 1)
           return dt;
       dt = dt - 1;
       return -Math.pow(2, 10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3);
   },
    reverse:function(){
        return cc._easeElasticOutObj;
    }
};

/**
 * Creates the action easing obejct with the period in radians (default is 0.3). <br />
 * Reference easeInElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeElasticIn
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeElasticIn(3.0));
 */
cc.easeElasticIn = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                if (dt === 0 || dt === 1)
                    return dt;
                dt = dt - 1;
                return -Math.pow(2, 10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period);
            },
            reverse:function () {
                return cc.easeElasticOut(this._period);
            }
        };
    }
    return cc._easeElasticInObj;
};

/*
 * Ease Elastic Out action. <br />
 * Reference easeOutElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseElasticOut
 * @extends EaseElastic
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeElasticOut(period))
 *
 * @example
 * //The old usage
 * cc.EaseElasticOut.create(action, period);
 * //The new usage
 * action.easing(cc.easeElasticOut(period));
 */
cc.EaseElasticOut = cc.EaseElastic.extend({
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period) + 1;
        }

        this._inner.update(newT);
    },

    reverse:function () {
        return new cc.EaseElasticIn(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

cc.EaseElasticOut.create = function (action, period) {
    return new cc.EaseElasticOut(action, period);
};

//default ease elastic out object (period = 0.3)
cc._easeElasticOutObj = {
    easing: function (dt) {
        return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3) + 1;
    },
    reverse:function(){
        return cc._easeElasticInObj;
    }
};
/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeOutElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeElasticOut
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeElasticOut(3.0));
 */
cc.easeElasticOut = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period) + 1;
            },
            reverse:function(){
                return cc.easeElasticIn(this._period);
            }
        };
    }
    return cc._easeElasticOutObj;
};

/*
 * Ease Elastic InOut action. <br />
 * Reference easeInOutElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseElasticInOut
 * @extends EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(cc.easeElasticInOut())
 *
 * @example
 * //The old usage
 * cc.EaseElasticInOut.create(action, period);
 * //The new usage
 * action.easing(cc.easeElasticInOut(period));
 */
cc.EaseElasticInOut = cc.EaseElastic.extend({
    update:function (dt) {
        var newT = 0;
        var locPeriod = this._period;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            dt = dt * 2;
            if (!locPeriod)
                locPeriod = this._period = 0.3 * 1.5;

            var s = locPeriod / 4;
            dt = dt - 1;
            if (dt < 0)
                newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
            else
                newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
        }
        this._inner.update(newT);
    },

    reverse:function () {
        return new cc.EaseElasticInOut(this._inner.reverse(), this._period);
    },

    clone:function(){
        var action = new cc.EaseElasticInOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

cc.EaseElasticInOut.create = function (action, period) {
    return new cc.EaseElasticInOut(action, period);
};

/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />
 * Reference easeInOutElastic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeElasticInOut
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeElasticInOut(3.0));
 */
cc.easeElasticInOut = function (period) {
    period = period || 0.3;
    return {
        _period: period,
        easing: function (dt) {
            var newT = 0;
            var locPeriod = this._period;
            if (dt === 0 || dt === 1) {
                newT = dt;
            } else {
                dt = dt * 2;
                if (!locPeriod)
                    locPeriod = this._period = 0.3 * 1.5;
                var s = locPeriod / 4;
                dt = dt - 1;
                if (dt < 0)
                    newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
                else
                    newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
            }
            return newT;
        },
        reverse: function(){
            return cc.easeElasticInOut(this._period);
        }
    };
};

/**
 * cc.EaseBounce abstract class.
 *
 * @class EaseBounce
 * @extends ActionEase
 */
cc.EaseBounce = cc.ActionEase.extend({
    /**
     * @param {Number} time1
     * @return {Number}
     */
    bounceTime:function (time1) {
        if (time1 < 1 / 2.75) {
            return 7.5625 * time1 * time1;
        } else if (time1 < 2 / 2.75) {
            time1 -= 1.5 / 2.75;
            return 7.5625 * time1 * time1 + 0.75;
        } else if (time1 < 2.5 / 2.75) {
            time1 -= 2.25 / 2.75;
            return 7.5625 * time1 * time1 + 0.9375;
        }

        time1 -= 2.625 / 2.75;
        return 7.5625 * time1 * time1 + 0.984375;
    },

    clone:function(){
        var action = new cc.EaseBounce();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse:function () {
        return new cc.EaseBounce(this._inner.reverse());
    }
});

cc.EaseBounce.create = function (action) {
    return new cc.EaseBounce(action);
};

/**
 * @module cc
 */

/*
 * cc.EaseBounceIn action. <br />
 * Eased bounce effect at the beginning.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBounceIn
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBounceIn())
 *
 * @example
 * //The old usage
 * cc.EaseBounceIn.create(action);
 * //The new usage
 * action.easing(cc.easeBounceIn());
 */
cc.EaseBounceIn = cc.EaseBounce.extend({
    update:function (dt) {
        var newT = 1 - this.bounceTime(1 - dt);
        this._inner.update(newT);
    },

    reverse:function () {
        return new cc.EaseBounceOut(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBounceIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseBounceIn.create = function (action) {
    return new cc.EaseBounceIn(action);
};

cc._bounceTime = function (time1) {
    if (time1 < 1 / 2.75) {
        return 7.5625 * time1 * time1;
    } else if (time1 < 2 / 2.75) {
        time1 -= 1.5 / 2.75;
        return 7.5625 * time1 * time1 + 0.75;
    } else if (time1 < 2.5 / 2.75) {
        time1 -= 2.25 / 2.75;
        return 7.5625 * time1 * time1 + 0.9375;
    }

    time1 -= 2.625 / 2.75;
    return 7.5625 * time1 * time1 + 0.984375;
};

cc._easeBounceInObj = {
    easing: function(dt){
        return 1 - cc._bounceTime(1 - dt);
    },
    reverse: function(){
        return cc._easeBounceOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning.
 * @method easeBounceIn
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBounceIn());
 */
cc.easeBounceIn = function(){
    return cc._easeBounceInObj;
};

/*
 * cc.EaseBounceOut action. <br />
 * Eased bounce effect at the ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBounceOut
 * @extends EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBounceOut())
 *
 * @example
 * //The old usage
 * cc.EaseBounceOut.create(action);
 * //The new usage
 * action.easing(cc.easeBounceOut());
 */
cc.EaseBounceOut = cc.EaseBounce.extend({
    update:function (dt) {
        var newT = this.bounceTime(dt);
        this._inner.update(newT);
    },

    reverse:function () {
        return new cc.EaseBounceIn(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBounceOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseBounceOut.create = function (action) {
    return new cc.EaseBounceOut(action);
};

cc._easeBounceOutObj = {
    easing: function(dt){
        return cc._bounceTime(dt);
    },
    reverse:function () {
        return cc._easeBounceInObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the ending.
 * @method easeBounceOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBounceOut());
 */
cc.easeBounceOut = function(){
    return cc._easeBounceOutObj;
};

/*
 * cc.EaseBounceInOut action. <br />
 * Eased bounce effect at the begining and ending.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBounceInOut
 * @extends EaseBounce
 *
 * @deprecated since v3.0 <br /> Please use acton.easing(cc.easeBounceInOut())
 *
 * @example
 * //The old usage
 * cc.EaseBounceInOut.create(action);
 * //The new usage
 * action.easing(cc.easeBounceInOut());
 */
cc.EaseBounceInOut = cc.EaseBounce.extend({
    update:function (dt) {
        var newT = 0;
        if (dt < 0.5) {
            dt = dt * 2;
            newT = (1 - this.bounceTime(1 - dt)) * 0.5;
        } else {
            newT = this.bounceTime(dt * 2 - 1) * 0.5 + 0.5;
        }
        this._inner.update(newT);
    },

    clone:function(){
        var action = new cc.EaseBounceInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse:function () {
        return new cc.EaseBounceInOut(this._inner.reverse());
    }
});

cc.EaseBounceInOut.create = function (action) {
    return new cc.EaseBounceInOut(action);
};

cc._easeBounceInOutObj = {
    easing: function (time1) {
        var newT;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - cc._bounceTime(1 - time1)) * 0.5;
        } else {
            newT = cc._bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }
        return newT;
    },
    reverse: function(){
        return cc._easeBounceInOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the begining and ending.
 * @method easeBounceInOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBounceInOut());
 */
cc.easeBounceInOut = function(){
    return cc._easeBounceInOutObj;
};

/*
 * cc.EaseBackIn action. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBackIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBackIn())
 *
 * @example
 * //The old usage
 * cc.EaseBackIn.create(action);
 * //The new usage
 * action.easing(cc.easeBackIn());
 */
cc.EaseBackIn = cc.ActionEase.extend({
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt===0 || dt===1 ? dt : dt * dt * ((overshoot + 1) * dt - overshoot);
        this._inner.update(dt);
    },

    reverse:function () {
        return new cc.EaseBackOut(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBackIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseBackIn.create = function (action) {
    return new cc.EaseBackIn(action);
};

cc._easeBackInObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        return (time1===0 || time1===1) ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot);
    },
    reverse: function(){
        return cc._easeBackOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.
 * @method easeBackIn
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBackIn());
 */
cc.easeBackIn = function(){
    return cc._easeBackInObj;
};

/*
 * cc.EaseBackOut action. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBackOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBackOut());
 *
 * @example
 * //The old usage
 * cc.EaseBackOut.create(action);
 * //The new usage
 * action.easing(cc.easeBackOut());
 */
cc.EaseBackOut = cc.ActionEase.extend({
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt - 1;
        this._inner.update(dt * dt * ((overshoot + 1) * dt + overshoot) + 1);
    },

    reverse:function () {
        return new cc.EaseBackIn(this._inner.reverse());
    },

    clone:function(){
        var action = new cc.EaseBackOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

cc.EaseBackOut.create = function (action) {
    return new cc.EaseBackOut(action);
};

cc._easeBackOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        time1 = time1 - 1;
        return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
    },
    reverse: function(){
        return cc._easeBackInObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Fast moving more than the finish, and then slowly back to the finish.
 * @method easeBackOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBackOut());
 */
cc.easeBackOut = function(){
    return cc._easeBackOutObj;
};

/*
 * cc.EaseBackInOut action. <br />
 * Begining of cc.EaseBackIn. Ending of cc.EaseBackOut.
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 * @class EaseBackInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBackInOut())
 *
 * @example
 * //The old usage
 * cc.EaseBackInOut.create(action);
 * //The new usage
 * action.easing(cc.easeBackInOut());
 */
cc.EaseBackInOut = cc.ActionEase.extend({
    update:function (dt) {
        var overshoot = 1.70158 * 1.525;
        dt = dt * 2;
        if (dt < 1) {
            this._inner.update((dt * dt * ((overshoot + 1) * dt - overshoot)) / 2);
        } else {
            dt = dt - 2;
            this._inner.update((dt * dt * ((overshoot + 1) * dt + overshoot)) / 2 + 1);
        }
    },

    clone:function(){
        var action = new cc.EaseBackInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse:function () {
        return new cc.EaseBackInOut(this._inner.reverse());
    }
});

cc.EaseBackInOut.create = function (action) {
    return new cc.EaseBackInOut(action);
};

cc._easeBackInOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158 * 1.525;
        time1 = time1 * 2;
        if (time1 < 1) {
            return (time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2;
        } else {
            time1 = time1 - 2;
            return (time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1;
        }
    },
    reverse: function(){
        return cc._easeBackInOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Begining of cc.EaseBackIn. Ending of cc.EaseBackOut.
 * @method easeBackInOut
 * @return {Object}
 * @example
 * // example
 * action.easing(cc.easeBackInOut());
 */
cc.easeBackInOut = function(){
    return cc._easeBackInOutObj;
};

/*
 * cc.EaseBezierAction action. <br />
 * Manually set a 4 order Bessel curve. <br />
 * According to the set point, calculate the trajectory.
 * @class EaseBezierAction
 * @extends ActionEase
 * @param {Action} action
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBezierAction())
 *
 * @example
 * //The old usage
 * var action = cc.EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage
 * action.easing(cc.easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
cc.EaseBezierAction = cc.ActionEase.extend({

    _p0: null,
    _p1: null,
    _p2: null,
    _p3: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * Initialization requires the application of Bessel curve of action.
     * @param {Action} action
     */
    ctor: function(action){
        cc.ActionEase.prototype.ctor.call(this, action);
    },

    _updateTime: function(a, b, c, d, t){
        return (Math.pow(1-t,3) * a + 3*t*(Math.pow(1-t,2))*b + 3*Math.pow(t,2)*(1-t)*c + Math.pow(t,3)*d );
    },

    update: function(dt){
        var t = this._updateTime(this._p0, this._p1, this._p2, this._p3, dt);
        this._inner.update(t);
    },

    clone: function(){
        var action = new cc.EaseBezierAction();
        action.initWithAction(this._inner.clone());
        action.setBezierParamer(this._p0, this._p1, this._p2, this._p3);
        return action;
    },

    reverse: function(){
        var action = new cc.EaseBezierAction(this._inner.reverse());
        action.setBezierParamer(this._p3, this._p2, this._p1, this._p0);
        return action;
    },

    /**
     * Set of 4 reference point
     * @param p0
     * @param p1
     * @param p2
     * @param p3
     */
    setBezierParamer: function(p0, p1, p2, p3){
        this._p0 = p0 || 0;
        this._p1 = p1 || 0;
        this._p2 = p2 || 0;
        this._p3 = p3 || 0;
    }
});

cc.EaseBezierAction.create = function(action){
    return new cc.EaseBezierAction(action);
};

/**
 * Creates the action easing object. <br />
 * Into the 4 reference point. <br />
 * To calculate the motion curve.
 * @method easeBezierAction
 * @param {Number} p0 The first bezier parameter
 * @param {Number} p1 The second bezier parameter
 * @param {Number} p2 The third bezier parameter
 * @param {Number} p3 The fourth bezier parameter
 * @returns {Object}
 * @example
 * // example
 * action.easing(cc.easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
cc.easeBezierAction = function(p0, p1, p2, p3){
    return {
        easing: function(time){
            return cc.EaseBezierAction.prototype._updateTime(p0, p1, p2, p3, time);
        },
        reverse: function(){
            return cc.easeBezierAction(p3, p2, p1, p0);
        }
    };
};

/*
 * cc.EaseQuadraticActionIn action. <br />
 * Reference easeInQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuadraticActionIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticAction())
 *
 * @example
 * //The old usage
 * cc.EaseQuadraticActionIn.create(action);
 * //The new usage
 * action.easing(cc.easeQuadraticActionIn());
 */
cc.EaseQuadraticActionIn = cc.ActionEase.extend({

    _updateTime: function(time){
        return Math.pow(time, 2);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuadraticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuadraticActionIn(this._inner.reverse());
    }

});

cc.EaseQuadraticActionIn.create = function(action){
    return new cc.EaseQuadraticActionIn(action);
};

cc._easeQuadraticActionIn = {
    easing: cc.EaseQuadraticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuadraticActionIn
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuadraticActionIn());
 */
cc.easeQuadraticActionIn = function(){
    return cc._easeQuadraticActionIn;
};

/*
 * cc.EaseQuadraticActionIn action. <br />
 * Reference easeOutQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuadraticActionOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut())
 *
 * @example
 * //The old usage
 * cc.EaseQuadraticActionOut.create(action);
 * //The new usage
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.EaseQuadraticActionOut = cc.ActionEase.extend({

    _updateTime: function(time){
        return -time*(time-2);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuadraticActionOut();
        action.initWithAction();
        return action;
    },

    reverse: function(){
        return new cc.EaseQuadraticActionOut(this._inner.reverse());
    }
});

cc.EaseQuadraticActionOut.create = function(action){
    return new cc.EaseQuadraticActionOut(action);
};

cc._easeQuadraticActionOut = {
    easing: cc.EaseQuadraticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionOut;
    }
};
/**
 * Creates the action easing object. <br />
 * Reference easeOutQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuadraticActionOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.easeQuadraticActionOut = function(){
    return cc._easeQuadraticActionOut;
};

/*
 * cc.EaseQuadraticActionInOut action. <br />
 * Reference easeInOutQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuadraticActionInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionInOut())
 *
 * @example
 * //The old usage
 * cc.EaseQuadraticActionInOut.create(action);
 * //The new usage
 * action.easing(cc.easeQuadraticActionInOut());
 */
cc.EaseQuadraticActionInOut = cc.ActionEase.extend({
    _updateTime: function(time){
        var resultTime = time;
        time *= 2;
        if(time < 1){
            resultTime = time * time * 0.5;
        }else{
            --time;
            resultTime = -0.5 * ( time * ( time - 2 ) - 1)
        }
        return resultTime;
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuadraticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuadraticActionInOut(this._inner.reverse());
    }
});

cc.EaseQuadraticActionInOut.create = function(action){
    return new cc.EaseQuadraticActionInOut(action);
};

cc._easeQuadraticActionInOut = {
    easing: cc.EaseQuadraticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuad: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuadraticActionInOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuadraticActionInOut());
 */
cc.easeQuadraticActionInOut = function(){
    return cc._easeQuadraticActionInOut;
};

/*
 * cc.EaseQuarticActionIn action. <br />
 * Reference easeInQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuarticActionIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionIn());
 *
 * @example
 * //The old usage
 * cc.EaseQuarticActionIn.create(action);
 * //The new usage
 * action.easing(cc.easeQuarticActionIn());
 */
cc.EaseQuarticActionIn = cc.ActionEase.extend({
    _updateTime: function(time){
        return time * time * time * time;
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuarticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuarticActionIn(this._inner.reverse());
    }
});

cc.EaseQuarticActionIn.create = function(action){
    return new cc.EaseQuarticActionIn(action);
};

cc._easeQuarticActionIn = {
    easing: cc.EaseQuarticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionIn;
    }
};
/**
 * Creates the action easing object. <br />
 * Reference easeIntQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuarticActionIn
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuarticActionIn());
 */
cc.easeQuarticActionIn = function(){
    return cc._easeQuarticActionIn;
};

/*
 * cc.EaseQuarticActionOut action. <br />
 * Reference easeOutQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuarticActionOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.QuarticActionOut());
 *
 * @example
 * //The old usage
 * cc.EaseQuarticActionOut.create(action);
 * //The new usage
 * action.easing(cc.EaseQuarticActionOut());
 */
cc.EaseQuarticActionOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time -= 1;
        return -(time * time * time * time - 1);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuarticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuarticActionOut(this._inner.reverse());
    }
});

cc.EaseQuarticActionOut.create = function(action){
    return new cc.EaseQuarticActionOut(action);
};

cc._easeQuarticActionOut = {
    easing: cc.EaseQuarticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuarticActionOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.QuarticActionOut());
 */
cc.easeQuarticActionOut = function(){
    return cc._easeQuarticActionOut;
};

/*
 * cc.EaseQuarticActionInOut action. <br />
 * Reference easeInOutQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuarticActionInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionInOut());
 *
 * @example
 * //The old usage
 * cc.EaseQuarticActionInOut.create(action);
 * //The new usage
 * action.easing(cc.easeQuarticActionInOut());
 */
cc.EaseQuarticActionInOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time;
        time -= 2;
        return -0.5 * (time * time * time * time - 2);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuarticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuarticActionInOut(this._inner.reverse());
    }
});

cc.EaseQuarticActionInOut.create = function(action){
    return new cc.EaseQuarticActionInOut(action);
};

cc._easeQuarticActionInOut = {
    easing: cc.EaseQuarticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionInOut;
    }
};
/**
 * Creates the action easing object.  <br />
 * Reference easeInOutQuart: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuarticActionInOut
 * @returns {Object}
 */
cc.easeQuarticActionInOut = function(){
    return cc._easeQuarticActionInOut;
};

/*
 * cc.EaseQuinticActionIn action. <br />
 * Reference easeInQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuinticActionIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionIn());
 *
 * @example
 * //The old usage
 * cc.EaseQuinticActionIn.create(action);
 * //The new usage
 * action.easing(cc.easeQuinticActionIn());
 */
cc.EaseQuinticActionIn = cc.ActionEase.extend({
    _updateTime: function(time){
        return time * time * time * time * time;
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuinticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuinticActionIn(this._inner.reverse());
    }
});

cc.EaseQuinticActionIn.create = function(action){
    return new cc.EaseQuinticActionIn(action);
};

cc._easeQuinticActionIn = {
    easing: cc.EaseQuinticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuinticActionIn
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuinticActionIn());
 */
cc.easeQuinticActionIn = function(){
    return cc._easeQuinticActionIn;
};

/*
 * cc.EaseQuinticActionOut action. <br />
 * Reference easeQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuinticActionOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut());
 *
 * @example
 * //The old usage
 * cc.EaseQuinticActionOut.create(action);
 * //The new usage
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.EaseQuinticActionOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time -=1;
        return (time * time * time * time * time + 1);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuinticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuinticActionOut(this._inner.reverse());
    }
});

cc.EaseQuinticActionOut.create = function(action){
    return new cc.EaseQuinticActionOut(action);
};

cc._easeQuinticActionOut = {
    easing: cc.EaseQuinticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuinticActionOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.easeQuinticActionOut = function(){
    return cc._easeQuinticActionOut;
};

/*
 * cc.EaseQuinticActionInOut action. <br />
 * Reference easeInOutQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseQuinticActionInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionInOut());
 *
 * @example
 * //The old usage
 * cc.EaseQuinticActionInOut.create(action);
 * //The new usage
 * action.easing(cc.easeQuinticActionInOut());
 */
cc.EaseQuinticActionInOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time * time * time + 2);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseQuinticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseQuinticActionInOut(this._inner.reverse());
    }
});

cc.EaseQuinticActionInOut.create = function(action){
    return new cc.EaseQuinticActionInOut(action);
};

cc._easeQuinticActionInOut = {
    easing: cc.EaseQuinticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutQuint: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeQuinticActionInOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeQuinticActionInOut());
 */
cc.easeQuinticActionInOut = function(){
    return cc._easeQuinticActionInOut;
};

/*
 * cc.EaseCircleActionIn action. <br />
 * Reference easeInCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCircleActionIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionIn());
 *
 * @example
 * //The old usage
 * cc.EaseCircleActionIn.create(action);
 * //The new usage
 * action.easing(cc.easeCircleActionIn());
 */
cc.EaseCircleActionIn = cc.ActionEase.extend({
    _updateTime: function(time){
        return -1 * (Math.sqrt(1 - time * time) - 1);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCircleActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCircleActionIn(this._inner.reverse());
    }
});

cc.EaseCircleActionIn.create = function(action){
    return new cc.EaseCircleActionIn(action);
};

cc._easeCircleActionIn = {
    easing: cc.EaseCircleActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCircleActionIn
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeCircleActionIn());
 */
cc.easeCircleActionIn = function(){
    return cc._easeCircleActionIn;
};

/*
 * cc.EaseCircleActionOut action. <br />
 * Reference easeOutCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCircleActionOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionOut());
 *
 * @example
 * //The old usage
 * cc.EaseCircleActionOut.create(action);
 * //The new usage
 * action.easing(cc.easeCircleActionOut());
 */
cc.EaseCircleActionOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time = time - 1;
        return Math.sqrt(1 - time * time);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCircleActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCircleActionOut(this._inner.reverse());
    }
});

cc.EaseCircleActionOut.create = function(action){
    return new cc.EaseCircleActionOut(action);
};

cc._easeCircleActionOut = {
    easing: cc.EaseCircleActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCircleActionOut
 * @returns {Object}
 * @exampple
 * //example
 * actioneasing(cc.easeCircleActionOut());
 */
cc.easeCircleActionOut = function(){
    return cc._easeCircleActionOut;
};

/*
 * cc.EaseCircleActionInOut action. <br />
 * Reference easeInOutCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCircleActionInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionInOut());
 *
 * @example
 * //The old usage
 * cc.EaseCircleActionInOut.create(action);
 * //The new usage
 * action.easing(cc.easeCircleActionInOut());
 */
cc.EaseCircleActionInOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time = time * 2;
        if (time < 1)
            return -0.5 * (Math.sqrt(1 - time * time) - 1);
        time -= 2;
        return 0.5 * (Math.sqrt(1 - time * time) + 1);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCircleActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCircleActionInOut(this._inner.reverse());
    }
});

cc.EaseCircleActionInOut.create = function(action){
    return new cc.EaseCircleActionInOut(action);
};

cc._easeCircleActionInOut = {
    easing: cc.EaseCircleActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCirc: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCircleActionInOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeCircleActionInOut());
 */
cc.easeCircleActionInOut = function(){
    return cc._easeCircleActionInOut;
};

/*
 * cc.EaseCubicActionIn action. <br />
 * Reference easeInCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCubicActionIn
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> action.easing(cc.easeCubicActionIn());
 *
 * @example
 * //The old usage
 * cc.EaseCubicActionIn.create(action);
 * //The new usage
 * action.easing(cc.easeCubicActionIn());
 */
cc.EaseCubicActionIn = cc.ActionEase.extend({
    _updateTime: function(time){
        return time * time * time;
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCubicActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCubicActionIn(this._inner.reverse());
    }
});

cc.EaseCubicActionIn.create = function(action){
    return new cc.EaseCubicActionIn(action);
};

cc._easeCubicActionIn = {
    easing: cc.EaseCubicActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionIn;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCubicActionIn
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeCubicActionIn());
 */
cc.easeCubicActionIn = function(){
    return cc._easeCubicActionIn;
};

/*
 * cc.EaseCubicActionOut action. <br />
 * Reference easeOutCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCubicActionOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionOut());
 *
 * @example
 * //The old usage
 * cc.EaseCubicActionOut.create(action);
 * //The new usage
 * action.easing(cc.easeCubicActionOut());
 */
cc.EaseCubicActionOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time -= 1;
        return (time * time * time + 1);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCubicActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCubicActionOut(this._inner.reverse());
    }
});

cc.EaseCubicActionOut.create = function(action){
    return new cc.EaseCubicActionOut(action);
};

cc._easeCubicActionOut = {
    easing: cc.EaseCubicActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeOutCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCubicActionOut
 * @returns {Object}
 * @example
 * //example
 * action.easing(cc.easeCubicActionOut());
 */
cc.easeCubicActionOut = function(){
    return cc._easeCubicActionOut;
};

/*
 * cc.EaseCubicActionInOut action. <br />
 * Reference easeInOutCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @class EaseCubicActionInOut
 * @extends ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionInOut());
 *
 * @example
 * //The old usage
 * cc.EaseCubicActionInOut.create(action);
 * //The new usage
 * action.easing(cc.easeCubicActionInOut());
 */
cc.EaseCubicActionInOut = cc.ActionEase.extend({
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time + 2);
    },

    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    clone: function(){
        var action = new cc.EaseCubicActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    reverse: function(){
        return new cc.EaseCubicActionInOut(this._inner.reverse());
    }
});

cc.EaseCubicActionInOut.create = function(action){
    return new cc.EaseCubicActionInOut(action);
};

cc._easeCubicActionInOut = {
    easing: cc.EaseCubicActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionInOut;
    }
};

/**
 * Creates the action easing object. <br />
 * Reference easeInOutCubic: <br />
 * http://www.zhihu.com/question/21981571/answer/19925418
 * @method easeCubicActionInOut
 * @returns {Object}
 */
cc.easeCubicActionInOut = function(){
    return cc._easeCubicActionInOut;
};

