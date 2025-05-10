'use strict';

const { getKnowledgeDb, getHNSWDb } = require('../../database');
const ChunkNode = require('../../model/nodes/chunk');
const EmbeddingNode = require('../../model/nodes/embedding');
const { randomUUID } = require('crypto');
const { Document } = require('@langchain/core/documents');

/**
 * 知识库服务（基于HNSW索引的超集实现）
 */
class KnowledgeService {
  constructor() {
    // 获取知识库数据库服务实例
    this.kbDb = getKnowledgeDb();
    // 获取HNSW索引管理服务实例
    this.hnswDb = getHNSWDb();
    // 创建分块节点实例
    this.chunkNode = new ChunkNode();
    // 创建嵌入节点实例
    this.embeddingNode = new EmbeddingNode();
  }

  // 创建新的知识库
  async createKnowledgeBase({ name, description = '', owner = 'default' }) {
    const kbId = randomUUID();
    await this.kbDb.addKnowledgeBase({ id: kbId, name, description, owner });
    return { id: kbId, name, description, owner };
  }

  // 列出所有知识库
  async listKnowledgeBases() {
    return this.kbDb.db.prepare(`SELECT * FROM ${this.kbDb.kbTable}`).all();
  }

  // 列出指定知识库下的所有文档
  async listDocuments(knowledgeBaseId) {
    return this.kbDb.db.prepare(
      `SELECT * FROM ${this.kbDb.documentTable} WHERE knowledge_base_id = ?`
    ).all(knowledgeBaseId);
  }

  // 获取指定文档的分块信息
  async getDocumentChunks(documentId) {
    return this.kbDb.getChunksByDocument(documentId);
  }

  // 文档分块并构建HNSW索引
  async ingestFromPath({ knowledgeBaseId, sourcePath, metadata = {} }) {
    const docId = randomUUID();
    // 插入文档元信息
    await this.kbDb.addDocument({
      id: docId,
      knowledge_base_id: knowledgeBaseId,
      title: metadata.title || sourcePath,
      metadata
    });

    // 使用分块节点执行分块
    const chunkTexts = await this.chunkNode.execute(sourcePath);

    const docsForIndex = [];
    let vectorDim = null;

    for (let idx = 0; idx < chunkTexts.length; idx++) {
      const chunkText = chunkTexts[idx];
      const chunkId = randomUUID();
      // 存储分块文本
      await this.kbDb.addChunk({
        id: chunkId,
        document_id: docId,
        chunk_index: idx,
        chunk_text: chunkText
      });
      // 使用嵌入节点生成向量
      const vector = await this.embeddingNode.execute(chunkText);
      vectorDim = vector.length;
      // 存储向量到数据库
      await this.kbDb.addEmbedding({
        chunk_id: chunkId,
        embedding: vector,
        dimension: vectorDim
      });
      // 准备HNSW索引文档数据
      docsForIndex.push(new Document({
        pageContent: chunkText,
        metadata: { chunkId, documentId: docId }
      }));
    }

    // 构建并持久化HNSW索引
    await this.hnswDb.buildIndex(docsForIndex, {
      modelName: this.embeddingNode.getModelName(),
      dimension: vectorDim
    });

    return { docId, chunkCount: chunkTexts.length };
  }

  // 获取HNSW检索器
  getRetriever() {
    return this.hnswDb.getRetriever();
  }

  // 删除指定文档及关联数据
  async deleteDocument(documentId) {
    const chunks = await this.kbDb.getChunksByDocument(documentId);
    // 删除向量
    const deleteEmbStmt = this.kbDb.db.prepare(
      `DELETE FROM ${this.kbDb.embeddingTable} WHERE chunk_id = ?`
    );
    chunks.forEach(chunk => deleteEmbStmt.run(chunk.id));
    // 删除分块记录
    this.kbDb.db.prepare(
      `DELETE FROM ${this.kbDb.chunkTable} WHERE document_id = ?`
    ).run(documentId);
    // 删除文档记录
    this.kbDb.db.prepare(
      `DELETE FROM ${this.kbDb.documentTable} WHERE id = ?`
    ).run(documentId);
  }

  // 删除指定知识库及其所有关联数据
  async deleteKnowledgeBase(knowledgeBaseId) {
    const docs = await this.listDocuments(knowledgeBaseId);
    for (const doc of docs) {
      await this.deleteDocument(doc.id);
    }
    this.kbDb.db.prepare(
      `DELETE FROM ${this.kbDb.kbTable} WHERE id = ?`
    ).run(knowledgeBaseId);
  }
}

module.exports = new KnowledgeService(); 