/**
 * @file electron/core/node/models/SearchNode.js
 * @description 搜索节点，使用 HNSW 索引进行文本检索
 */
const { getHNSWDb } = require('../../database'); // KnowledgeDb 不再由此节点直接查询文档内容
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline').Pipeline;
const { Status } = require('../../coreconfigs');
const { Document } = require('@langchain/core/documents');
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { TextPipeTools } = require('../../pipeline/tools');

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
    
    // 注册处理函数
    this.registerHandler(PipelineType.TEXT, this._handleSearch.bind(this));
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
      // 获取工作配置，在方法开头就定义，避免后面多次获取
      const workConfig = this.getWorkConfig();
      
      /**
       * 将输入文本转换为查询向量
       * @description 仅支持 DataType.TEXT 类型的数据
       */
      // 从文本管道中读取单个字符串，并确保是字符串类型
      const textStr = TextPipeTools.read(pipeline);
      if (!textStr) {
        throw new Error('未找到文本数据，无法生成向量并执行检索');
      }
      const textStrSafe = String(textStr);
      console.log('SearchNode 处理查询文本:', textStrSafe);
      
      // 创建输出管道
      const outputPipeline = new Pipeline(PipelineType.RETRIEVAL);

      // 初始化或验证索引
      if (!this.hnswDb.index) {
        console.log('SearchNode: 索引未加载，开始加载索引');
        try {
          await this.hnswDb.loadIndex({ 
            dimension: workConfig.hnswDimension || 1024 
          });
          console.log('SearchNode: 索引加载成功');
        } catch (err) {
          console.error('SearchNode: 索引加载失败', err);
          
          // 如果索引文件不存在，需要先构建索引
          if (err.message && err.message.includes('索引文件不存在')) {
            throw new Error('索引文件不存在，请先构建索引后再使用检索功能。可以使用管理界面创建索引或导入知识库。');
          }
          
          throw new Error(`无法加载索引: ${err.message}`);
        }
      }
      
      // 获取索引当前的维度
      const indexDimension = this.hnswDb.getDimension();
      console.log(`SearchNode: 当前索引维度为 ${indexDimension}`);
      
      // 使用与索引匹配的维度创建嵌入
      const embedder = new OpenAIEmbeddings({ 
        modelName: 'text-embedding-v3',
        dimensions: indexDimension
      });
      
      // 生成查询的嵌入向量
      const queryEmbedding = await embedder.embedQuery(textStrSafe);
      
      // 检查生成的向量维度是否与索引匹配
      if (queryEmbedding.length !== indexDimension) {
        console.error(`SearchNode: 维度不匹配，索引期望 ${indexDimension} 维度，但生成了 ${queryEmbedding.length} 维度的向量`);
        throw new Error(`嵌入向量维度与索引维度不匹配`);
      }
      
      // 执行检索
      try {
        const retriever = this.hnswDb.getRetriever();
        const documents = await retriever.retrieve(queryEmbedding, workConfig.topK || 5);
        console.log(`SearchNode: 检索到 ${documents.length} 个文档`);
        
        // 添加检索结果到输出管道
        for (const doc of documents) {
          if (workConfig.knowledgeBaseId && 
              (!doc.metadata || doc.metadata.knowledgeBaseId !== workConfig.knowledgeBaseId)) {
            continue; // 跳过不匹配知识库ID的文档
          }
          outputPipeline.add(DataType.RETRIEVAL, doc);
        }
        
        if (outputPipeline.getAll().length === 0) {
          console.warn('SearchNode: 所有检索结果被过滤，未生成输出');
        }
      } catch (err) {
        console.error('SearchNode: 检索过程失败:', err);
        throw new Error(`检索失败: ${err.message}`);
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