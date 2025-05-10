/**
 * @class SearchNode
 * @description 文本检索节点（基于 HNSW 索引）
 */
const EmbeddingNode = require('./embedding');
const { getHNSWDb, getKnowledgeDb } = require('../../database');
const IOConfigs = require('../configs/IOconfigs');
const BaseNode = require('./baseNode');

class SearchNode extends BaseNode {
  constructor(externalConfig = {}) {
    super(externalConfig);
    // 检索配置
    this.topK = externalConfig.topK || SearchNode.defaultConfig.topK;
    this.knowledgeBaseId = externalConfig.knowledgeBaseId || null;
    // 嵌入节点实例
    this.embeddingNode = new EmbeddingNode(externalConfig);
    // HNSW 索引服务实例
    this.hnswDb = getHNSWDb();
    this.kbDb = getKnowledgeDb();
  }

  /**
   * 执行检索：文本向量化并使用 HNSW 检索相关文档
   * @param {string} text - 待检索的文本
   * @returns {Array<{pageContent:string, metadata:object, score:number}>} 检索结果数组
   */
  async execute(text) {
    this.setStatus(SearchNode.Status.RUNNING);
    try {
      // 文本嵌入
      const queryEmbedding = await this.embeddingNode.execute(text);
      // 确保 HNSW 索引已加载
      if (!this.hnswDb.index) {
        await this.hnswDb.loadIndex({ dimension: queryEmbedding.length });
      }
      // 获取检索器并执行检索
      const retriever = this.hnswDb.getRetriever();
      let results = await retriever.retrieve(queryEmbedding, this.topK);
      // 如指定知识库，过滤结果
      if (this.knowledgeBaseId) {
        results = results.filter(item => {
          const row = this.kbDb.db.prepare(
            `SELECT knowledge_base_id FROM ${this.kbDb.documentTable} WHERE id = ?`
          ).get(item.metadata.documentId);
          return row && row.knowledge_base_id === this.knowledgeBaseId;
        });
      }
      this.setStatus(SearchNode.Status.COMPLETED);
      return results;
    } catch (error) {
      this.setStatus(SearchNode.Status.FAILED);
      throw error;
    }
  }

  // 输入/输出类型及状态相关方法已提取至基类 BaseNode
}

// 默认配置
SearchNode.defaultConfig = {
  topK: 5
};

// 节点元数据
SearchNode.nodeConfig = {
  type: 'model',
  tag: 'retrieve',
  name: 'text-to-retrieve-lc',
  description: '将文本向量化并使用 HNSW 索引检索相关文档',
  input: IOConfigs.DataType.TEXT,
  output: IOConfigs.DataType.SEARCH_RESULTS,
  version: '1.0.0'
};

module.exports = SearchNode; 