/**
 * @class StartNode
 * @description 将原始输入转换为 Pipeline 实例的开始节点
 */
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');

class StartNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // TODO: 设置管道类型和数据类型
    this.pipelineType = config.pipelineType || PipelineType.CUSTOM;
    this.dataType = config.dataType || DataType.DATA;
  }

  /**
   * 执行开始节点，将原始输入封装为 Pipeline
   * @param {*} input - 原始数据
   * @returns {Pipeline} 包含初始数据的 Pipeline 实例
   */
  async process(input) {
    // TODO: 创建并返回 Pipeline 实例
    const pipeline = Pipeline.of(this.pipelineType, this.dataType, input);
    return pipeline;
  }

  /**
   * 返回自定义配置，用于序列化
   */
  getCustomConfig() {
    return {
      pipelineType: this.pipelineType,
      dataType: this.dataType
    };
  }

  /**
   * 设置自定义配置，用于反序列化
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
  // 不限制输入类型
  supportedInputPipelines: [],
  // 不限制输出类型
  supportedOutputPipelines: [],
  version: '1.0.0'
};

module.exports = StartNode; 