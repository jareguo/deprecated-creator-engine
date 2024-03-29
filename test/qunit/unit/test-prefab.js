(function () {

    if (!TestEditorExtends) {
        return;
    }

    //var testingCompCallback = false;

    var MyComponent = cc.Class({
        name: '45664564',
        extends: CallbackTester,
        editor: {
            executeInEditMode: true
        },
        //_assert: function (actual) {
        //    if (testingCompCallback) {
        //        this._super(actual);
        //    }
        //}
    });

    largeModule('Prefab', {
        setup: function () {
            _resetGame();
            AssetLibrary.init({libraryPath: '../assets/library'});
        },
        //teardownOnce: function () {
        //    console.log('teardownOnce');
        //    //testNode.destroy();
        //    cc.js.unregisterClass(MyComponent);
        //}
    });

    test('basic test', function() {
        var node = new cc.Node();
        ok(node.hasOwnProperty('_prefab'), '"_prefab" defines in node');
        ok(!node._prefab, "but the default value should be null");
    });

    var UUID = '19851210';
    var OUTPUT_PREFAB = 0;

    var parent = new cc.Node('parent');
    var child = new cc.Node('child');
    var child2 = new cc.Node('child2');
    child2.addComponent(MyComponent);
    var otherNode = new cc.Node('other');

    child.parent = parent;
    child2.parent = parent;
    parent.scale = cc.v2(123, 432);
    child.scale = cc.v2(22, 11);
    var ensureIdInitialized = parent.uuid;
    var comp = parent.addComponent(TestScript);
    comp.target = child;
    comp.target2 = otherNode;

    var prefab;
    var prefabJson;

    (function savePrefab () {
        prefab = _Scene.PrefabUtils.createPrefabFrom(parent);
        _Scene.PrefabUtils.savePrefabUuid(parent, UUID);

        // 已经加载好的 prefab，去除类型，去除 runtime node
        prefabJson = Editor.serialize(prefab);
        if (OUTPUT_PREFAB) {
            console.log(prefabJson);
        }
        prefab = cc.deserialize(prefabJson);
        prefab._uuid = UUID;
    })();

    test('create prefab', function () {
        var prefabInfo = parent._prefab;

        ok(prefab !== null, "prefab asset should be created");
        ok(prefabInfo !== null, "wrapper should preserve the prefab info");
        ok(prefabInfo.asset instanceof cc.Asset, "the prefab asset should be preserved");
        strictEqual(prefabInfo.asset._uuid, UUID, "the prefab asset should be preserved");

        var nodeToSave = prefab.data;
        ok(nodeToSave instanceof cc.Node, 'Checking prefab data');
        ok(!nodeToSave._id, 'The id in prefab data should be cleared');
        strictEqual(nodeToSave.scaleX, 123, 'Checking prefab data');
        strictEqual(nodeToSave.scaleY, 432, 'Checking prefab data');
        var comp = nodeToSave.getComponent(TestScript);
        ok(comp.constructor === TestScript, 'Should save component');
        ok(comp.target === nodeToSave.children[0], 'Should redirect node property when saving');
        ok(comp.target2 === null, 'Should not save other nodes in the scene');

        var childToSave = nodeToSave.children[0];
        ok(childToSave, 'Should save child');
        strictEqual(childToSave.scaleX, 22, 'Checking child wrapper');
        strictEqual(childToSave.scaleY, 11, 'Checking child wrapper');

        // change parent

        child2.parent = null;
        strictEqual(child2._prefab, null, 'Prefab info should be cleared if detached from parent');
    });

    test('instantiate prefab', function () {
        var newNode = cc.instantiate(prefab);
        var newNode2 = cc.instantiate(prefab);
        var prefabInfo = newNode._prefab;

        ok(newNode, "new node should be created");
        ok(prefabInfo, "new node should preserve the prefab info");
        ok(prefabInfo.asset === prefab, "should reference to origin prefab asset in prefab info");
        notEqual(newNode, newNode2, 'The new nodes should be different');

        ok(newNode instanceof cc.Node, 'Checking instance');
        notEqual(newNode.uuid, newNode2.uuid, 'The id of instances should be different');
        ok(newNode.scaleX === 123, 'Checking instance');
        ok(newNode.scaleY === 432, 'Checking instance');
        ok(newNode.getComponent(TestScript).constructor === TestScript, 'Should restore component');
        ok(newNode.getComponent(TestScript).target === newNode.children[0], 'Should restore component property');

        ok(newNode.children.length === 2, 'Should load child');
        var c = newNode.children[0];
        ok(c.getScaleX() === 22 && c.getScaleY() === 11, 'Checking child');
    });

    test('re-instantiate an instantiated node', function () {
        var first = cc.instantiate(prefab);
        var second = cc.instantiate(first);
        var secondInfo = second._prefab;

        ok(second, "new node should be created");
        ok(secondInfo, "new node should preserve the prefab info");
        ok(secondInfo !== first._prefab, "prefab info should not the same");
        ok(secondInfo.asset === prefab, "should reference to origin prefab asset in prefab info");
        ok(secondInfo.root === second, "check root");
        ok(secondInfo.fileId === first._prefab.fileId, "check fileId");

        notEqual(first.uuid, second.uuid, 'The id of instances should be different');
    });

    asyncTest('revert prefab', function () {
        // stub
        cc.loader.insertPipe({
            id : 'Prefab_Provider',
            async : false,
            handle : function (item) {
                var url = item.id;
                if (url === UUID) {
                    item.states['Downloader'] = cc.Pipeline.ItemState.COMPLETE;
                    return JSON.stringify(prefabJson);
                }
                else {
                    return;
                }
            }
        }, 0);

        var testNode = cc.instantiate(prefab);
        var testChild = testNode.children[0];

        testNode.scale = 0;
        testNode.removeComponent(TestScript);
        testNode.children[1].parent = null;
        testChild.scale = cc.Vec2.ZERO;
        testChild.addComponent(TestScript);

        var newNode = new cc.Node();
        newNode.parent = testChild;

        var newNode2 = new cc.Node();
        newNode2.parent = testNode;
        newNode2.setSiblingIndex(0);

        _Scene.PrefabUtils.revertPrefab(testNode, function () {
            ok(testNode.getScaleX() === 123 && testNode.getScaleY() === 432, 'Revert property of the parent node');
            ok(testNode.getComponent(TestScript).constructor === TestScript, 'Restore removed component');
            var c = testNode.children[0];
            ok(c.getScaleX() === 22 && c.getScaleY() === 11, 'Revert child node');
            ok(testChild.getComponent(TestScript) == null, 'Remove added component');

            ok(testNode.getComponent(TestScript).target === testChild, 'Should redirect reference to scene node');

            strictEqual(testChild.children.length, 0, 'Should remove new node');

            strictEqual(testNode.childrenCount, 2, 'Should create removed node');
            var created = testNode.children[1];
            ok(created._sgNode, 'Checking created node');

            var comp = created.getComponent(MyComponent);
            comp.resetExpect(CallbackTester.OnLoad, 'call onLoad while attaching to node');
            comp.pushExpect(CallbackTester.OnEnable, 'then call onEnable if node active');

            cc.director.getScene().addChild(testNode);

            comp.stopTest();

            strictEqual(newNode2.isValid, false, 'should remove new node which is not the last sibling');

            start();
        });
    });
})();
