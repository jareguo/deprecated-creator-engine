﻿largeModule('Class New');

test('test', function () {

    ok(cc.Class(), 'can define empty class');

    var Animal = cc.Class({
        name: 'Animal',
        properties: {
            myName: {
                default: '...',
                tooltip: 'Float',
                displayName: 'displayName'
            },
            eat: {
                default: function () {
                    return function () {
                        return 'eating';
                    }
                }
            },
            weight: {
                default: -1,
                serializable: false
            },
            weight10: {
                type: 'Integer',
                set: function (value) {
                    this.weight = Math.floor(value / 10);
                },
                get: function () {
                    return this.weight * 10;
                }
            },
            weight5x: {
                type: 'Integer',
                get: function () {
                    return this.weight * 5;
                },
                set: function (value) {
                    this.weight = value / 5;
                },
            },
            nonEmptyObj: {
                default: function () { return [1, 2]; }
            }
        }
    });

    strictEqual(cc.js.getClassName(Animal), 'Animal', 'get class name');

    // property

    var instance = new Animal();
    strictEqual(instance.myName, '...', 'get property');
    strictEqual(instance.eat(), 'eating', 'get chained property');
    strictEqual(instance.weight, -1, 'get partial property');
    deepEqual(instance.nonEmptyObj, [1, 2], 'get non-empty default value from function');
    notEqual(instance.nonEmptyObj, (new Animal()).nonEmptyObj, 'compute non-empty default value for every object instance');

    strictEqual(cc.Class.attr(Animal, 'myName').tooltip, 'Float', 'get name tooltip');
    strictEqual(cc.Class.attr(Animal, 'myName').displayName, 'displayName', 'get name displayName');
    strictEqual(cc.Class.attr(Animal, 'weight').serializable, false, 'get attribute');

    // getter / setter

    strictEqual(instance.weight10, instance.weight * 10, 'define getter');
    instance.weight10 = 40;
    strictEqual(instance.weight10, 40, 'define setter');

    strictEqual(instance.weight5x, instance.weight * 5, 'define getter by getset');
    instance.weight5x = 30;
    strictEqual(instance.weight5x, 30, 'define setter by getset');

    // constructor

    cc.js.unregisterClass(Animal);

    var animalCtor = new Callback();
    Animal = cc.Class({
        name: 'Animal',
        ctor: animalCtor,
        properties: {
            weight: 100
        }
    });
    var labradorConstructor = new Callback();
    var Labrador = Animal.extend({
        ctor: labradorConstructor
    });

    animalCtor.enable();
    var instance1 = new Animal();
    animalCtor.once('call constructor');

    strictEqual(cc.Class.attr(Animal, 'weight').default, 100, 'can get attribute even has constructor');
    strictEqual(instance1.weight, 100, 'property inited even has constructor');

    var instance2 = new Animal();
    instance1.weight = 0;
    strictEqual(instance2.weight, 100, 'is instance property');

    var instance3 = new Animal();
    strictEqual(instance3.weight, 100, 'class define not changed');

    labradorConstructor.enable();
    animalCtor.calledCount = 0;
    var instance4 = new Labrador();
    animalCtor.once('call constructor of parent class');
    labradorConstructor.once('call constructor of child class');

    cc.js.unregisterClass(Animal, Labrador);
});

test('define property in quick way', function () {
    var Class = cc.Class({
        properties: {
            undefinedVal: undefined,
            nullVal: null,
            string: '...',
            array: [],
            node: cc.Node,
            rawAsset: cc.Texture2D,
            asset: cc.SpriteFrame,
            vec2: cc.Vec2,
            vec2_one: cc.Vec2.ONE,
        }
    });
    var obj = new Class();

    strictEqual(obj.undefinedVal, undefined, 'could define default value of undefined');
    strictEqual(obj.nullVal, null, 'could define default value of null');
    strictEqual(obj.string, '...', 'could define default value of string');
    deepEqual(obj.array, [], 'could define default value of array');
    strictEqual(obj.node, null, 'could define default value of cc.Node');
    strictEqual(obj.rawAsset, '', 'could define default value of raw asset');
    strictEqual(obj.asset, null, 'could define default value of asset');
    ok(obj.vec2.equals(cc.Vec2.ZERO), 'could define default value by using cc.Vec2');
    ok(obj.vec2_one.equals(cc.Vec2.ONE), 'could define default value by using cc.Vec2.ONE');
});

test('Inherit', function () {
    var Animal = cc.Class({
        name: 'cc.Animal',
        properties: {
            myName: 'ann'
        }
    });
    var Dog = cc.Class({
        name: 'cc.Dog',
        extends: Animal,
        properties: {
            myName: {
                default: 'doge',
                tooltip: 'String',
                override: true
            }
        }
    });
    var Husky = cc.Class({
        name: 'cc.Husky',
        extends: Dog,
        properties: {
            weight: 100
        }
    });
    var Labrador = Dog.extend({
        name: 'cc.Labrador',
        properties: {
            clever: true
        }
    });

    strictEqual(cc.js.getClassName(Animal), 'cc.Animal', 'can get class name 1');
    strictEqual(cc.js.getClassName(Dog), 'cc.Dog', 'can get class name 2');
    strictEqual(cc.js.getClassName(Husky), 'cc.Husky', 'can get class name 3');
    strictEqual(cc.js.getClassName(Labrador), 'cc.Labrador', 'can get class name 4');

    strictEqual(Dog.$super, Animal, 'can get super');

    strictEqual(cc.Class.attr(Animal, 'myName'), cc.Class.attr(Dog, 'myName'),
                "inheritance chain shares the same property's attribute");
    strictEqual(cc.Class.attr(Dog, 'myName').tooltip, 'String', 'can modify attribute');
    strictEqual(cc.Class.attr(Dog, 'weight'), undefined, 'base property not added');

    var husky = new Husky();
    var dog = new Dog();
    var labrador = new Labrador();

    strictEqual(dog.myName, 'doge', 'can override property');
    strictEqual(husky.myName, 'doge', 'can inherit property');
    strictEqual(labrador.myName, 'doge', 'can inherit property with Dog.extend syntax');

    deepEqual(Husky.__props__, /*CCObject.__props__.concat*/(['myName', 'weight']), 'can inherit prop list');
    deepEqual(Labrador.__props__, /*CCObject.__props__.concat*/(['myName', 'clever']), 'can inherit prop list with Dog.extend syntax');
    deepEqual(Dog.__props__, /*CCObject.__props__.concat*/(['myName']), 'base prop list not changed');

    strictEqual(husky instanceof Dog, true, 'can pass instanceof check');
    strictEqual(husky instanceof Animal, true, 'can pass instanceof check for deep inheritance');
    strictEqual(labrador instanceof Dog, true, 'can pass instanceof check with Dog.extend syntax');

    cc.js.unregisterClass(Animal, Dog, Husky, Labrador);
});

test('Inherit + constructor', function () {
    var animalConstructor = Callback();
    var huskyConstructor = Callback();
    var labradorConstructor = Callback();
    var Animal = cc.Class({
        name: 'cc.Animal',
        ctor: animalConstructor,
        properties: {
            myName: 'ann'
        }
    });
    var Dog = cc.Class({
        name: 'cc.Dog',
        extends: Animal,
        properties: {
            myName: {
                default: 'doge',
                override: true
            },
        }
    });
    var Husky = cc.Class({
        name: 'cc.Husky',
        extends: Dog,
        ctor: huskyConstructor
    });
    var Labrador = Dog.extend({
        name: 'cc.Labrador',
        ctor: labradorConstructor
    });

    strictEqual(cc.js.getClassName(Dog), 'cc.Dog', 'can get class name 2');

    animalConstructor.enable();
    huskyConstructor.enable();
    labradorConstructor.enable();
    huskyConstructor.callbackFunction(function () {
        animalConstructor.once('base construct should called automatically');
        Husky.$super.call(this);
    });

    var husky = new Husky();
    huskyConstructor.once('call husky constructor');
    animalConstructor.once('call anim constructor by husky');

    var dog = new Dog();
    animalConstructor.once('call anim constructor by dog');

    var labrador = new Labrador();
    labradorConstructor.once('call labrador constructor');
    animalConstructor.once('call anim constructor by labrador');

    strictEqual(dog.myName, 'doge', 'can override property');
    strictEqual(husky.myName, 'doge', 'can inherit property');
    strictEqual(labrador.myName, 'doge', 'can inherit property with Dog.extend syntax');

    cc.js.unregisterClass(Animal, Dog, Husky, Labrador);
});

test('prop initial times', function () {
    var Base = cc.Class({
        properties: {
            foo: 0,
        }
    });
    var fooTester = Callback().enable();
    var instanceMocker = {
        ctor: Base,  // mock constructor of class instance
    };
    Object.defineProperty(instanceMocker, 'foo', {
        set: fooTester
    });
    Base.call(instanceMocker);
    fooTester.once('property should init once');

    var Sub = cc.Class({
        extends: Base,
        properties: {
            bar: 0,
        }
    });
    var barTester = Callback().enable();
    instanceMocker.constructor = Sub;
    Object.defineProperty(instanceMocker, 'bar', {
        set: barTester
    });
    Sub.call(instanceMocker);
    fooTester.once('foo prop should init once even if inherited');
    barTester.once('bar prop should init once');
});

test('prop reference', function () {
    var type = cc.Class({
        name: 'cc.MyType',
        properties: {
            ary: [],
            vec2: {
                default: new cc.Vec2(10, 20)
            },
            dict: {
                default: {}
            }
        }
    });
    var obj1 = new type();
    var obj2 = new type();

    notStrictEqual(obj1.vec2, obj2.vec2, 'cloneable object reference not equal');
    notStrictEqual(obj1.ary, obj2.ary, 'empty array reference not equal');
    notStrictEqual(obj1.dict, obj2.dict, 'empty dict reference not equal');

    cc.js.unregisterClass(type);
});

test('isChildClassOf', function () {
    strictEqual(cc.isChildClassOf(null, null) ||
                cc.isChildClassOf(Object, null) ||
                cc.isChildClassOf(null, Object),  false, 'nil');

    //strictEqual(cc.isChildClassOf(123, Object), false, 'can ignore wrong type');
    //strictEqual(cc.isChildClassOf(Object, 123), false, 'can ignore wrong type 2');

    strictEqual(cc.isChildClassOf(Object, Object), true, 'any obj is child of itself');

    var Base = function () {};

    strictEqual(cc.isChildClassOf(Base, Object) &&
                ! cc.isChildClassOf(Object, Base), true, 'any type is child of Object');

    Base = function () {};
    var Sub = function () {};
    cc.js.extend(Sub, Base);
    strictEqual(cc.isChildClassOf(Sub, Base) &&
                !cc.isChildClassOf(Base, Sub), true, 'Sub is child of Base');

    // fire class

    var Animal = cc.Class({
        name: 'cc.Animal',
        extends: Sub,
        properties: {
            name: 'ann'
        }
    });
    var Dog = cc.Class({
        name: 'cc.Dog',
        extends: Animal,
        properties: {
            name: {
                default: 'doge',
                override: true
            }
        }
    });
    var Husky = cc.Class({
        name: 'cc.Husky',
        extends: Dog,
        properties: {
            weight: 100
        }
    });
    var Labrador = Dog.extend({
        name: 'cc.Labrador',
        properties: {
            clever: true
        }
    });

    strictEqual(cc.isChildClassOf( Husky, Husky), true, 'Husky is child of itself');
    strictEqual(cc.isChildClassOf( Dog, Animal), true, 'Animal is parent of Dog');
    strictEqual(cc.isChildClassOf( Husky, Animal) &&
                ! cc.isChildClassOf( Animal, Husky), true, 'Animal is parent of Husky');
    strictEqual(cc.isChildClassOf( Dog, Husky), false, 'Dog is not child of Husky');
    strictEqual(cc.isChildClassOf( Labrador, Dog), true, 'Labrador is child of Dog');
    strictEqual(cc.isChildClassOf( Labrador, Animal), true, 'Labrador is child of Animal');

    strictEqual(cc.isChildClassOf( Animal, Sub), true, 'Animal is child of Sub');
    strictEqual(cc.isChildClassOf( Animal, Base), true, 'Animal is child of Base');
    strictEqual(cc.isChildClassOf( Dog, Base),  true, 'Dog is child of Base');

    cc.js.unregisterClass(Animal, Dog, Husky, Labrador);
});

test('statics', function () {
    var Animal = cc.Class({
        statics: {
            id: "be-bu"
        }
    });
    var Dog = cc.Class({
        extends: Animal
    });
    var Labrador = Dog.extend({
        name: 'cc.Labrador',
        statics: {
            nickName: "niuniu"
        }
    });

    strictEqual(Animal.id, "be-bu", 'can get static prop');
    strictEqual(Dog.id, "be-bu", 'can copy static prop to child class');
    strictEqual(Labrador.id, "be-bu", 'can copy static prop to child class with Dog.extend syntax');
    Animal.id = "duang-duang";
    strictEqual(Animal.id, "duang-duang", 'can set static prop');
    strictEqual(Labrador.nickName, "niuniu", 'can add static prop in child class');
    
    cc.js.unregisterClass(Animal, Dog, Labrador);
});

test('_isCCClass', function () {
    strictEqual(cc.Class._isCCClass(cc.Class({})), true, 'should be CCClass');

    function ctor () {
        this.foo = 0;
    }
    cc.Class._fastDefine('T', ctor, ['foo']);
    strictEqual(cc.Class._isCCClass(ctor), false, 'fastDefined ctor should not recognized as CCClass');

    cc.js.unregisterClass(ctor);
});

test('try catch', function () {
    var originThrow = cc._throw;

    cc._throw = Callback().enable();
    var Animal = cc.Class({
        ctor: function () {
            null.foo();
        }
    });
    var animal = new Animal();
    ok(animal, 'should create new instance even if an exception occurs');
    cc._throw.once('should throw exception');

    cc._throw = originThrow;
});

test('this._super', function () {
    var play = Callback();
    var getLost = Callback();
    var wagTail = Callback();
    var Dog = cc.Class({
        name: 'cc.Dog',
        play: play,
        getLost: getLost,
        wagTail: wagTail
    });
    var Husky = cc.Class({
        name: 'cc.Husky',
        extends: Dog,
        play: function () {
            this._super();
            this.getLost();
        }
    });
    var Labrador = Dog.extend({
        name: 'cc.Labrador',
        play: function () {
            this._super();
            this.wagTail();
        }
    });

    play.enable();
    getLost.enable();
    wagTail.enable();
    
    var husky = new Husky();
    husky.play();
    play.once("Husky is playing");
    getLost.once("Husky appears to be lost");

    var labrador = new Labrador();
    labrador.play();
    play.once("Labrador is playing");
    wagTail.once("Labrador is wagging its tail");

    cc.js.unregisterClass(Dog, Husky, Labrador);
});

test('property notify', function () {
    var string1 = "";
    var string2 = "";

    var Animal = cc.Class({
        properties: {
            legs: {
                default: 0,
                notify: function (oldValue) {
                    string1 = oldValue + " : " + this.legs;
                }
            },

            eyes: {
                default: 0,
                notify: function (oldValue) {
                    string2 = oldValue + " : " + this.eyes;
                }
            }
        }
    });

    var dogs = new Animal();
    dogs.legs = 4;
    dogs.eyes = 2;

    strictEqual(string1, "0 : 4", 'dogs has 4 legs');
    strictEqual(string2, "0 : 2", 'dogs has 2 eyes');
});

test('__cid__', function () {
    var Dog = cc.Class({
        name: 'cc.Dog'
    });
    var Husky = cc.Class({
        extends: Dog
    });
    var Labrador = Dog.extend({
    });

    ok(cc.js._getClassId(Dog).length > 0, "Dog's cid is not empty");
    ok(cc.js._getClassId(Husky).length > 0, "Husky's cid is not empty");
    ok(cc.js._getClassId(Labrador).length > 0, "Labrador's cid is not empty");
    notEqual(cc.js._getClassId(Dog), cc.js._getClassId(Husky), "Dog and Husky don't have the same cid");
    notEqual(cc.js._getClassId(Dog), cc.js._getClassId(Labrador), "Dog and Labrador don't have the same cid");
    notEqual(cc.js._getClassId(Labrador), cc.js._getClassId(Husky), "Labrador and Husky don't have the same cid");

    cc.js.unregisterClass(Dog, Husky, Labrador);
});

test('mixins', function () {
    var Mixin1 = cc.Class({
        properties: {
            p2: 'Defined by Mixin1',
            p3: 'Defined by Mixin1',
        },
        eat: function () {},
        drink: function () {},
        run: function () {},
    });
    var Mixin2 = cc.Class({
        properties: {
            p1: 'Defined by Mixin2',
            p2: 'Defined by Mixin2',
        },
        run: function () {},
        stop: function () {},
    });
    var Dog = cc.Class({
        properties: {
            p3: 'Defined by Dog',
        },
        play: function () {},
        drink: function () {},
    });
    var BigDog = cc.Class({
        extends: Dog,
        mixins: [Mixin1, Mixin2],
        properties: {
            p1: {
                default: 'Defined by BigDog',
                override: true
            },
            p4: 'Defined by BigDog',
        },
        stop: function () {},
    });

    ok(BigDog.prototype.play === Dog.prototype.play, "should inherit normal function");
    ok(BigDog.prototype.drink === Mixin1.prototype.drink, "mixin's function should override base's");
    ok(BigDog.prototype.run === Mixin2.prototype.run, "last mixin function should override previous");
    ok(BigDog.prototype.stop !== Mixin2.prototype.stop, "should override base functions");

    deepEqual(BigDog.__props__, ['p3', 'p2', 'p1', 'p4'], 'should inherit properties');
    strictEqual(cc.Class.attr(BigDog, 'p2').default, 'Defined by Mixin2', 'last mixin property should override previous');
    strictEqual(cc.Class.attr(BigDog, 'p1').default, 'Defined by BigDog', "should override base property");
});

asyncTest('instantiate properties in the next frame', function () {
    var Dog = cc.Class({
        properties: function () {
            return {
                like: 'shit'
            };
        }
    });
    var Husky = cc.Class({
        extends: Dog,
        properties: {
            weight: 100
        }
    });

    throws(
        function () {
            Husky.__props__.length;
        },
        'should raised error if accessing to props via Class'
    );

    setTimeout(function () {
        deepEqual(Husky.__props__, ['like', 'weight'], 'should get properties in the correct order');

        start();
    }, 0);
});

test('lazy instantiate properties', function () {
    var Dog = cc.Class({
        properties: function () {
            return {
                like: 'shit'
            };
        }
    });
    var Husky = cc.Class({
        extends: Dog,
        properties: {
            weight: 100
        }
    });

    var dog = new Husky();
    deepEqual(Husky.__props__, ['like', 'weight'], 'could get properties in the correct order after instantiating');
});
