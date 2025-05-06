'use strict';

const assert = require('assert');
const Metadata = require('../electron/workflow/model/metadata');
const Pipeline = require('../electron/workflow/model/pipeline');

describe('Pipeline 模型', function() {
  it('默认构造应生成空列表', function() {
    const pipeline = new Pipeline();
    assert.deepStrictEqual(pipeline.getAll(), []);
  });

  it('add 方法应添加元数据实例', function() {
    const pipeline = new Pipeline();
    const metaInstance = new Metadata(Pipeline.Type.Text, 'hello');
    pipeline.addMetadata(metaInstance);
    const all = pipeline.getAll();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].type, Pipeline.Type.Text);
    assert.strictEqual(all[0].value, 'hello');
  });

  it('add(type, value) 方法应创建并添加元数据', function() {
    const pipeline = new Pipeline();
    pipeline.add(Pipeline.Type.Image, { url: '/path/to/img' });
    const all = pipeline.getAll();
    assert.strictEqual(all.length, 1);
    const meta = all[0];
    assert.strictEqual(meta.type, Pipeline.Type.Image);
    assert.deepStrictEqual(meta.value, { url: '/path/to/img' });
  });

  it('getByType 方法应根据类型返回元数据', function() {
    const pipeline = new Pipeline();
    pipeline.add(Pipeline.Type.Role, 'admin');
    const meta = pipeline.getByType(Pipeline.Type.Role);
    assert.ok(meta);
    assert.strictEqual(meta.type, Pipeline.Type.Role);
    assert.strictEqual(meta.value, 'admin');
  });

  it('removeByType 方法应移除指定类型的元数据', function() {
    const pipeline = new Pipeline();
    pipeline.add(Pipeline.Type.Text, 't1');
    pipeline.add(Pipeline.Type.Role, 'r1');
    pipeline.removeByType(Pipeline.Type.Role);
    const all = pipeline.getAll();
    assert.strictEqual(all.some(item => item.type === Pipeline.Type.Role), false);
    assert.strictEqual(all.length, 1);
  });

  it('Pipeline.Type 应包含定义的枚举值', function() {
    assert.strictEqual(Pipeline.Type.Text, 'text');
    assert.strictEqual(Pipeline.Type.Image, 'image');
    assert.strictEqual(Pipeline.Type.Role, 'role');
  });
}); 