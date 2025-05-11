/**
 * @class BaseNode
 * @description 节点基类，封装公共属性和方法
 */
class BaseNode {
  constructor(config = {}) {
    // TODO: 节点公共信息
    this.nodeInfo = {
      nodeId: config.nodeId || '',
      nodeName: config.nodeName || this.constructor.nodeConfig.name,
      status: config.status || this.constructor.Status.IDLE
    };
  }

  // TODO: 设置节点状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // TODO: 获取节点状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // TODO: 获取节点输入类型
  getSupportedInputPipelineTypes() {
    return this.constructor.nodeConfig.supportedInputPipelines || [];
  }

  // TODO: 获取节点输出类型
  getSupportedOutputPipelineTypes() {
    return this.constructor.nodeConfig.supportedOutputPipelines || [];
  }

  // 检查节点是否支持指定的管道类型
  supportsInputPipeline(pipelineType) {
    const supportedTypes = this.getSupportedInputPipelineTypes();
    return supportedTypes.length === 0 || supportedTypes.includes(pipelineType);
  }

  // TODO: 将节点配置序列化为 JSON 对象，包含公共属性和子类自定义配置
  toJSON() {
    const baseConfig = { ...this.nodeInfo };
    let customConfig = {};
    if (typeof this.getCustomConfig === 'function') {
      customConfig = this.getCustomConfig();
    }
    return { ...baseConfig, ...customConfig };
  }

  // TODO: 根据配置对象创建节点实例，构造函数中已处理所有字段
  static fromJSON(config) {
    return new this(config);
  }

  // TODO: 添加管道式执行方法，支持Pipeline数据流
  /**
   * 管道式执行节点
   * @param {Pipeline|string|any} input - 输入数据或Pipeline实例
   * @returns {Promise<Pipeline>} 返回包含执行结果的Pipeline实例
   */
  async process(input) {
    const { randomUUID } = require('crypto');
    const pipeline = input;

    // 检查管道类型是否符合节点的输入要求
    const pipelineType = pipeline.getPipelineType();
    if (!this.supportsInputPipeline(pipelineType)) {
      throw new Error(`节点不支持处理 ${pipelineType} 类型的管道，支持的类型: ${this.getSupportedInputPipelineTypes().join(', ')}`);
    }

    // 直接将整个管道传递给execute方法处理
    const outputPipeline = await this.execute(pipeline);
    
    // 检查管道类型是否被节点的execute函数修改为支持的输出类型
    const outputPipelineType = outputPipeline.getPipelineType();
    const supportedOutputTypes = this.getSupportedOutputPipelineTypes();
    
    if (supportedOutputTypes.length > 0 && !supportedOutputTypes.includes(outputPipelineType)) {
      throw new Error(`节点输出的管道类型 ${outputPipelineType} 不在支持的输出类型列表中: ${supportedOutputTypes.join(', ')}`);
    }
    
    return outputPipeline;
  }
}

// TODO: 节点状态枚举
BaseNode.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

module.exports = BaseNode; 