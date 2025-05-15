/**
 * @file BasePipeline.js
 * @description 管道基类，定义数据的增删改查抽象接口
 */

/**
 * 管道基类，所有新管道系统的实现应继承此类
 * @class BasePipeline
 */
class BasePipeline {
  /**
   * 构造函数，传入管道类型
   * @param {string} pipelineType - 管道类型
   */
  constructor(pipelineType) {
    /** 管道类型成员变量 */
    this.pipelineType = pipelineType;
    /** 管道存储数据，子类可自定义存储结构 */
    this._data = [];
  }

  /**
   * 创建数据项，子类实现具体逻辑
   * @abstract
   */
  create(...args) {
    throw new Error('子类未实现 create 方法');
  }

  /**
   * 读取数据项，子类实现具体逻辑
   * @abstract
   */
  read(...args) {
    throw new Error('子类未实现 read 方法');
  }

  /**
   * 更新数据项，子类实现具体逻辑
   * @abstract
   */
  update(...args) {
    throw new Error('子类未实现 update 方法');
  }

  /**
   * 删除数据项，子类实现具体逻辑
   * @abstract
   */
  delete(...args) {
    throw new Error('子类未实现 delete 方法');
  }

  /**
   * 获取当前管道类型
   * @returns {string} 管道类型
   */
  getPipelineType() {
    return this.pipelineType;
  }
}

module.exports = BasePipeline; 