/**
 * @file electron/model/nodes/startNode.js
 * @class StartNode
 * @description 开始节点：根据输入类型创建初始管道
 */
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../config/pipeline');

class StartNode extends BaseNode {
  /**
   * @constructor
   * @description 构造开始节点实例，并注册默认执行处理器
   * @param {Object} config - 配置对象（保留以兼容 BaseNode）
   */
  constructor(config = {}) {
    super(config);
    // 注册通配符处理器：不支持通过 execute 调用
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @method process
   * @description 创建并返回包含初始输入数据的管道实例
   * @param {*} input - 原始输入数据
   * @returns {Promise<Pipeline>} 包含初始数据的管道实例
   */
  async process(input) {
    let pipelineType;
    let dataType;
    // 根据输入类型选择管道类型和数据类型
    if (typeof input === 'string') {
      pipelineType = PipelineType.PROMPT;
      dataType = DataType.TEXT;
    } else {
      throw new Error('StartNode 不支持的输入类型: ' + typeof input);
    }
    // 创建并返回新的管道
    return Pipeline.of(pipelineType, dataType, input);
  }

  /**
   * @method _defaultUnsupportedHandler
   * @description 默认处理器，当通过 execute 调用时抛出错误，提醒使用 process
   * @param {Pipeline} pipeline - 输入的管道实例
   * @throws {Error}
   */
  async _defaultUnsupportedHandler(pipeline) {
    // 使用 this._classConfig 获取节点信息
    const nodeName = this._classConfig.name || '未知节点'; 
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${nodeName} (类型: ${this._classConfig.tag || '未知'}) 不支持通过 execute 处理 ${pipelineType} 类型的管道。请使用 process(input) 方法创建新管道。`);
  }
}

module.exports = StartNode;
