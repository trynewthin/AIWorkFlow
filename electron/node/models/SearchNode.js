/**
 * @file electron/core/node/models/SearchNode.js
 * @description 搜索节点，使用 HNSW 索引进行文本检索
 */
const { getHNSWDb } = require('../../database'); // KnowledgeDb 不再由此节点直接查询文档内容
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const BaseNode = require('./BaseNode');
const Pipeline = require('../../core/pipeline').Pipeline;
const { Status } = require('../../coreconfigs');
const { Document } = require('@langchain/core/documents');
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const { OpenAIEmbeddings } = require('@langchain/openai');

class SearchNode extends BaseNode {
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
    this.hnswDb = getHNSWDb();
    
    // 确保 HNSWDb 索引已加载或可加载
    // loadIndex 现在依赖 HNSWDb 内部管理维度，或从持久化配置读取
    // 也可以选择在 onInit 时就尝试加载，如果 hnswDimension 在 workConfig 中
    if (workConfig.hnswDimension && (!this.hnswDb.index || !this.hnswDb.index.isIndexInitialized())) { // 假设 isIndexInitialized 存在
        try {
            await this.hnswDb.loadIndex({ dimension: workConfig.hnswDimension });
        } catch (err) {
            console.warn(`SearchNode onInit: HNSW index auto-loading failed. May need to be built or loaded manually. Error: ${err.message}`);
            // 即使加载失败，也允许节点初始化，检索时会再次检查
        }
    }

    this.registerHandler(PipelineType.CHAT, this._handleSearch.bind(this));
    this.registerHandler(PipelineType.USER_MESSAGE, this._handleSearch.bind(this));
  }

  /**
   * @private
   * @method _handleSearch
   * @description 执行检索：基于 Pipeline 流处理输入文本，生成搜索结果
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例, 期望包含 DataType.TEXT
   * @returns {Promise<Pipeline>} 处理后的 Pipeline 实例
   */
  async _handleSearch(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING }); // 设置为运行状态
    try {
      /**
       * 将输入文本转换为查询向量
       * @description 仅支持 DataType.TEXT 类型的数据
       */
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法生成向量并执行检索');
      }
      // 初始化嵌入器
      const embedder = new OpenAIEmbeddings();
      const queryEmbeddings = await Promise.all(
        textItems.map(entry => embedder.embedQuery(entry.data))
      );

      const workConfig = this.getWorkConfig();
      const outputPipeline = new Pipeline(PipelineType.RETRIEVAL);

      // 确保索引已加载
      if (!this.hnswDb.index || (typeof this.hnswDb.index.isIndexInitialized === 'function' && !this.hnswDb.index.isIndexInitialized())) {
        // 如果 HNSWDb 有一个配置好的维度，它可以自己加载
        // 否则，依赖 workConfig 中的 hnswDimension
        const dimToLoad = workConfig.hnswDimension || (this.hnswDb.index ? this.hnswDb.index.getDim() : null); // getDim() 是假设的方法
        if (!dimToLoad) {
            throw new Error('HNSW 索引维度未知，无法加载索引。');
        }
        try {
            await this.hnswDb.loadIndex({ dimension: dimToLoad });
        } catch (err) {
            throw new Error(`HNSW 索引加载失败: ${err.message}`);
        }
      }
      if (!this.hnswDb.index || typeof this.hnswDb.index.searchKnn !== 'function') {
        throw new Error('HNSW 索引无效或未正确加载。');
      }

      const retriever = this.hnswDb.getRetriever(); // HNSWDb.getRetriever() 返回包含 retrieve 方法的对象

      for (const queryEmbedding of queryEmbeddings) {
        // retrieve 方法现在应该返回包含 pageContent 和 metadata (含 knowledgeBaseId) 的文档
        let documents = await retriever.retrieve(queryEmbedding, workConfig.topK);

        if (workConfig.knowledgeBaseId) {
          documents = documents.filter(doc => doc.metadata && doc.metadata.knowledgeBaseId === workConfig.knowledgeBaseId);
        }

        for (const doc of documents) {
          outputPipeline.add(DataType.RETRIEVAL, doc);
        }
      }
      this.updateFlowConfig({ status: Status.COMPLETED }); // 设置为完成状态
      return outputPipeline;
    } catch (error) {
      console.error('SearchNode 执行失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message }); // 设置为失败状态
      throw error;
    }
  }
}

module.exports = SearchNode; 