/**
 * @class SearchNode
 * @description 文本检索节点（基于 HNSW 索引）
 */
const EmbeddingNode = require('./embedding');
const { getHNSWDb, getKnowledgeDb } = require('../../database');
const IOConfigs = require('../configs/IOconfigs');
const PIPconfigs = require('../configs/PIPconfigs');
const BaseNode = require('./baseNode');

class SearchNode extends BaseNode {
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
  }

  /**
   * 执行检索：基于 Pipeline 流处理文本并生成搜索结果
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例
   * @returns {Pipeline} 处理后的 Pipeline 实例
   */
  async execute(pipeline) {
    this.setStatus(SearchNode.Status.RUNNING);
    try {
      // 使用嵌入节点处理文本，生成 EMBEDDING 数据
      pipeline = await this.embeddingNode.process(pipeline);
      // 获取嵌入向量
      const embeddingItems = pipeline.getByType(IOConfigs.DataType.EMBEDDING);
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
          pipeline.add(IOConfigs.DataType.SEARCH_RESULTS, doc);
        }
      }
      this.setStatus(SearchNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(SearchNode.Status.FAILED);
      throw error;
    }
  }

  // TODO: 返回自定义配置，用于序列化
  getCustomConfig() {
    return {
      topK: this.topK,
      knowledgeBaseId: this.knowledgeBaseId,
      ...this.embeddingNode.getCustomConfig()
    };
  }

  // TODO: 设置自定义配置，用于反序列化
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
    PIPconfigs.PipelineType.SEARCH,
    PIPconfigs.PipelineType.RETRIEVAL,
    PIPconfigs.PipelineType.RAG
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.SEARCH,
    PIPconfigs.PipelineType.RETRIEVAL,
    PIPconfigs.PipelineType.RAG
  ],
  version: '1.0.0'
};

module.exports = SearchNode; 