'use strict';

const { getKnowledgeDb } = require('../database');
const EmbNode = require('../workflow/nodes/embnode');
const { randomUUID } = require('crypto');

/**
 * 知识库服务
 * 实现文档/片段的自动分块与向量化存储，以及浏览功能
 */
class KnowledgeService {
  constructor() {
    // TODO: 获取数据库服务实例
    this.kbDb = getKnowledgeDb();
    // TODO: 创建 EmbNode 实例
    this.embNode = new EmbNode();
  }

  /**
   * 文本分块
   * @param {string} text
   * @param {number} maxLen
   * @returns {string[]}
   */
  chunkText(text, maxLen = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLen) {
      chunks.push(text.slice(i, i + maxLen));
    }
    return chunks;
  }

  /**
   * 添加文档并自动分块、向量化存储
   * @param {{knowledgeBaseId:string,title:string,content:string,metadata?:object}} params
   */
  async ingestDocument({ knowledgeBaseId, title, content, metadata = {} }) {
    // TODO: 生成文档ID
    const docId = randomUUID();
    // TODO: 插入文档元信息
    await this.kbDb.addDocument({ id: docId, knowledge_base_id: knowledgeBaseId, title, metadata });
    // TODO: 文本分块
    const chunks = this.chunkText(content);
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunkText = chunks[idx];
      // TODO: 生成分块ID
      const chunkId = randomUUID();
      // TODO: 存储分块文本
      await this.kbDb.addChunk({ id: chunkId, document_id: docId, chunk_index: idx, chunk_text: chunkText });
      // TODO: 生成向量表示
      const embedding = await this.embNode.execute(chunkText);
      // TODO: 存储向量
      await this.kbDb.addEmbedding({ chunk_id: chunkId, embedding, dimension: embedding.length });
    }
    return { docId, chunkCount: chunks.length };
  }

  /**
   * 列出所有知识库
   * @returns {Promise<Array>}
   */
  async listKnowledgeBases() {
    // TODO: 查询知识库表
    return this.kbDb.db.prepare(
      `SELECT * FROM ${this.kbDb.kbTable}`
    ).all();
  }

  /**
   * 列出指定知识库下的所有文档
   * @param {string} knowledgeBaseId
   * @returns {Promise<Array>}
   */
  async listDocuments(knowledgeBaseId) {
    // TODO: 查询文档表
    return this.kbDb.db.prepare(
      `SELECT * FROM ${this.kbDb.documentTable} WHERE knowledge_base_id = ?`
    ).all(knowledgeBaseId);
  }

  /**
   * 获取指定文档的分块信息
   * @param {string} documentId
   * @returns {Promise<Array>}
   */
  async getDocumentChunks(documentId) {
    // TODO: 调用数据库服务获取分块
    return this.kbDb.getChunksByDocument(documentId);
  }

  /**
   * 删除文档及其分块和向量
   * @param {string} documentId
   */
  async deleteDocument(documentId) {
    // TODO: 获取该文档下所有分块
    const chunks = await this.kbDb.getChunksByDocument(documentId);
    // TODO: 删除所有分块的向量数据
    const deleteEmbStmt = this.kbDb.db.prepare(`DELETE FROM ${this.kbDb.embeddingTable} WHERE chunk_id = ?`);
    chunks.forEach(chunk => deleteEmbStmt.run(chunk.id));
    // TODO: 删除分块记录
    this.kbDb.db.prepare(`DELETE FROM ${this.kbDb.chunkTable} WHERE document_id = ?`).run(documentId);
    // TODO: 删除文档记录
    this.kbDb.db.prepare(`DELETE FROM ${this.kbDb.documentTable} WHERE id = ?`).run(documentId);
  }

  /**
   * 创建新的知识库
   * @param {{name:string,description?:string,owner?:string}} params
   * @returns {{id:string,name:string,description:string,owner:string}}
   */
  async createKnowledgeBase({ name, description = '', owner = 'default' }) {
    // 生成知识库ID
    const kbId = randomUUID();
    // 插入知识库记录
    await this.kbDb.addKnowledgeBase({ id: kbId, name, description, owner });
    return { id: kbId, name, description, owner };
  }

  /**
   * 删除指定知识库及其所有关联文档、分块与向量
   * @param {string} knowledgeBaseId 知识库ID
   */
  async deleteKnowledgeBase(knowledgeBaseId) {
    // 获取该知识库下的所有文档
    const docs = await this.listDocuments(knowledgeBaseId);
    // 逐个删除文档及其关联数据
    for (const doc of docs) {
      await this.deleteDocument(doc.id);
    }
    // 删除知识库记录
    const stmt = this.kbDb.db.prepare(
      `DELETE FROM ${this.kbDb.kbTable} WHERE id = ?`
    );
    stmt.run(knowledgeBaseId);
  }
}

module.exports = new KnowledgeService(); 