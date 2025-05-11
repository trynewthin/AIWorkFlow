/**
 * @class StartNode
 * @description 将原始输入转换为 Pipeline 实例的开始节点
 */
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');

class StartNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {string} [config.pipelineType] - 生成的管道类型
   * @param {string} [config.dataType] - 初始数据的数据类型
   */
  constructor(config = {}) {
    super(config);
    // 设置管道类型和数据类型
    this.pipelineType = config.pipelineType || PipelineType.CUSTOM;
    this.dataType = config.dataType || DataType.DATA;

    // 注册默认的未支持类型处理器（主要用于 execute 调用路径，如果发生）
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @description 执行开始节点，将原始输入封装为 Pipeline
   * @param {*} input - 原始数据
   * @returns {Promise<Pipeline>} 包含初始数据的 Pipeline 实例
   */
  async process(input) {
    // 创建并返回 Pipeline 实例
    const pipeline = Pipeline.of(this.pipelineType, this.dataType, input);
    return pipeline;
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
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持通过 execute 处理 ${pipelineType} 类型的管道。请使用 process(input) 创建新管道。`);
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      pipelineType: this.pipelineType,
      dataType: this.dataType
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.pipelineType) this.pipelineType = config.pipelineType;
    if (config.dataType) this.dataType = config.dataType;
  }
}

// 节点元数据
StartNode.nodeConfig = {
  type: 'utility',
  tag: 'start',
  name: 'pipeline-start-node',
  description: '将原始输入封装为 Pipeline',
  // 输出为 START 类型
  supportedOutputPipelines: [PipelineType.START],
  version: '1.0.0'
};

module.exports = StartNode; 