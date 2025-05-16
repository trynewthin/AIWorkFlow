'use strict';

const { getKnowledgeDb, getHNSWDb } = require('../../database');
const ChunkNode = require('../../node/models/ChunkNode');
const EmbeddingNode = require('../../node/models/EmbeddingNode');
const Pipeline = require('../../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { randomUUID } = require('crypto');
const { Document } = require('@langchain/core/documents');
const fs = require('fs');
const path = require('path');

/**
 * 知识库服务（基于HNSW索引的超集实现）
 */
class KnowledgeService {
  constructor() {
    // 获取知识库数据库服务实例
    this.kbDb = getKnowledgeDb();
    // 获取HNSW索引管理服务实例
    this.hnswDb = getHNSWDb();
    // 创建分块节点实例 (尚未初始化)
    this.chunkNode = new ChunkNode();
    // 创建嵌入节点实例 (尚未初始化)
    this.embeddingNode = new EmbeddingNode();
  }

  /**
   * @method initService
   * @description 异步初始化服务内部依赖的节点。
   * @async
   */
  async initService() {
    // 使用默认配置初始化节点
    await this.chunkNode.init();
    await this.embeddingNode.init();
    // 此处可以添加检查，确保节点已成功初始化，例如检查 this.chunkNode.isInitialized()
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

  /**
   * 读取文件内容
   * @param {string} filePath 文件路径
   * @returns {Promise<string>} 文件内容
   */
  async _readFileContent(filePath) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error(`读取文件失败: ${error.message}`);
      throw error;
    }
  }

  // 文档分块并构建HNSW索引
  async ingestFromPath({ knowledgeBaseId, sourcePath, metadata = {} }) {
    // 确保节点已初始化 (如果服务未强制调用 initService，则可在此处按需初始化)
    if (!this.chunkNode.isInitialized()) await this.chunkNode.init();
    if (!this.embeddingNode.isInitialized()) await this.embeddingNode.init();

    const docId = randomUUID();
    
    // 读取文件内容
    let fileContent;
    try {
      fileContent = await this._readFileContent(sourcePath);
    } catch (error) {
      throw new Error(`无法读取文件内容: ${error.message}`);
    }

    // 插入文档元信息
    await this.kbDb.addDocument({
      id: docId,
      knowledge_base_id: knowledgeBaseId,
      title: metadata.title || path.basename(sourcePath),
      metadata: JSON.stringify(metadata)
    });

    // 基于 Pipeline 流执行分块，直接使用文件内容而非路径
    const chunkPipeline = Pipeline.of(PipelineType.PROMPT, DataType.TEXT, fileContent);
    const chunkResult = await this.chunkNode.process(chunkPipeline);
    
    // 获取分块数据
    const chunkItems = chunkResult.getAll().filter(item => item.type === DataType.CHUNK);
    if (chunkItems.length === 0) {
      throw new Error('分块失败，未生成有效的文本块');
    }

    const docsForIndex = [];
    let vectorDim = null;

    for (let idx = 0; idx < chunkItems.length; idx++) {
      const chunk = chunkItems[idx].data;
      const chunkText = chunk.text;
      const chunkMetadata = chunk.metadata || {};
      
      const chunkId = randomUUID();
      // 存储分块文本
      await this.kbDb.addChunk({
        id: chunkId,
        document_id: docId,
        chunk_index: idx,
        chunk_text: chunkText
      });
      
      // 使用 Pipeline 流生成嵌入向量
      const embedPipeline = Pipeline.of(PipelineType.PROMPT, DataType.TEXT, chunkText);
      const embedResult = await this.embeddingNode.process(embedPipeline);
      // 获取所有 EMBEDDING 类型管道条目
      const embedItems = embedResult.getAll().filter(item => item.type === DataType.EMBEDDING);
      if (embedItems.length === 0) {
        throw new Error('嵌入失败，未生成有效的向量');
      }
      const embeddingData = embedItems[0].data;
      const vector = Array.isArray(embeddingData) ? embeddingData : embeddingData.vector;
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
        metadata: { 
          chunkId, 
          documentId: docId,
          knowledgeBaseId, // 确保添加知识库ID到元数据
          title: metadata.title || path.basename(sourcePath),
          ...chunkMetadata
        }
      }));
    }

    // 构建并持久化HNSW索引，使用追加模式避免重建
    try {
      console.log(`将 ${docsForIndex.length} 个新文档分块添加到索引`);
      await this.hnswDb.buildIndex(docsForIndex, {
        modelName: this.embeddingNode.getWorkConfig().model,
        dimension: vectorDim
      }, true); // 使用append=true，追加到现有索引
      
      // 输出调试信息
      const indexInfo = this.hnswDb.debugInfo();
      console.log(`索引更新后状态: ${JSON.stringify(indexInfo, null, 2)}`);
    } catch (error) {
      console.error(`索引构建错误:`, error);
      throw new Error(`索引构建失败: ${error.message}`);
    }

    return { docId, chunkCount: chunkItems.length };
  }

  // 获取HNSW检索器
  getRetriever() {
    return this.hnswDb.getRetriever();
  }

  // 删除指定文档及关联数据
  async deleteDocument(documentId) {
    // 获取要删除的所有分块
    const chunks = await this.kbDb.getChunksByDocument(documentId);
    console.log(`准备删除文档 ${documentId}，包含 ${chunks.length} 个分块`);
    
    // 从数据库删除关联数据
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
    
    // 删除文档后，需要重建HNSW索引，不能简单地移除特定点
    // 因为HNSW索引是有序的，移除点会导致索引错乱
    try {
      console.log(`文档删除成功，准备重建HNSW索引...`);
      
      // 重新获取所有分块和嵌入
      const result = await this.kbDb.getAllChunksWithEmbeddings();
      if (!result || !result.documents || result.documents.length === 0) {
        console.log(`所有文档已删除，清空索引`);
        // 如果没有剩余文档，创建一个空索引
        try {
          const indexPath = path.join(this.hnswDb.indexDir, 'hnsw_index.bin');
          // 清空索引状态
          this.hnswDb.documents = [];
          this.hnswDb.index = null;
          
          // 如果需要，可以删除索引文件
          if (fs.existsSync(indexPath)) {
            fs.unlinkSync(indexPath);
            console.log(`索引文件已删除: ${indexPath}`);
          }
        } catch (err) {
          console.error(`清空索引失败: ${err.message}`);
          // 这里不抛出错误，因为数据库已经删除了，即使索引清理失败也不致命
        }
        return; // 没有剩余文档，不需要重建索引
      }
      
      // 准备用于重建索引的文档
      const docsForIndex = result.documents;
      console.log(`准备重建索引，剩余文档数: ${docsForIndex.length}`);
      
      // 获取嵌入模型参数
      const embeddingConfig = this.embeddingNode.getWorkConfig();
      
      // 强制重建索引（append=false），确保索引与当前文档一致
      await this.hnswDb.buildIndex(docsForIndex, {
        modelName: embeddingConfig.model,
        dimension: embeddingConfig.dimensions || 1024
      }, false); // 重建模式，不是追加模式
      
      console.log(`索引重建完成，当前索引包含 ${this.hnswDb.documents.length} 个文档`);
    } catch (error) {
      console.error(`删除文档后重建索引失败: ${error.message}`);
      throw new Error(`删除文档成功，但重建索引失败: ${error.message}`);
    }
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