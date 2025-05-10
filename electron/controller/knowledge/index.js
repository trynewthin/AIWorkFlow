'use strict';

const knowledgeService = require('../../services/knowledge/knowledge-service');

/**
 * 知识库控制器
 */
class KnowledgeController {
  /**
   * 列出所有知识库
   */
  async listBases() {
    // 调用服务层获取所有知识库
    return await knowledgeService.listKnowledgeBases();
  }

  /**
   * 列出指定知识库下的所有文档
   * @param {string} knowledgeBaseId
   */
  async listDocuments(knowledgeBaseId) {
    // 调用服务层获取文档列表
    return await knowledgeService.listDocuments(knowledgeBaseId);
  }

  /**
   * 获取指定文档的分块信息
   * @param {string} documentId
   */
  async getDocumentChunks(documentId) {
    // 调用服务层获取分块数据
    return await knowledgeService.getDocumentChunks(documentId);
  }

  /**
   * 从文件路径添加文档并构建HNSW索引
   * @param {{knowledgeBaseId:string,sourcePath:string,metadata?:object}} params
   */
  async ingestFromPath(params) {
    // 调用服务层处理基于路径的文档入库逻辑
    return await knowledgeService.ingestFromPath(params);
  }

  /**
   * 删除指定文档及其分块与向量
   * @param {string} documentId
   */
  async deleteDocument(documentId) {
    // 调用服务层删除文档
    await knowledgeService.deleteDocument(documentId);
    return { success: true };
  }

  /**
   * 新建知识库
   * @param {{name:string,description?:string,owner?:string}} params
   */
  async createBase(params) {
    // 调用服务层创建知识库
    return await knowledgeService.createKnowledgeBase(params);
  }

  /**
   * 删除指定知识库及其所有文档、分块与向量
   * @param {string} knowledgeBaseId
   */
  async deleteBase(knowledgeBaseId) {
    await knowledgeService.deleteKnowledgeBase(knowledgeBaseId);
    return { success: true };
  }

  /**
   * 获取基于HNSW的检索器
   */
  getRetriever() {
    // 调用服务层获取检索器
    return knowledgeService.getRetriever();
  }
}

module.exports = KnowledgeController; 