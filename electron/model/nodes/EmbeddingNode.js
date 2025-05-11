/**
 * @file electron/model/nodes/EmbeddingNode.js
 * @description 向量嵌入节点，使用 LangChain 生成文本嵌入向量
 */

const { OpenAIEmbeddings } = require("@langchain/openai");
const { PipelineType, DataType } = require('../../config/pipeline/index');
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const { Status } = require('../../config/nodes/nodeConfigs');

class EmbeddingNode extends BaseNode {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   */
  async onInit() {
    const workConfig = this.getWorkConfig();
    const embeddingsParams = {
      model: workConfig.model, // 例如: 'text-embedding-3-small'
      batchSize: workConfig.batchSize,
      stripNewLines: workConfig.stripNewLines,
    };
    if (workConfig.dimensions !== null && typeof workConfig.dimensions === 'number' && workConfig.dimensions > 0) {
      embeddingsParams.dimensions = workConfig.dimensions;
    }
    if (workConfig.timeout !== null && typeof workConfig.timeout === 'number' && workConfig.timeout > 0) {
      embeddingsParams.timeout = workConfig.timeout;
    }
    // apiKey 和 organization 通常通过环境变量处理，或者如果需要也可以从 workConfig 传入
    // if (workConfig.apiKey) { embeddingsParams.apiKey = workConfig.apiKey; }

    this.embeddings = new OpenAIEmbeddings(embeddingsParams);

    // 注册支持的管道类型处理器
    this.registerHandler(PipelineType.EMBEDDING, this._handleEmbedding.bind(this));
    // 添加对CHUNK类型管道的支持
    this.registerHandler(PipelineType.CHUNK, this._handleChunk.bind(this));
    // 添加对PROMPT类型管道的支持
    this.registerHandler(PipelineType.PROMPT, this._handlePrompt.bind(this));
  }

  /**
   * @private
   * @method _handleEmbedding
   * @description 执行节点逻辑，生成文本嵌入
   * @param {Pipeline} pipeline - 输入的管道实例
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async _handleEmbedding(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING });
    try {
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法生成嵌入向量');
      }

      // 创建新的输出管道，使用EMBEDDING类型
      const outputPipeline = new Pipeline(PipelineType.EMBEDDING);

      for (const item of textItems) {
        const text = item.data;
        const vector = await this.embeddings.embedQuery(text);
        outputPipeline.add(DataType.EMBEDDING, vector);
      }
      this.updateFlowConfig({ status: Status.COMPLETED });
      return outputPipeline;
    } catch (error) {
      console.error('EmbeddingNode 执行失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message });
      throw error;
    }
  }

  /**
   * @private
   * @method _handleChunk
   * @description 处理CHUNK类型管道，将文本块转换为嵌入向量
   * @param {Pipeline} pipeline - 输入的管道实例（CHUNK类型）
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async _handleChunk(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING });
    try {
      // 获取所有文本块数据
      const chunkItems = pipeline.getByType(DataType.CHUNK);
      if (chunkItems.length === 0) {
        throw new Error('未找到文本块数据，无法生成嵌入向量');
      }

      // 创建新的输出管道，使用EMBEDDING类型
      const outputPipeline = new Pipeline(PipelineType.EMBEDDING);

      // 将每个文本块转换为向量
      for (const item of chunkItems) {
        const chunkText = item.data.text || item.data;
        const metadata = item.data.metadata || {};
        
        // 生成嵌入向量
        const vector = await this.embeddings.embedQuery(chunkText);
        
        // 将向量和原始元数据一起添加到输出管道
        outputPipeline.add(DataType.EMBEDDING, {
          vector,
          text: chunkText,
          metadata
        });
      }
      
      this.updateFlowConfig({ status: Status.COMPLETED });
      return outputPipeline;
    } catch (error) {
      console.error('EmbeddingNode _handleChunk 执行失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message });
      throw error;
    }
  }

  /**
   * @private
   * @method _handlePrompt
   * @description 处理PROMPT类型管道，将提示文本转换为嵌入向量
   * @param {Pipeline} pipeline - 输入的管道实例（PROMPT类型）
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async _handlePrompt(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING });
    try {
      // 获取提示文本数据
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到提示文本数据，无法生成嵌入向量');
      }

      // 创建新的输出管道，使用EMBEDDING类型
      const outputPipeline = new Pipeline(PipelineType.EMBEDDING);

      // 将每个提示文本转换为向量
      for (const item of textItems) {
        const text = item.data;
        const metadata = item.metadata || {};
        
        // 生成嵌入向量
        const vector = await this.embeddings.embedQuery(text);
        
        // 将向量添加到输出管道
        outputPipeline.add(DataType.EMBEDDING, {
          vector,
          text, // 保留原始文本
          metadata
        });
      }
      
      this.updateFlowConfig({ status: Status.COMPLETED });
      return outputPipeline;
    } catch (error) {
      console.error('EmbeddingNode _handlePrompt 执行失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message });
      throw error;
    }
  }

  // _defaultUnsupportedHandler 由 BaseNode 提供
  // getCustomConfig 和 setCustomConfig: modelName 已经通过 workConfig.model 管理
  // 如果 modelOptions 需要单独配置和序列化，则需要实现它们
  // 假设 modelOptions 也是 workConfig 的一部分或不需要单独序列化
}

// static defaultConfig 和 nodeConfig 已移至 electron/config/nodes/

module.exports = EmbeddingNode; 