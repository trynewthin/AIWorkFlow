'use strict';

const assert = require('assert');
const Node = require('../electron/workflow/model/node');
const Pipeline = require('../electron/workflow/model/pipeline');

describe('Node 基类', function() {
  it('构造函数应正确初始化属性', function() {
    const node = new Node('id1', 'typeA', 'nodeName', { foo: 1 }, 'id2');
    assert.strictEqual(node.id, 'id1');
    assert.strictEqual(node.type, 'typeA');
    assert.strictEqual(node.name, 'nodeName');
    assert.deepStrictEqual(node.config, { foo: 1 });
    assert.strictEqual(node.nextNodeId, 'id2');
  });

  it('默认构造时 type/name/config/nextNodeId 使用默认值', function() {
    const node = new Node('id1');
    assert.strictEqual(node.id, 'id1');
    assert.strictEqual(node.type, '');
    assert.strictEqual(node.name, '');
    assert.deepStrictEqual(node.config, {});
    assert.strictEqual(node.nextNodeId, '');
  });

  it('addNext 应设置下级节点 id', function() {
    const node = new Node('id1');
    node.addNext('id2');
    assert.strictEqual(node.getNextId(), 'id2');
  });

  it('getNextId 应返回下级节点 id', function() {
    const node = new Node('id1', 'typeA', 'nodeName', {}, 'id3');
    assert.strictEqual(node.getNextId(), 'id3');
  });

  it('process 默认抛出错误', function() {
    const node = new Node('id1');
    assert.throws(() => node.process(new Pipeline()), /子类必须实现 process 方法/);
  });
}); 