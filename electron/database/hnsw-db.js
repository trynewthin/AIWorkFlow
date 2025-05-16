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
    // 初始化索引最大容量估计值
    this.maxElements = options.maxElements || 10000;
    this._initTable();
  }

  _initTable() {
    // HNSW 索引无需 SQLite 表结构
  }

  /**
   * 构建并持久化 HNSW 索引
   * @param {Document[]} documents 文档数组，格式 { pageContent, metadata }
   * @param {Object} config 配置项，包括 modelName, space (向量维度)
   * @param {boolean} [append=false] 是否追加到现有索引，而不是重建
   */
  async buildIndex(documents, config = {}, append = true) {
    if (!documents || documents.length === 0) {
      throw new Error('构建索引需要提供有效的文档');
    }
    
    // 使用 OpenAIEmbeddings 生成向量
    const embedder = new OpenAIEmbeddings({ 
      modelName: config.modelName || 'text-embedding-3-small',
      dimensions: config.space || this.dimension // 确保维度一致
    });
    
    console.log(`构建索引, 嵌入维度: ${config.space || this.dimension}, 模型: ${config.modelName || 'text-embedding-3-small'}, 文档数: ${documents.length}, 模式: ${append ? '追加' : '重建'}`);
    
    const vectors = await Promise.all(
      documents.map(doc => embedder.embedQuery(doc.pageContent))
    );
    
    // 确认向量维度
    const dim = vectors[0].length;
    console.log(`实际生成向量维度: ${dim}`);
    
    try {
      // 如果是追加模式且索引已存在，则尝试加载现有索引
      const indexPath = path.join(this.indexDir, 'hnsw_index.bin');
      let existingDocs = [];
      
      if (append && fs.existsSync(indexPath) && (!this.index || this.documents.length === 0)) {
        try {
          // 尝试加载现有索引和文档
          await this.loadIndex({ dimension: dim });
          existingDocs = [...this.documents]; // 保存现有文档
          console.log(`加载现有索引成功，现有文档数: ${existingDocs.length}`);
        } catch (err) {
          console.warn(`加载现有索引失败，将创建新索引: ${err.message}`);
          append = false; // 切换到重建模式
        }
      }
      
      // 确定要使用的索引
      if (!append || !this.index) {
        // 如果是重建模式或加载失败，创建新索引
        this.index = new hnswlib.HierarchicalNSW('cosine', dim);
        // 预估一个较大的容量，避免频繁重建
        const totalDocs = existingDocs.length + documents.length;
        const estimatedCapacity = Math.max(totalDocs * 2, this.maxElements);
        this.index.initIndex(estimatedCapacity);
        console.log(`创建新索引，预估容量: ${estimatedCapacity}`);
        
        // 如果有现有文档，先添加它们
        if (existingDocs.length > 0) {
          const existingVectors = await Promise.all(
            existingDocs.map(doc => embedder.embedQuery(doc.pageContent))
          );
          for (let i = 0; i < existingDocs.length; i++) {
            this.index.addPoint(existingVectors[i], i);
          }
          console.log(`添加 ${existingDocs.length} 个现有文档到新索引`);
        }
        
        // 添加新文档向量
        const startIdx = existingDocs.length;
        for (let i = 0; i < vectors.length; i++) {
          this.index.addPoint(vectors[i], startIdx + i);
        }
        
        // 更新文档列表
        this.documents = [...existingDocs, ...documents];
      } else {
        // 追加模式，保留现有索引
        // 检查索引是否已经初始化以及是否有足够的容量
        let needReinitialize = false;
        
        try {
          const currentCount = this.index.getCurrentCount();
          // 如果当前点数为0，或者剩余容量不足，需要重新初始化
          if (currentCount === 0) {
            console.log('索引点数为0，需要重新初始化');
            needReinitialize = true;
          } else {
            // 检查剩余容量
            const maxElements = this.index.getMaxElements();
            const neededCapacity = currentCount + vectors.length;
            if (neededCapacity > maxElements) {
              console.log(`索引容量不足，当前容量 ${maxElements}，需要 ${neededCapacity}，将重新初始化`);
              needReinitialize = true;
            }
          }
        } catch (error) {
          console.error('检查索引状态失败，将重新初始化:', error);
          needReinitialize = true;
        }
        
        // 如果需要重新初始化
        if (needReinitialize) {
          console.log('重新初始化索引');
          const totalDocs = existingDocs.length + documents.length;
          const estimatedCapacity = Math.max(totalDocs * 2, this.maxElements);
          
          // 创建新的索引实例
          this.index = new hnswlib.HierarchicalNSW('cosine', dim);
          this.index.initIndex(estimatedCapacity);
          
          // 如果有现有文档，先添加它们
          if (existingDocs.length > 0) {
            const existingVectors = await Promise.all(
              existingDocs.map(doc => embedder.embedQuery(doc.pageContent))
            );
            for (let i = 0; i < existingDocs.length; i++) {
              this.index.addPoint(existingVectors[i], i);
            }
            console.log(`添加 ${existingDocs.length} 个现有文档到重新初始化的索引`);
          }
          
          // 添加新文档向量
          const startIdx = existingDocs.length;
          for (let i = 0; i < vectors.length; i++) {
            this.index.addPoint(vectors[i], startIdx + i);
          }
          
          // 更新文档列表
          this.documents = [...existingDocs, ...documents];
        } else {
          // 索引状态正常，直接追加
          const startIdx = this.documents.length;
          for (let i = 0; i < vectors.length; i++) {
            this.index.addPoint(vectors[i], startIdx + i);
          }
          
          // 更新文档列表
          this.documents = [...this.documents, ...documents];
        }
      }
      
      console.log(`索引构建完成，总文档数: ${this.documents.length}`);
      
      // 持久化索引文件
      this.index.writeIndex(indexPath);
      
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
      
      // 获取索引当前的元素数量
      const currentCount = this.index.getCurrentCount();
      console.log(`HNSW 索引加载成功，当前索引点数: ${currentCount}`);
      
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
      console.log(`从知识库加载了 ${this.documents.length} 个文档`);
      
      // 检查索引点数和文档数是否匹配
      if (currentCount !== this.documents.length) {
        console.warn(`警告: 索引点数 (${currentCount}) 与文档数 (${this.documents.length}) 不匹配，可能导致检索结果不准确`);
      }
      
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
   * 获取索引中的当前点数
   * @returns {number}
   */
  getCurrentCount() {
    return this.index && typeof this.index.getCurrentCount === 'function' ? this.index.getCurrentCount() : 0;
  }
  
  /**
   * 调试用：打印索引和文档映射信息
   */
  debugInfo() {
    const info = {
      indexInitialized: this.isIndexInitialized(),
      dimension: this.dimension,
      currentCount: this.getCurrentCount(),
      documentsLoaded: this.documents.length,
      documentsWithMetadata: this.documents.filter(d => d.metadata).length,
    };
    
    if (this.documents.length > 0) {
      // 抽样展示一些文档信息
      const sampleSize = Math.min(3, this.documents.length);
      info.sampleDocs = [];
      for (let i = 0; i < sampleSize; i++) {
        const idx = Math.floor(i * this.documents.length / sampleSize);
        const doc = this.documents[idx];
        info.sampleDocs.push({
          index: idx,
          contentPreview: doc.pageContent.substring(0, 50) + (doc.pageContent.length > 50 ? '...' : ''),
          metadata: doc.metadata
        });
      }
    }
    
    return info;
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
        
        console.log(`检索结果: 找到 ${result.neighbors.length} 个邻居，查询距离范围: ${Math.min(...result.distances)} - ${Math.max(...result.distances)}`);
        
        // 记录详细的索引和距离信息，便于调试
        const detailedResults = result.neighbors.map((idx, i) => ({
          index: idx,
          distance: result.distances[i],
          score: 1 / (1 + result.distances[i]),
          contentPreview: idx >= 0 && idx < documents.length 
            ? documents[idx].pageContent.substring(0, 30) + '...'
            : 'Invalid index'
        }));
        console.log('详细检索结果:', JSON.stringify(detailedResults, null, 2));
        
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