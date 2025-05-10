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
const { getKnowledgeDb } = require('./index');

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
    // 使用 OpenAIEmbeddings 生成向量
    const embedder = new OpenAIEmbeddings({ modelName: config.modelName || 'text-embedding-v3' });
    const vectors = await Promise.all(
      documents.map(doc => embedder.embedQuery(doc.pageContent))
    );
    const dim = vectors[0].length;
    // 初始化 HNSW 索引
    this.index = new hnswlib.HierarchicalNSW('cosine', dim);
    this.index.initIndex(vectors.length);
    vectors.forEach((vector, i) => this.index.addPoint(vector, i));
    // 持久化索引文件
    const indexPath = path.join(this.indexDir, 'hnsw_index.bin');
    this.index.writeIndex(indexPath);
    // 保存文档映射
    this.documents = documents;
    return this.index;
  }

  /**
   * 加载已存在的 HNSW 索引
   * @param {Object} config 配置项，包括 modelName
   */
  async loadIndex(config = {}) {
    const dim = config.dimension || config.space;
    if (!dim) {
      throw new Error('加载 HNSW 索引时需要提供 dimension 或 space');
    }
    // 加载 HNSW 索引文件
    this.index = new hnswlib.HierarchicalNSW('cosine', dim);
    const indexPath = path.join(this.indexDir, 'hnsw_index.bin');
    this.index.loadIndex(indexPath, dim);
    // 从知识库获取文档用于映射
    const kbDb = getKnowledgeDb();
    const { documents } = await kbDb.getAllChunksWithEmbeddings();
    this.documents = documents;
    return this.index;
  }

  /**
   * 获取检索器，用于查询相似文档
   */
  getRetriever() {
    if (!this.index) {
      throw new Error('HNSW 索引未加载，请先调用 loadIndex 或 buildIndex');
    }
    return {
      async retrieve(queryEmbedding, k = 5) {
        const result = this.index.searchKnn(queryEmbedding, k);
        return result.neighbors.map((idx, i) => ({
          ...this.documents[idx],
          score: 1 / (1 + result.distances[i])
        }));
      }
    };
  }
}

HNSWDb.toString = () => '[class HNSWDb]';

module.exports = {
  HNSWDb,
  getHNSWDb: (options) => HNSWDb.getInstance(options)
}; 