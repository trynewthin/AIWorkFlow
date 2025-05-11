/**
 * @class EmbeddingNode
 * @description Embedding 节点（基于 LangChain JS）
 */

// 导入 OpenAIEmbeddings 类
const { OpenAIEmbeddings } = require("@langchain/openai");
const { PipelineType } = require('../pipeline/Piptype');
const DataType = require('../pipeline/Datatype');
const BaseNode = require('./baseNode');

// Embedding 节点类
class EmbeddingNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {string} [config.modelName] - 模型名称
   * @param {Object} [config.modelOptions] - 模型其他参数
   */
  constructor(config = {}) {
    super(config);

    // 模型配置
    this.modelName = config.modelName || EmbeddingNode.defaultConfig.modelName;
    this.modelOptions = config.modelOptions || {};

    // 注册支持的管道类型处理器
    this.registerHandler(PipelineType.TEXT_PROCESSING, this._handleEmbedding.bind(this));
    this.registerHandler(PipelineType.VECTOR_PROCESSING, this._handleEmbedding.bind(this));
    this.registerHandler(PipelineType.CHAT, this._handleEmbedding.bind(this));
    // 注册默认的未支持类型处理器
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @private
   * @description 执行节点逻辑，生成文本嵌入
   * @param {Pipeline} pipeline - 输入的管道实例
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async _handleEmbedding(pipeline) {
    this.setStatus(EmbeddingNode.Status.RUNNING);
    // 创建 embeddings 实例
    const embeddings = new OpenAIEmbeddings({ modelName: this.modelName, ...this.modelOptions });
    try {
      // 从管道中获取文本数据
      const textItems = pipeline.getByType(DataType.TEXT);
      
      // 如果没有文本数据，抛出错误
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法生成嵌入向量');
      }
      
      // 处理每一条文本数据
      for (const item of textItems) {
        const text = item.data;
        
        // 生成文本嵌入
        const vector = await embeddings.embedQuery(text);
        
        // 将结果添加到管道
        pipeline.add(DataType.EMBEDDING, vector);
      }
      
      this.setStatus(EmbeddingNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(EmbeddingNode.Status.FAILED);
      throw error;
    }
  }

  /**
   * @private
   * @description 处理不支持的管道类型，默认抛出错误。
   * @param {Pipeline} pipeline - 输入的管道实例。
   * @throws {Error} 当接收到不支持的管道类型时抛出。
   * @returns {Promise<Pipeline>}
   */
  async _defaultUnsupportedHandler(pipeline) {
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持处理 ${pipelineType} 类型的管道。`);
  }

  /**
   * @description 设置模型名称
   * @param {string} name - 模型名称
   */
  setModelName(name) {
    this.modelName = name;
  }

  /**
   * @description 获取模型名称
   * @returns {string} 模型名称
   */
  getModelName() {
    return this.modelName;
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      modelName: this.modelName,
      modelOptions: this.modelOptions
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.modelName) this.setModelName(config.modelName);
    if (config.modelOptions) this.modelOptions = config.modelOptions;
  }

  // 输入/输出类型及状态相关方法已提取至基类 BaseNode
}

// 默认配置
EmbeddingNode.defaultConfig = {
  modelName: 'text-embedding-v3'
};

// 节点元数据
EmbeddingNode.nodeConfig = {
  type: 'model',
  tag: 'embedding',
  name: 'text-to-embedding-lc',
  description: '使用LangChain JS生成文本嵌入向量',
  supportedInputPipelines: [
    PipelineType.TEXT_PROCESSING,
    PipelineType.VECTOR_PROCESSING,
    PipelineType.CHAT,
  ],
  supportedOutputPipelines: [
    PipelineType.VECTOR_PROCESSING,
    PipelineType.TEXT_PROCESSING,
  ],
  version: '1.0.0'
};

// 导出节点类
module.exports = EmbeddingNode; 