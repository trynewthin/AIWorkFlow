/**
 * @file Pipeline.js
 * @description 管道类，封装多类型数据流，支持节点链式执行，使用对象类型存储数据体
 */
const { PipelineType, isValidPipelineType, DataType } = require('../configs/index');

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
    // 使用数组存储数据体，每个元素是 {type, data} 对象
    this.items = [];
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
    this.items.push({ type, data });
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
    const item = this.items.find(it => it.type === type);
    return item ? item.data : undefined;
  }

  /**
   * 获取所有数据体
   * @returns {Array<Object>} 包含所有 {type, data} 对象的数据数组
   */
  getAll() {
    return this.items;
  }

  /**
   * 清空所有数据体
   * @returns {Pipeline} 当前Pipeline实例
   */
  clear() {
    this.items = [];
    return this;
  }

  /**
   * @description 将管道对象转换为 JSON 对象
   * @returns {Object} 包含 pipelineType 和 items 的 JSON 表示
   */
  toJSON() {
    return {
      pipelineType: this.pipelineType,
      items: this.items
    };
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
    // 获取原始管道中的所有数据项数组
    const items = pipeline.getAll();
    // 如果原始管道没有数据，直接返回空管道
    if (items.length === 0) {
      return newPipeline;
    }
    // 取第一个数据项进行转换
    const firstItem = items[0];
    newPipeline.add(dataType, firstItem.data);
    return newPipeline;
  }
}

module.exports = Pipeline; 