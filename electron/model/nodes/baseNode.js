/**
 * @class BaseNode
 * @description 节点基类，封装公共属性和方法
 */
class BaseNode {
  constructor(config = {}) {
    // 节点公共信息
    this.nodeInfo = {
      nodeId: config.nodeId || '',
      nodeName: config.nodeName || this.constructor.nodeConfig.name,
      status: config.status || this.constructor.Status.IDLE
    };
    // 初始化管道处理器映射表
    this._handlers = {};
    // 注册通配符处理器，子类可覆盖该默认处理行为
    this.registerHandler('*', this._defaultHandler.bind(this));
  }

  // 设置节点状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // 获取节点状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // 获取节点输入类型
  getSupportedInputPipelineTypes() {
    return this.constructor.nodeConfig.supportedInputPipelines || [];
  }

  // 获取节点输出类型
  getSupportedOutputPipelineTypes() {
    return this.constructor.nodeConfig.supportedOutputPipelines || [];
  }

  // 检查节点是否支持指定的管道类型
  supportsInputPipeline(pipelineType) {
    const supportedTypes = this.getSupportedInputPipelineTypes();
    return supportedTypes.length === 0 || supportedTypes.includes(pipelineType);
  }

  // 将节点配置序列化为 JSON 对象，包含公共属性和子类自定义配置
  toJSON() {
    const baseConfig = { ...this.nodeInfo };
    let customConfig = {};
    if (typeof this.getCustomConfig === 'function') {
      customConfig = this.getCustomConfig();
    }
    return { ...baseConfig, ...customConfig };
  }

  // 根据配置对象创建节点实例，构造函数中已处理所有字段
  static fromJSON(config) {
    return new this(config);
  }

  // 注册管道处理器
  registerHandler(pipelineType, handlerFn) {
    this._handlers[pipelineType] = handlerFn;
  }

  /**
   * @description 默认管道处理函数，未匹配任何类型时调用，默认透传
   * @param {Pipeline} pipeline - 管道实例
   * @returns {Pipeline}
   */
  _defaultHandler(pipeline) {
    return pipeline;
  }

  // 默认 execute 实现，按注册的处理器分发逻辑
  async execute(pipeline) {
    const type = pipeline.getPipelineType();
    // 优先获取精确匹配处理器，否则取通配符处理器
    const handler = this._handlers[type] || this._handlers['*'];
    return handler ? handler(pipeline) : pipeline;
  }

  // 添加管道式执行方法，支持Pipeline数据流
  /**
   * 管道式执行节点
   * @param {Pipeline|string|any} input - 输入数据或Pipeline实例
   * @returns {Promise<Pipeline>} 返回包含执行结果的Pipeline实例
   */
  async process(input) {
    // 校验输入类型，必须为 Pipeline 实例
    if (!input || typeof input.getPipelineType !== 'function') {
      throw new Error('process 方法要求传入 Pipeline 实例');
    }
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

// 默认静态配置，子类可覆盖
BaseNode.nodeConfig = {
  // 节点默认名称，可由子类覆盖
  name: '',
  // 支持的输入管道类型，空数组表示支持所有类型
  supportedInputPipelines: [],
  // 支持的输出管道类型，空数组表示支持所有类型
  supportedOutputPipelines: []
};

// 节点状态枚举
BaseNode.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

module.exports = BaseNode; 