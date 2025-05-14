/**
 * @file Pipeline.js
 * @description 管道类，封装多类型数据流，支持节点链式执行，使用对象类型存储数据体
 */
const { PipelineType, isValidPipelineType, DataType } = require('../../config/pipeline');

/**
 * Pipeline 类，封装多类型数据流，支持节点链式执行
 * @class
 */
class Pipeline {
  /**
   * @param {string} pipelineType - 管道类型，必须为合法的 PipelineType
   */
  constructor(pipelineType) {
    if (!pipelineType || !isValidPipelineType(pipelineType)) {
      throw new Error(`无效的 Pipeline 类型: ${pipelineType}`);
    }
    this.pipelineType = pipelineType;
    // 使用对象存储数据体，key 为数据类型，value 为数据内容
    this.items = {};
  }

  /**
   * 添加数据体
   * @param {string} type - 数据类型，必须为合法的 DataType
   * @param {*} data - 数据内容
   * @returns {Pipeline} 当前Pipeline实例
   */
  add(type, data) {
    if (!Object.values(DataType).includes(type)) {
      throw new Error(`无效的 DataType 类型: ${type}`);
    }
    this.items[type] = data;
    return this;
  }

  /**
   * 设置管道类型
   * @param {string} type - 管道类型，必须为合法的 PipelineType
   * @returns {Pipeline} 当前Pipeline实例
   */
  setPipelineType(type) {
    if (!isValidPipelineType(type)) {
      throw new Error(`无效的 Pipeline 类型: ${type}`);
    }
    this.pipelineType = type;
    return this;
  }

  /**
   * 获取管道类型
   * @returns {string|null} 管道类型
   */
  getPipelineType() {
    return this.pipelineType;
  }

  /**
   * 获取指定类型的数据体
   * @param {string} type - 数据类型
   * @returns {*} 对应类型的数据内容，如果不存在则返回 undefined
   */
  getByType(type) {
    return this.items[type];
  }

  /**
   * 获取所有数据体
   * @returns {Object} 数据类型与数据内容映射对象
   */
  getAll() {
    return this.items;
  }

  /**
   * 清空所有数据体
   * @returns {Pipeline} 当前Pipeline实例
   */
  clear() {
    this.items = {};
    return this;
  }

  /**
   * 快速创建包含单个数据体的管道
   * @param {string} pipelineType - 管道类型
   * @param {string} type - 数据类型
   * @param {*} data - 数据内容
   * @returns {Pipeline}
   */
  static of(pipelineType, type, data) {
    return new Pipeline(pipelineType).add(type, data);
  }

  /**
   * 快速将一个单数据管道类型和数据类型转换为指定类型
   * @param {Pipeline} pipeline - 原始管道实例
   * @param {string} pipelineType - 新的管道类型
   * @param {string} dataType - 新的数据类型，将应用于管道中的第一个数据项
   * @returns {Pipeline} 转换后的管道实例
   * @throws {Error} 如果传入的不是有效的管道实例
   */
  static convert(pipeline, pipelineType, dataType) {
    // 验证参数是否为 Pipeline 实例
    if (!pipeline || typeof pipeline.getPipelineType !== 'function') {
      throw new Error('convert 方法需要 Pipeline 实例作为第一个参数');
    }

    // 校验新的管道类型合法性
    if (!isValidPipelineType(pipelineType)) {
      throw new Error(`无效的 Pipeline 类型: ${pipelineType}`);
    }

    // 校验新的数据类型合法性
    if (!Object.values(DataType).includes(dataType)) {
      throw new Error(`无效的 DataType 类型: ${dataType}`);
    }

    const newPipeline = new Pipeline(pipelineType);
    // 获取原始管道中的所有数据项对象
    const items = pipeline.getAll();
    // 如果原始管道没有数据，直接返回空管道
    const keys = Object.keys(items);
    if (keys.length === 0) {
      return newPipeline;
    }
    // 取第一个数据项进行转换
    const firstData = items[keys[0]];
    newPipeline.add(dataType, firstData);
    return newPipeline;
  }
}

module.exports = Pipeline; 