/**
 * @class SearchNode
 * @description 文本检索节点（基于 HNSW 索引）
 */
const EmbeddingNode = require('./embedding');
const { getHNSWDb, getKnowledgeDb } = require('../../database');
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');
const BaseNode = require('./baseNode');

class SearchNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {number} [config.topK] - 检索返回的 top K 结果数量
   * @param {string} [config.knowledgeBaseId] - 知识库 ID，用于过滤结果
   * @param {string} [config.modelName] - 嵌入模型的名称
   * @param {Object} [config.modelOptions] - 嵌入模型的其他参数
   */
  constructor(config = {}) {
    super(config);
    // 检索配置
    this.topK = config.topK || SearchNode.defaultConfig.topK;
    this.knowledgeBaseId = config.knowledgeBaseId || null;
    // 嵌入节点实例
    this.embeddingNode = new EmbeddingNode(config);
    // HNSW 索引服务实例
    this.hnswDb = getHNSWDb();
    this.kbDb = getKnowledgeDb();

    // 注册支持的管道类型处理器
    this.registerHandler(PipelineType.SEARCH, this._handleSearch.bind(this));
    this.registerHandler(PipelineType.RETRIEVAL, this._handleSearch.bind(this));
    this.registerHandler(PipelineType.RAG, this._handleSearch.bind(this));
    // 注册默认的未支持类型处理器
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @private
   * @description 执行检索：基于 Pipeline 流处理文本并生成搜索结果
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例
   * @returns {Promise<Pipeline>} 处理后的 Pipeline 实例
   */
  async _handleSearch(pipeline) {
    this.setStatus(SearchNode.Status.RUNNING);
    try {
      // 使用嵌入节点处理文本，生成 EMBEDDING 数据
      // 注意：这里调用 embeddingNode.process，它内部会使用 registerHandler (如果适配了)
      // 或者直接调用 embeddingNode._handleEmbedding(pipeline) 如果确定类型
      // 为保持 SearchNode 的独立性，且嵌入是其固有步骤，直接调用 process 更合适
      pipeline = await this.embeddingNode.process(pipeline);
      
      // 获取嵌入向量
      const embeddingItems = pipeline.getByType(DataType.EMBEDDING);
      if (embeddingItems.length === 0) {
        throw new Error('未找到嵌入向量，无法执行检索');
      }
      // 对每个向量执行检索并添加结果
      for (const item of embeddingItems) {
        const queryEmbedding = item.data;
        // 确保 HNSW 索引已加载
        if (!this.hnswDb.index) {
          await this.hnswDb.loadIndex({ dimension: queryEmbedding.length });
        }
        const retriever = this.hnswDb.getRetriever();
        let results = await retriever.retrieve(queryEmbedding, this.topK);
        // 如指定知识库，过滤结果
        if (this.knowledgeBaseId) {
          results = results.filter(doc => {
            const row = this.kbDb.db.prepare(
              `SELECT knowledge_base_id FROM ${this.kbDb.documentTable} WHERE id = ?`
            ).get(doc.metadata.documentId);
            return row && row.knowledge_base_id === this.knowledgeBaseId;
          });
        }
        // 添加检索结果
        for (const doc of results) {
          pipeline.add(DataType.SEARCH_RESULTS, doc);
        }
      }
      this.setStatus(SearchNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(SearchNode.Status.FAILED);
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
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      topK: this.topK,
      knowledgeBaseId: this.knowledgeBaseId,
      ...this.embeddingNode.getCustomConfig()
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.topK != null) this.topK = config.topK;
    if (config.knowledgeBaseId) this.knowledgeBaseId = config.knowledgeBaseId;
    this.embeddingNode.setCustomConfig(config);
  }
}

// 默认配置
SearchNode.defaultConfig = {
  topK: 5
};

// 节点元数据
SearchNode.nodeConfig = {
  type: 'model',
  tag: 'retrieve',
  name: 'text-to-retrieve-hnsw',
  description: '将文本向量化并使用 HNSW 索引检索相关文档',
  // 支持的输入管道类型
  supportedInputPipelines: [
    PipelineType.SEARCH,
    PipelineType.RETRIEVAL,
    PipelineType.RAG
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PipelineType.SEARCH,
    PipelineType.RETRIEVAL,
    PipelineType.RAG
  ],
  version: '1.0.0'
};

module.exports = SearchNode; 