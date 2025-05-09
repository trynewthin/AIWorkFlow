import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 知识库相关 API
 */

// 列出所有知识库
export const listKnowledgeBases = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.listBases);
    return res;
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    throw error;
  }
};

// 列出指定知识库下的所有文档
export const listDocuments = async (knowledgeBaseId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.listDocuments, knowledgeBaseId);
    return res;
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw error;
  }
};

// 获取指定文档的分块信息
export const getDocumentChunks = async (documentId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getDocumentChunks, documentId);
    return res;
  } catch (error) {
    console.error('获取文档分块失败:', error);
    throw error;
  }
};

// 添加文档并自动分块、向量化存储
export const ingestDocument = async (params) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.ingestDocument, params);
    return res;
  } catch (error) {
    console.error('文档入库失败:', error);
    throw error;
  }
};

// 删除文档及其分块与向量
export const deleteDocument = async (documentId) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.deleteDocument, documentId);
    return res;
  } catch (error) {
    console.error('删除文档失败:', error);
    throw error;
  }
};

// 创建知识库
export const createKnowledgeBase = async (params) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.createBase, params);
    return res;
  } catch (error) {
    console.error('创建知识库失败:', error);
    throw error;
  }
}; 