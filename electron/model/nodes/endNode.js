/**
 * @class EndNode
 * @description 将 Pipeline 数据转换为指定原始类型的结束节点
 */
const BaseNode = require('./baseNode');
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');

class EndNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {string} [config.dataType] - 要从管道中提取的数据类型
   */
  constructor(config = {}) {
    super(config);
    // 设置要提取的数据类型
    this.dataType = config.dataType || DataType.TEXT;

    // 注册默认的未支持类型处理器（主要用于 execute 调用路径，如果发生）
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @description 执行结束节点，从 Pipeline 提取指定类型的数据并返回原始数组
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例
   * @returns {Promise<Array<*>>} 提取的数据数组
   */
  async process(pipeline) {
    this.setStatus(EndNode.Status.RUNNING);
    // 提取指定类型数据
    const items = pipeline.getByType(this.dataType);
    this.setStatus(EndNode.Status.COMPLETED);
    // 返回原始数据数组
    return items.map(item => item.data);
  }

  /**
   * @private
   * @description 处理不支持的管道类型，默认抛出错误 (主要用于 execute 调用路径)。
   * @param {Pipeline} pipeline - 输入的管道实例。
   * @throws {Error} 当接收到不支持的管道类型时抛出。
   * @returns {Promise<Pipeline>}
   */
  async _defaultUnsupportedHandler(pipeline) {
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持通过 execute 处理 ${pipelineType} 类型的管道。请使用 process(pipeline) 处理。`);
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      dataType: this.dataType
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.dataType) this.dataType = config.dataType;
  }
}

// 节点元数据
EndNode.nodeConfig = {
  type: 'utility',
  tag: 'end',
  name: 'pipeline-end-node',
  description: '将 Pipeline 数据转换为原始数据',
  // 输入需为 END 类型
  supportedInputPipelines: [PipelineType.END],
  // 不输出 Pipeline 实例
  supportedOutputPipelines: [],
  version: '1.0.0'
};

module.exports = EndNode; 