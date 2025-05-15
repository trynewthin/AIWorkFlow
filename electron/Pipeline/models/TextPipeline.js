/**
 * @file TextPipeline.js
 * @description 单条文本管道，实现对包含 text 字段对象数组的增删改查操作
 */

const BasePipeline = require('./BasePipeline');

/**
 * 单条文本管道实现类
 * @class TextPipeline
 */
class TextPipeline extends BasePipeline {
  /**
   * 构造函数，传入管道类型
   * @param {string} pipelineType - 管道类型
   */
  constructor(pipelineType) {
    super(pipelineType);
  }

  /**
   * 添加数据项，仅接受原始文本内容
   * @param {string|number} text - 文本内容，非字符串类型会被强制转换
   * @returns {TextPipeline} 返回当前实例，支持链式调用
   * @throws {Error} 文本内容为空时抛出
   */
  create(text) {
    if (text == null) {
      throw new Error('无效的数据项，必须提供文本内容');
    }
    // 强制将内容转换为字符串
    const entry = { text: String(text) };
    this._data.push(entry);
    return this;
  }

  /**
   * 读取数据项
   * @returns {{ text: string, xx: any }[]} 符合条件的数据数组
   */
  read() {
    return this._data[0].text;
  }

  /**
   * 更新数据项
   * @param {Function} updater - 更新函数，接收旧项并返回新项
   * @returns {{ text: string, xx: any }[]} 更新后的数据项数组
   * @throws {Error} predicate 或 updater 非函数时抛出
   */
  update(text) {
    this._data[0].text = text;
    return this._data;
  }

  /**
   * 删除数据项
   */
  delete() {
    this._data = [];
  }
}

module.exports = TextPipeline; 