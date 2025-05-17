import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 知识库信息接口
 */
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
}

/**
 * 文档信息接口
 */
export interface Document {
  id: string;
  knowledgeBaseId: string;
  name: string;
  path?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
  chunkCount?: number;
}

/**
 * 文档分块信息接口
 */
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata?: {
    pageNumber?: number;
    source?: string;
    [key: string]: any;
  };
  embedding?: number[];
}

/**
 * 入库参数接口
 */
export interface IngestParams {
  sourcePath: string;
  knowledgeBaseId: string;
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    metadata?: any;
    [key: string]: any;
  };
}

/**
 * 创建知识库参数接口
 */
export interface CreateKnowledgeBaseParams {
  name: string;
  description?: string;
}

/**
 * 通用接口响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 知识库相关 API
 */

/**
 * 列出所有知识库
 * @returns {Promise<ApiResponse<KnowledgeBase[]>>} 知识库列表
 */
export const listKnowledgeBases = async (): Promise<ApiResponse<KnowledgeBase[]>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.listBases);
    return res as ApiResponse<KnowledgeBase[]>;
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    throw error;
  }
};

/**
 * 列出指定知识库下的所有文档
 * @param {string} knowledgeBaseId 知识库 ID
 * @returns {Promise<ApiResponse<Document[]>>} 文档列表
 */
export const listDocuments = async (knowledgeBaseId: string): Promise<ApiResponse<Document[]>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.listDocuments, knowledgeBaseId);
    return res as ApiResponse<Document[]>;
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw error;
  }
};

/**
 * 获取指定文档的分块信息
 * @param {string} documentId 文档 ID
 * @returns {Promise<ApiResponse<DocumentChunk[]>>} 分块信息
 */
export const getDocumentChunks = async (documentId: string): Promise<ApiResponse<DocumentChunk[]>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getDocumentChunks, documentId);
    return res as ApiResponse<DocumentChunk[]>;
  } catch (error) {
    console.error('获取文档分块失败:', error);
    throw error;
  }
};

/**
 * 从文件路径添加文档并构建 HNSW 索引
 * @param {IngestParams} params 入库参数
 * @returns {Promise<ApiResponse<Document>>} 处理结果
 */
export const ingestFromPath = async (params: IngestParams): Promise<ApiResponse<Document>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.ingestFromPath, params);
    return res as ApiResponse<Document>;
  } catch (error) {
    console.error('文档入库失败:', error);
    throw error;
  }
};

/**
 * 获取基于 HNSW 的检索器
 * @returns {Promise<ApiResponse<any>>} 检索器实例
 */
export const getRetriever = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getRetriever);
    return res as ApiResponse<any>;
  } catch (error) {
    console.error('获取检索器失败:', error);
    throw error;
  }
};

/**
 * 删除文档及其分块与向量
 * @param {string} documentId 文档 ID
 * @returns {Promise<ApiResponse<boolean>>} 删除结果
 */
export const deleteDocument = async (documentId: string): Promise<ApiResponse<boolean>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.deleteDocument, documentId);
    return res as ApiResponse<boolean>;
  } catch (error) {
    console.error('删除文档失败:', error);
    throw error;
  }
};

/**
 * 创建知识库
 * @param {CreateKnowledgeBaseParams} params 创建参数
 * @returns {Promise<ApiResponse<KnowledgeBase>>} 创建结果
 */
export const createKnowledgeBase = async (params: CreateKnowledgeBaseParams): Promise<ApiResponse<KnowledgeBase>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.createBase, params);
    return res as ApiResponse<KnowledgeBase>;
  } catch (error) {
    console.error('创建知识库失败:', error);
    throw error;
  }
};

/**
 * 删除知识库
 * @param {string} baseId 知识库 ID
 * @returns {Promise<ApiResponse<boolean>>} 删除结果
 */
export const deleteKnowledgeBase = async (baseId: string): Promise<ApiResponse<boolean>> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.deleteBase, baseId);
    return res as ApiResponse<boolean>;
  } catch (error) {
    console.error('删除知识库失败:', error);
    throw error;
  }
}; 