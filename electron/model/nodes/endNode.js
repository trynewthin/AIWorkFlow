/**
 * @class EndNode
 * @description 将 Pipeline 数据转换为指定原始类型的结束节点
 */
const BaseNode = require('./baseNode');
const DataType = require('../pipeline/Datatype');

class EndNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // TODO: 设置要提取的数据类型
    this.dataType = config.dataType || DataType.TEXT;
  }

  /**
   * 执行结束节点，从 Pipeline 提取指定类型的数据并返回原始数组
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例
   * @returns {Array<*>} 提取的数据数组
   */
  async process(pipeline) {
    // TODO: 设置状态为运行中
    this.setStatus(EndNode.Status.RUNNING);
    // 提取指定类型数据
    const items = pipeline.getByType(this.dataType);
    // 设置状态为完成
    this.setStatus(EndNode.Status.COMPLETED);
    // 返回原始数据数组
    return items.map(item => item.data);
  }

  /**
   * 返回自定义配置，用于序列化
   */
  getCustomConfig() {
    return {
      dataType: this.dataType
    };
  }

  /**
   * 设置自定义配置，用于反序列化
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
  // 不限制输入类型
  supportedInputPipelines: [],
  // 不限制输出类型
  supportedOutputPipelines: [],
  version: '1.0.0'
};

module.exports = EndNode; 