'use strict';

const { ModuleDbBase } = require('./module-db-base');

/**
 * 知识库数据库服务
 * 管理知识库、文档、文档分块及向量表
 */
class KnowledgeDb extends ModuleDbBase {
  constructor(options = {}) {
    super({
      dbname: options.dbname || 'knowledge-base.db',
      moduleId: 'knowledge-base-module'
    });
    // TODO: 定义表名
    this.kbTable = 'knowledge_base';
    this.documentTable = 'document';
    this.chunkTable = 'doc_chunk';
    this.embeddingTable = 'chunk_embedding';
    this._initTable();
  }

  /**
   * 初始化表结构
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.kbTable} (
        id TEXT PRIMARY KEY,       -- 知识库唯一标识
        name TEXT NOT NULL,        -- 知识库名称
        description TEXT,          -- 知识库描述
        owner TEXT,                -- 创建者
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 创建时间
      );
      CREATE TABLE IF NOT EXISTS ${this.documentTable} (
        id TEXT PRIMARY KEY,                   -- 文档唯一标识
        knowledge_base_id TEXT NOT NULL,      -- 所属知识库
        title TEXT,                           -- 文档标题
        metadata TEXT,                        -- 文档元信息(JSON格式)
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(knowledge_base_id) REFERENCES ${this.kbTable}(id)
      );
      CREATE TABLE IF NOT EXISTS ${this.chunkTable} (
        id TEXT PRIMARY KEY,                  -- 块唯一标识
        document_id TEXT NOT NULL,            -- 所属文档
        chunk_index INTEGER NOT NULL,         -- 块序号
        chunk_text TEXT NOT NULL,             -- 分块文本
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES ${this.documentTable}(id)
      );
      CREATE TABLE IF NOT EXISTS ${this.embeddingTable} (
        chunk_id TEXT PRIMARY KEY,            -- 与 doc_chunk 一一对应
        embedding BLOB NOT NULL,              -- 向量数据
        dimension INTEGER NOT NULL,           -- 向量维度
        index_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(chunk_id) REFERENCES ${this.chunkTable}(id)
      );
      CREATE INDEX IF NOT EXISTS idx_doc_kb ON ${this.documentTable}(knowledge_base_id);
      CREATE INDEX IF NOT EXISTS idx_chunk_doc ON ${this.chunkTable}(document_id);
    `;
    this.db.exec(sql);
  }

  /**
   * 创建新的知识库
   * @param {{id:string,name:string,description?:string,owner?:string}} kbData
   */
  async addKnowledgeBase({ id, name, description = '', owner = '' }) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.kbTable}(id,name,description,owner) VALUES(?,?,?,?)`
    );
    stmt.run(id, name, description, owner);
  }

  /**
   * 根据ID获取知识库
   * @param {string} id
   */
  async getKnowledgeBaseById(id) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.kbTable} WHERE id = ?`
    );
    return stmt.get(id);
  }

  /**
   * 创建文档元信息
   * @param {{id:string,knowledge_base_id:string,title?:string,metadata?:object}} docData
   */
  async addDocument({ id, knowledge_base_id, title = '', metadata = {} }) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.documentTable}(id,knowledge_base_id,title,metadata) VALUES(?,?,?,?)`
    );
    stmt.run(id, knowledge_base_id, title, JSON.stringify(metadata));
  }

  /**
   * 获取文档下所有分块
   * @param {string} documentId
   */
  async getChunksByDocument(documentId) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.chunkTable} WHERE document_id = ? ORDER BY chunk_index`
    );
    return stmt.all(documentId);
  }

  /**
   * 保存单个分块
   * @param {{id:string,document_id:string,chunk_index:number,chunk_text:string}} chunkData
   */
  async addChunk({ id, document_id, chunk_index, chunk_text }) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.chunkTable}(id,document_id,chunk_index,chunk_text) VALUES(?,?,?,?)`
    );
    stmt.run(id, document_id, chunk_index, chunk_text);
  }

  /**
   * 保存分块向量
   * @param {{chunk_id:string,embedding:Array<number>,dimension:number}} embData
   */
  async addEmbedding({ chunk_id, embedding, dimension }) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.embeddingTable}(chunk_id,embedding,dimension) VALUES(?,?,?)`
    );
    stmt.run(chunk_id, JSON.stringify(embedding), dimension);
  }

  /**
   * 基于向量相似度检索分块
   * @param {Array<number>} queryEmbedding
   * @param {number} topK
   * @param {string} [knowledgeBaseId]
   */
  async searchSimilarChunks(queryEmbedding, topK = 5, knowledgeBaseId) {
    // 读取所有候选向量
    const all = this.db.prepare(
      `SELECT ce.chunk_id, ce.embedding, ce.dimension, dc.chunk_text, dc.document_id
         FROM ${this.embeddingTable} ce
         JOIN ${this.chunkTable} dc ON ce.chunk_id = dc.id
         ${knowledgeBaseId ? `JOIN ${this.documentTable} d ON dc.document_id=d.id AND d.knowledge_base_id='${knowledgeBaseId}'` : ''}`
    ).all();
    // 计算相似度
    const scored = all.map(row => {
      const emb = JSON.parse(row.embedding);
      const dot = emb.reduce((s,v,i)=>s+v*queryEmbedding[i],0);
      const magA = Math.sqrt(emb.reduce((s,v)=>s+v*v,0));
      const magB = Math.sqrt(queryEmbedding.reduce((s,v)=>s+v*v,0));
      const score = dot/(magA*magB);
      return {...row, score};
    });
    scored.sort((a,b)=>b.score - a.score);
    return scored.slice(0, topK).map(({chunk_id,chunk_text,document_id,score})=>({chunk_id,chunk_text,document_id,score}));
  }

  /**
   * 获取所有分块和对应的向量数组
   * @param {string} [knowledgeBaseId] 可选，按知识库ID过滤
   * @returns {{ documents: Array<{pageContent:string, metadata:object}>, embeddings: number[][] }}
   */
  async getAllChunksWithEmbeddings(knowledgeBaseId) {
    // 拼接 SQL，按需过滤知识库
    const sql = `
      SELECT dc.id AS chunkId, dc.chunk_text AS pageContent, dc.document_id AS documentId, ce.embedding AS embJson
      FROM ${this.chunkTable} dc
      JOIN ${this.embeddingTable} ce ON dc.id = ce.chunk_id
      ${knowledgeBaseId ? `JOIN ${this.documentTable} d ON dc.document_id=d.id AND d.knowledge_base_id='${knowledgeBaseId}'` : ''}
    `;
    const rows = this.db.prepare(sql).all();
    // 构造文档和向量数组
    const documents = rows.map(r => ({ pageContent: r.pageContent, metadata: { chunkId: r.chunkId, documentId: r.documentId } }));
    const embeddings = rows.map(r => JSON.parse(r.embJson));
    return { documents, embeddings };
  }
}

KnowledgeDb.toString = () => '[class KnowledgeDb]';

module.exports = {
  KnowledgeDb,
  getKnowledgeDb: (options) => KnowledgeDb.getInstance(options)
}; 