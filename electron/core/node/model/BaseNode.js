// 导入 ConfigService
const configService = require('../../configs/services');

/**
 * @class BaseNode
 * @description 节点基类，封装公共属性和方法
 */
class BaseNode {
  /**
   * @constructor
   */
  constructor() {
    /** @type {Object} 节点类型的静态配置 */
    this._classConfig = configService.getClassConfig(this.constructor.name);
    /** @type {Object|null} 流程级配置，包含节点ID、名称、状态 */
    this._flowConfig = null;
    /** @type {Object|null} 运行时配置，包含模型、系统提示词等 */
    this._workConfig = null;
    this._handlers = null;
    this._initialized = false;
  }

  /**
   * @method init
   * @description 初始化节点实例，分别装载 flowConfig 和 workConfig
   * @param {Object} flowConfig - 流程级配置，包含节点ID、名称、状态
   * @param {Object} workConfig - 运行时配置，包含模型、系统提示词等
   * @returns {Promise<BaseNode>} 初始化完成后返回自身
   */
  async init(flowConfig, workConfig) {
    if (this._initialized) {
      console.warn('节点已经初始化过，重复调用 init() 可能导致状态错误');
      return this;
    }

    // 装载流程级配置：优先使用外部传入，否则使用默认值
    this._flowConfig = flowConfig ?? { ...configService.getDefaultFlowConfig(this.constructor.name) };
    // 装载运行时配置
    this._workConfig = workConfig ?? { ...configService.getDefaultWorkConfig(this.constructor.name) };
    
    // 初始化处理器映射表
    this._handlers = {};
    this.registerHandler('*', this._defaultHandler.bind(this));
    
    // 标记为已初始化
    this._initialized = true;
    
    // 执行子类可选的初始化钩子，传入 classConfig、flowConfig、workConfig
    if (typeof this.onInit === 'function') {
      await this.onInit(this._classConfig, flowConfig, workConfig);
    }
    
    return this;
  }

  /**
   * @method isInitialized
   * @description 检查节点是否已初始化
   * @returns {boolean} 初始化状态
   */
  isInitialized() {
    return this._initialized === true;
  }

  /**
   * @method getFlowConfig
   * @description 获取流程级配置
   * @returns {Object} 当前流程级配置
   */
  getFlowConfig() {
    if (!this.isInitialized()) {
      throw new Error('节点尚未初始化，请先调用 init() 方法');
    }
    return { ...this._flowConfig };
  }

  /**
   * @method updateFlowConfig
   * @description 更新流程级配置，仅更新非空字段
   * @param {Object} config - 部分流程级配置
   */
  updateFlowConfig(config = {}) {
    if (!this.isInitialized()) {
      throw new Error('节点尚未初始化，请先调用 init() 方法');
    }
    for (const key of Object.keys(config)) {
      const val = config[key];
      if (val !== undefined && val !== null && !(typeof val === 'string' && val.trim() === '')) {
        this._flowConfig[key] = val;
      }
    }
  }

  /**
   * @method getWorkConfig
   * @description 获取运行时配置
   * @returns {Object} 当前运行时配置
   */
  getWorkConfig() {
    if (!this.isInitialized()) {
      throw new Error('节点尚未初始化，请先调用 init() 方法');
    }
    return { ...this._workConfig };
  }

  /**
   * @method updateWorkConfig
   * @description 更新运行时配置，仅更新非空字段
   * @param {Object} config - 部分运行时配置
   */
  updateWorkConfig(config = {}) {
    if (!this.isInitialized()) {
      throw new Error('节点尚未初始化，请先调用 init() 方法');
    }
    for (const key of Object.keys(config)) {
      const val = config[key];
      if (val !== undefined && val !== null && !(typeof val === 'string' && val.trim() === '')) {
        this._workConfig[key] = val;
      }
    }
  }

  /**
   * @method getSupportedInputPipelineTypes
   * @description 获取节点支持的输入管道类型
   * @returns {string[]} 支持的输入管道类型列表
   */
  getSupportedInputPipelineTypes() {
    return this._classConfig.supportedInputPipelines || [];
  }

  /**
   * @method getSupportedOutputPipelineTypes
   * @description 获取节点支持的输出管道类型
   * @returns {string[]} 支持的输出管道类型列表
   */
  getSupportedOutputPipelineTypes() {
    return this._classConfig.supportedOutputPipelines || [];
  }

  /**
   * @method supportsInputPipeline
   * @description 检查节点是否支持指定的输入管道类型
   * @param {string} pipelineType - 管道类型
   * @returns {boolean} 是否支持该管道类型
   */
  supportsInputPipeline(pipelineType) {
    const supportedTypes = this.getSupportedInputPipelineTypes();
    // 如果支持类型包含ALL类型，表示支持所有管道类型
    if (supportedTypes.includes('all')) {
      return true;
    }
    return supportedTypes.length === 0 || supportedTypes.includes(pipelineType);
  }

  /**
   * @method toJSON
   * @description 将节点配置序列化为 JSON 对象，包含流程级配置和运行时配置
   * @returns {Object} 节点配置的 JSON 表示
   */
  toJSON() {
    // 序列化流程级配置和运行时配置
    return { ...this._flowConfig, ...this._workConfig };
  }

  /**
   * @method fromJSON
   * @description 根据 flowConfig 和 workConfig 创建并初始化节点实例
   * @param {Object} flowConfig - 流程级配置
   * @param {Object} workConfig - 运行时配置
   * @returns {Promise<BaseNode>} 初始化完成后的节点实例
   */
  static async fromJSON(flowConfig = {}, workConfig = {}) {
    const instance = new this(); // constructor 将从 configService 加载 classConfig
    // init 时传入的 flowConfig 和 workConfig 会覆盖默认值（如果提供的话）
    return await instance.init(flowConfig, workConfig);
  }

  /**
   * @method registerHandler
   * @description 注册管道处理器
   * @param {string} pipelineType - 管道类型
   * @param {Function} handlerFn - 处理函数
   */
  registerHandler(pipelineType, handlerFn) {
    this._handlers[pipelineType] = handlerFn;
  }

  /**
   * @method _defaultHandler
   * @description 默认管道处理函数，未匹配任何类型时调用，默认透传
   * @param {Pipeline} pipeline - 管道实例
   * @returns {Pipeline} 处理后的管道实例
   * @private
   */
  _defaultHandler(pipeline) {
    return pipeline;
  }

  /**
   * @method execute
   * @description 默认执行方法，按注册的处理器分发逻辑
   * @param {Pipeline} pipeline - 输入管道实例
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async execute(pipeline) {
    const type = pipeline.getPipelineType();
    // 优先获取精确匹配处理器，否则取通配符处理器
    const handler = this._handlers[type] || this._handlers['*'];
    return handler ? handler(pipeline) : pipeline;
  }

  /**
   * @method process
   * @description 管道式执行节点
   * @param {Pipeline} input - 输入管道实例
   * @returns {Promise<Pipeline>} 返回包含执行结果的管道实例
   * @throws {Error} 如果输入不是 Pipeline 实例或管道类型不受支持
   */
  async process(input) {
    // 确保节点已初始化
    if (!this.isInitialized()) {
      throw new Error('节点尚未初始化，请先调用 init() 方法');
    }

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

/**
 * @static
 * @type {Object} Status - 节点状态枚举
 * @readonly
 */
BaseNode.Status = configService.Status;

module.exports = BaseNode; 