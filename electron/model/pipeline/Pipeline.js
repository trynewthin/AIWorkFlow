// Pipeline 类：封装多类型数据的流，支持节点链式执行
class Pipeline {
  /**
   * @param {string} pipelineType - 管道类型必须指定
   */
  constructor(pipelineType) {
    // 管道类型必须指定
    if (!pipelineType) {
      throw new Error('Pipeline 类型必须指定');
    }
    this.pipelineType = pipelineType;
    // 使用数组存储数据体，格式 { type, data }
    this.items = [];
  }

  /**
   * 添加数据体
   * @param {string} type - 数据类型
   * @param {*} data - 数据内容
   * @returns {Pipeline} 当前Pipeline实例
   */
  add(type, data) {
    this.items.push({ type, data });
    return this;
  }

  /**
   * 设置管道类型
   * @param {string} type - 管道类型
   * @returns {Pipeline} 当前Pipeline实例
   */
  setPipelineType(type) {
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
   * 获取指定类型的数据体列表
   * @param {string} type - 数据类型
   * @returns {Array} 匹配的数据体数组
   */
  getByType(type) {
    return this.items.filter(item => item.type === type);
  }

  /**
   * 获取所有数据体
   * @returns {Array} 数据体数组
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
   * 快速创建包含单个数据体的管道
   * @param {string} pipelineType - 管道类型
   * @param {string} type - 数据类型
   * @param {*} data - 数据内容
   * @returns {Pipeline}
   */
  static of(pipelineType, type, data) {
    return new Pipeline(pipelineType).add(type, data);
  }
}

module.exports = Pipeline; 