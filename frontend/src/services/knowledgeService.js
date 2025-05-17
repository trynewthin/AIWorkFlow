import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from '../api/ipcApiRoute';

/**
 * @async
 * @function listKnowledgeBases
 * @description 获取所有知识库列表
 * @returns {Promise<Array<object>>} 知识库对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function listKnowledgeBases() {
  try {
    const result = await ipc.invoke(ipcApiRoute.listBases);
    if (result) {
      return result;
    } else {
      console.error('listKnowledgeBases service error: Empty result');
      throw new Error('获取知识库列表失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.listBases} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function listDocuments
 * @description 获取指定知识库下的所有文档
 * @param {string} knowledgeBaseId - 知识库ID
 * @returns {Promise<Array<object>>} 文档对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function listDocuments(knowledgeBaseId) {
  try {
    const result = await ipc.invoke(ipcApiRoute.listDocuments, knowledgeBaseId);
    if (result) {
      return result;
    } else {
      console.error('listDocuments service error: Empty result');
      throw new Error('获取文档列表失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.listDocuments} for kb ${knowledgeBaseId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getDocumentChunks
 * @description 获取指定文档的分块列表
 * @param {string} documentId - 文档ID
 * @returns {Promise<Array<object>>} 文档分块对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getDocumentChunks(documentId) {
  try {
    const result = await ipc.invoke(ipcApiRoute.getDocumentChunks, documentId);
    if (result) {
      return result;
    } else {
      console.error('getDocumentChunks service error: Empty result');
      throw new Error('获取文档分块失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.getDocumentChunks} for doc ${documentId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function uploadAndIngestFile
 * @description 上传文件并将其导入知识库
 * @param {Object} file - 要上传的文件对象（通常来自input[type=file]）
 * @param {string} knowledgeBaseId - 要导入的知识库ID
 * @returns {Promise<Object>} 处理结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function uploadAndIngestFile(file, knowledgeBaseId) {
  if (!file || !knowledgeBaseId) {
    throw new Error('文件和知识库ID不能为空');
  }

  try {
    // 1. 先将文件上传到服务器临时目录
    const uploadResult = await ipc.invoke(ipcApiRoute.uploadFile, {
      sourcePath: file.path, // 本地文件路径
      filename: file.name,   // 文件名
      mimetype: file.type || 'application/octet-stream' // 文件类型
    });
    
    if (!uploadResult || !uploadResult.fullPath) {
      throw new Error('文件上传失败');
    }
    
    // 2. 上传成功后，调用知识库入库API
    const ingestResult = await ipc.invoke(ipcApiRoute.ingestFromPath, {
      knowledgeBaseId: knowledgeBaseId,
      sourcePath: uploadResult.fullPath, // 使用服务器返回的完整文件路径
      metadata: { title: file.name }
    });
    
    return ingestResult;
  } catch (error) {
    console.error('文件上传或入库失败:', error);
    throw error;
  }
}

/**
 * @async
 * @function deleteDocument
 * @description 删除指定文档
 * @param {string} documentId - 要删除的文档ID
 * @returns {Promise<Object>} 删除结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function deleteDocument(documentId) {
  try {
    const result = await ipc.invoke(ipcApiRoute.deleteDocument, documentId);
    if (result) {
      return result;
    } else {
      console.error('deleteDocument service error: Empty result');
      throw new Error('删除文档失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.deleteDocument} for doc ${documentId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function createKnowledgeBase
 * @description 创建新的知识库
 * @param {Object} params - 知识库创建参数，包括name和description
 * @returns {Promise<Object>} 创建结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function createKnowledgeBase(params) {
  try {
    const result = await ipc.invoke(ipcApiRoute.createBase, params);
    if (result) {
      return result;
    } else {
      console.error('createKnowledgeBase service error: Empty result');
      throw new Error('创建知识库失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.createBase} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function deleteKnowledgeBase
 * @description 删除指定知识库
 * @param {string} baseId - 要删除的知识库ID
 * @returns {Promise<Object>} 删除结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function deleteKnowledgeBase(baseId) {
  try {
    const result = await ipc.invoke(ipcApiRoute.deleteBase, baseId);
    if (result) {
      return result;
    } else {
      console.error('deleteKnowledgeBase service error: Empty result');
      throw new Error('删除知识库失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.deleteBase} for kb ${baseId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function ingestFromPath
 * @description 从指定路径导入文档到知识库
 * @param {Object} params - 入库参数，包括knowledgeBaseId、sourcePath和metadata
 * @returns {Promise<Object>} 处理结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function ingestFromPath(params) {
  try {
    const result = await ipc.invoke(ipcApiRoute.ingestFromPath, params);
    if (result) {
      return result;
    } else {
      console.error('ingestFromPath service error: Empty result');
      throw new Error('文档入库失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.ingestFromPath} failed:`, error);
    throw error;
  }
} 