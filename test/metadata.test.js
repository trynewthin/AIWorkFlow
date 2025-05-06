'use strict';

const assert = require('assert');
const Metadata = require('../electron/workflow/model/metadata');

describe('Metadata 模型', function() {
  it('构造时应正确设置 type 和 value', function() {
    const meta = new Metadata('text', 42);
    assert.strictEqual(meta.type, 'text');
    assert.strictEqual(meta.value, 42);
  });
}); 