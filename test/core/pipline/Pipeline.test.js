/**
 * @file Pipeline.test.js
 * @description Pipeline 类测试
 */

const Pipeline = require('../../../electron/core/pipline/Pipeline');
const { DataType, PipelineType } = require('../../../electron/config/pipeline');

/**
 * @description Pipeline 类测试
 */
describe('Pipeline', () => {
  test('构造函数使用有效 PipelineType', () => {
    const pipeline = new Pipeline(PipelineType.CHAT);
    expect(pipeline.getPipelineType()).toBe(PipelineType.CHAT);
  });

  test('构造函数使用无效 PipelineType 抛出错误', () => {
    expect(() => new Pipeline('invalid')).toThrowError('无效的 Pipeline 类型: invalid');
  });

  test('add 方法使用有效 DataType', () => {
    const pipeline = new Pipeline(PipelineType.PROMPT);
    const returned = pipeline.add(DataType.TEXT, 'hello');
    expect(returned).toBe(pipeline);
    expect(pipeline.getByType(DataType.TEXT)).toBe('hello');
    expect(pipeline.getAll()).toEqual({ [DataType.TEXT]: 'hello' });
  });

  test('add 方法使用无效 DataType 抛出错误', () => {
    const pipeline = new Pipeline(PipelineType.PROMPT);
    expect(() => pipeline.add('invalid', 'data')).toThrowError('无效的 DataType 类型: invalid');
  });

  test('setPipelineType 方法使用有效类型', () => {
    const pipeline = new Pipeline(PipelineType.CHAT);
    const returned = pipeline.setPipelineType(PipelineType.RETRIEVAL);
    expect(returned).toBe(pipeline);
    expect(pipeline.getPipelineType()).toBe(PipelineType.RETRIEVAL);
  });

  test('setPipelineType 方法使用无效类型抛出错误', () => {
    const pipeline = new Pipeline(PipelineType.CHAT);
    expect(() => pipeline.setPipelineType('invalid')).toThrowError('无效的 Pipeline 类型: invalid');
  });

  test('getPipelineType、getByType、getAll、clear 方法', () => {
    const pipeline = Pipeline.of(PipelineType.EMBEDDING, DataType.EMBEDDING, [1, 2, 3]);
    expect(pipeline.getPipelineType()).toBe(PipelineType.EMBEDDING);
    expect(pipeline.getByType(DataType.EMBEDDING)).toEqual([1, 2, 3]);
    expect(pipeline.getAll()).toEqual({ [DataType.EMBEDDING]: [1, 2, 3] });
    const cleared = pipeline.clear();
    expect(cleared).toBe(pipeline);
    expect(pipeline.getAll()).toEqual({});
  });

  test('static of 方法创建单数据管道', () => {
    const pipeline = Pipeline.of(PipelineType.CHUNK, DataType.CHUNK, { text: 'chunk' });
    expect(pipeline).toBeInstanceOf(Pipeline);
    expect(pipeline.getPipelineType()).toBe(PipelineType.CHUNK);
    expect(pipeline.getByType(DataType.CHUNK)).toEqual({ text: 'chunk' });
  });

  describe('static convert 方法', () => {
    test('convert 方法参数非 Pipeline 实例抛出错误', () => {
      expect(() => Pipeline.convert(null, PipelineType.PROMPT, DataType.TEXT)).toThrowError('convert 方法需要 Pipeline 实例作为第一个参数');
    });

    test('convert 方法使用无效 PipelineType 抛出错误', () => {
      const pipeline = new Pipeline(PipelineType.CHAT);
      expect(() => Pipeline.convert(pipeline, 'invalid', DataType.TEXT)).toThrowError('无效的 Pipeline 类型: invalid');
    });

    test('convert 方法使用无效 DataType 抛出错误', () => {
      const pipeline = new Pipeline(PipelineType.CHAT);
      expect(() => Pipeline.convert(pipeline, PipelineType.PROMPT, 'invalid')).toThrowError('无效的 DataType 类型: invalid');
    });

    test('convert 方法转换空管道', () => {
      const pipeline = new Pipeline(PipelineType.CHAT);
      const converted = Pipeline.convert(pipeline, PipelineType.PROMPT, DataType.TEXT);
      expect(converted).toBeInstanceOf(Pipeline);
      expect(converted.getPipelineType()).toBe(PipelineType.PROMPT);
      expect(converted.getAll()).toEqual({});
    });

    test('convert 方法转换单数据管道', () => {
      const pipeline = Pipeline.of(PipelineType.CHAT, DataType.TEXT, 'hello');
      const converted = Pipeline.convert(pipeline, PipelineType.RETRIEVAL, DataType.DOCUMENT);
      expect(converted.getPipelineType()).toBe(PipelineType.RETRIEVAL);
      expect(converted.getAll()).toEqual({ [DataType.DOCUMENT]: 'hello' });
    });
  });
}); 