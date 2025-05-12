import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 知识库相关 API
 */

/**
 * 列出所有知识库
 * @returns {Promise<any>} 知识库列表
 */
export const listKnowledgeBases = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.listBases);
    return res;
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    throw error;
  }
};

/**
 * 列出指定知识库下的所有文档
 * @param {string} knowledgeBaseId 知识库 ID
 * @returns {Promise<any>} 文档列表
 */
export const listDocuments = async (knowledgeBaseId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.listDocuments, knowledgeBaseId);
    return res;
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw error;
  }
};

/**
 * 获取指定文档的分块信息
 * @param {string} documentId 文档 ID
 * @returns {Promise<any>} 分块信息
 */
export const getDocumentChunks = async (documentId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getDocumentChunks, documentId);
    return res;
  } catch (error) {
    console.error('获取文档分块失败:', error);
    throw error;
  }
};

/**
 * 从文件路径添加文档并构建 HNSW 索引
 * @param {object} params 入库参数
 * @returns {Promise<any>} 处理结果
 */
export const ingestFromPath = async (params) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.ingestFromPath, params);
    return res;
  } catch (error) {
    console.error('文档入库失败:', error);
    throw error;
  }
};

/**
 * 获取基于 HNSW 的检索器
 * @returns {Promise<any>} 检索器实例
 */
export const getRetriever = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getRetriever);
    return res;
  } catch (error) {
    console.error('获取检索器失败:', error);
    throw error;
  }
};

/**
 * 删除文档及其分块与向量
 * @param {string} documentId 文档 ID
 * @returns {Promise<any>} 删除结果
 */
export const deleteDocument = async (documentId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.deleteDocument, documentId);
    return res;
  } catch (error) {
    console.error('删除文档失败:', error);
    throw error;
  }
};

/**
 * 创建知识库
 * @param {object} params 创建参数
 * @returns {Promise<any>} 创建结果
 */
export const createKnowledgeBase = async (params) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.createBase, params);
    return res;
  } catch (error) {
    console.error('创建知识库失败:', error);
    throw error;
  }
};

/**
 * 删除知识库
 * @param {string} baseId 知识库 ID
 * @returns {Promise<any>} 删除结果
 */
export const deleteKnowledgeBase = async (baseId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.deleteBase, baseId);
    return res;
  } catch (error) {
    console.error('删除知识库失败:', error);
    throw error;
  }
}; 