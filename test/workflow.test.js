'use strict';

const assert = require('assert');
const Workflow = require('../electron/workflow/model/workflow');
const Node = require('../electron/workflow/model/node');
const EmptyNode = require('../electron/workflow/nodes/EmptyNode');
const Pipeline = require('../electron/workflow/model/pipeline');

describe('Workflow 模型', function() {
  it('未设置起始节点时 run 会抛错', function() {
    const wf = new Workflow('wf1');
    assert.throws(() => wf.run(new Pipeline()), /Start node not set/);
  });

  it('设置不存在的起始节点时抛错', function() {
    const wf = new Workflow('wf1');
    assert.throws(() => wf.setStart('n1'), /节点 n1 不存在/);
  });

  it('只包含一个空节点时 run 返回相同 Pipeline', function() {
    const wf = new Workflow('wf1');
    const node = new EmptyNode('n1');
    wf.addNode(node);
    wf.setStart('n1');
    const pipeline = new Pipeline();
    pipeline.add('text', 'hello');
    const out = wf.run(pipeline);
    assert.strictEqual(out, pipeline);
  });

  it('按 nextNodeId 顺序执行多个节点', function() {
    // 自定义节点，执行时添加数据
    class AppendNode extends Node {
      constructor(id, nextNodeId) {
        super(id, 'append', 'append', {}, nextNodeId);
      }
      process(p) {
        p.add('text', this.id);
        return p;
      }
    }
    const wf = new Workflow('wf2');
    const n1 = new AppendNode('n1', 'n2');
    const n2 = new AppendNode('n2', null);
    wf.addNode(n1);
    wf.addNode(n2);
    wf.setStart('n1');
    const p = new Pipeline();
    p.add('text', 'start');
    const result = wf.run(p);
    const values = result.getAll().map(m => m.value);
    assert.deepStrictEqual(values, ['start', 'n1', 'n2']);
  });

  it('检测到循环依赖时抛错', function() {
    class LoopNode extends Node {
      constructor(id, nextNodeId) {
        super(id, 'loop', 'loop', {}, nextNodeId);
      }
      process(p) {
        return p;
      }
    }
    const wf = new Workflow('loopWf');
    const n1 = new LoopNode('n1', 'n2');
    const n2 = new LoopNode('n2', 'n1');
    wf.addNode(n1);
    wf.addNode(n2);
    wf.setStart('n1');
    assert.throws(() => wf.run(new Pipeline()), /Detected circular dependency/);
  });
}); 