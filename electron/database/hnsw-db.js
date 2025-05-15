/**
 * HNSW 索引管理服务
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { getDataDir } = require('ee-core/ps');
const { ModuleDbBase } = require('./module-db-base');
const hnswlib = require('hnswlib-node');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { createRequire } = require('module');

// 修改导入方式，避免循环依赖
let knowledgeDbModule;
const getKnowledgeDb = () => {
  if (!knowledgeDbModule) {
    try {
      const require = createRequire(module.filename);
      knowledgeDbModule = require('./knowledge-db').getKnowledgeDb();
      return knowledgeDbModule;
    } catch (err) {
      console.error('获取 KnowledgeDb 失败:', err);
      throw new Error(`无法获取知识库模块: ${err.message}`);
    }
  }
  return knowledgeDbModule;
};

class HNSWDb extends ModuleDbBase {
  constructor(options = {}) {
    super({ dbname: options.dbname || 'hnsw-index.db', moduleId: options.moduleId || 'hnsw-index-module' });
    // 索引文件存储目录
    this.indexDir = path.resolve(getDataDir(), options.indexDir || 'hnsw_index');
    if (!fs.existsSync(this.indexDir)) {
      fs.mkdirSync(this.indexDir, { recursive: true });
    }
    this.index = null;
    this.documents = [];
    // 默认向量维度 - 使用1024维度，与text-embedding-3-small默认维度匹配
    this.dimension = options.dimension || 1024;
    this._initTable();
  }

  _initTable() {
    // HNSW 索引无需 SQLite 表结构
  }

  /**
   * 构建并持久化 HNSW 索引
   * @param {Document[]} documents 文档数组，格式 { pageContent, metadata }
   * @param {Object} config 配置项，包括 modelName, space (向量维度)
   */
  async buildIndex(documents, config = {}) {
    if (!documents || documents.length === 0) {
      throw new Error('构建索引需要提供有效的文档');
    }
    
    // 使用 OpenAIEmbeddings 生成向量
    const embedder = new OpenAIEmbeddings({ 
      modelName: config.modelName || 'text-embedding-3-small',
      dimensions: config.space || this.dimension // 确保维度一致
    });
    
    console.log(`构建索引, 嵌入维度: ${config.space || this.dimension}, 模型: ${config.modelName || 'text-embedding-3-small'}`);
    
    const vectors = await Promise.all(
      documents.map(doc => embedder.embedQuery(doc.pageContent))
    );
    
    // 确认向量维度
    const dim = vectors[0].length;
    console.log(`实际生成向量维度: ${dim}`);
    
    // 使用正确的 HierarchicalNSW 初始化方式
    try {
      // 使用余弦相似度空间
      this.index = new hnswlib.HierarchicalNSW('cosine', dim);
      // 初始化索引，指定最大元素数（文档数）
      this.index.initIndex(vectors.length);
      
      // 添加向量到索引
      for (let i = 0; i < vectors.length; i++) {
        this.index.addPoint(vectors[i], i);
      }
      
      // 持久化索引文件
      const indexPath = path.join(this.indexDir, 'hnsw_index.bin');
      this.index.writeIndex(indexPath);
      
      // 保存文档映射
      this.documents = documents;
      // 更新实例维度
      this.dimension = dim;
      
      return this.index;
    } catch (err) {
      console.error('HNSW 索引构建失败:', err);
      throw err;
    }
  }

  /**
   * 加载已存在的 HNSW 索引
   * @param {Object} config 配置项，包括 dimension
   */
  async loadIndex(config = {}) {
    const dim = config.dimension || config.space || this.dimension;
    if (!dim) {
      throw new Error('加载 HNSW 索引时需要提供 dimension 或 space');
    }
    
    // 更新实例维度
    this.dimension = dim;
    
    // 检查索引文件是否存在
    const indexPath = path.join(this.indexDir, 'hnsw_index.bin');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`索引文件不存在: ${indexPath}`);
    }
    
    try {
      // 创建新的 HNSW 索引实例
      this.index = new hnswlib.HierarchicalNSW('cosine', dim);
      
      // 读取索引文件
      this.index.readIndex(indexPath);
      
      // 从知识库获取文档用于映射
      const kbDb = getKnowledgeDb();
      if (!kbDb) {
        throw new Error('无法获取知识库模块');
      }
      
      const result = await kbDb.getAllChunksWithEmbeddings();
      if (!result || !result.documents) {
        throw new Error('知识库未返回有效文档');
      }
      
      this.documents = result.documents;
      console.log(`加载了 ${this.documents.length} 个知识库文档`);
      
      return this.index;
    } catch (err) {
      console.error('初始化 HNSW 索引失败:', err);
      throw err;
    }
  }

  /**
   * 检查索引是否已初始化
   * @returns {boolean}
   */
  isIndexInitialized() {
    return this.index && typeof this.index.getCurrentCount === 'function' && this.index.getCurrentCount() > 0;
  }
  
  /**
   * 获取当前索引的维度
   * @returns {number}
   */
  getDimension() {
    return this.dimension;
  }

  /**
   * 获取检索器，用于查询相似文档
   */
  getRetriever() {
    if (!this.index) {
      throw new Error('HNSW 索引未加载，请先调用 loadIndex 或 buildIndex');
    }
    
    // 保存对 this.index 和 this.documents 的引用，避免在retrieve方法中的this指向问题
    const index = this.index;
    const documents = this.documents;
    const dimension = this.dimension;
    
    return {
      async retrieve(queryEmbedding, k = 5) {
        if (!index) {
          throw new Error('HNSW 索引未定义或已失效');
        }
        
        // 检查向量维度
        if (queryEmbedding.length !== dimension) {
          throw new Error(`向量维度不匹配：索引期望 ${dimension} 维度，但查询向量是 ${queryEmbedding.length} 维度`);
        }
        
        if (documents.length === 0) {
          throw new Error('文档集为空，无法执行检索');
        }
        
        // 调用正确的 searchKnn 方法
        const result = index.searchKnn(queryEmbedding, Math.min(k, documents.length));
        
        // searchKnn 返回 { neighbors, distances } 格式
        return result.neighbors.map((idx, i) => {
          if (idx >= 0 && idx < documents.length) {
            return {
              ...documents[idx],
              score: 1 / (1 + result.distances[i])
            };
          } else {
            throw new Error(`检索返回的索引 ${idx} 超出文档范围 (0-${documents.length-1})`);
          }
        });
      }
    };
  }
}

HNSWDb.toString = () => '[class HNSWDb]';

module.exports = {
  HNSWDb,
  getHNSWDb: (options) => HNSWDb.getInstance(options)
}; 