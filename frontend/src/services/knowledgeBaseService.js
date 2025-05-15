import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * @async
 * @function listBases
 * @description 获取所有知识库列表
 * @returns {Promise<Array<object>>} 知识库列表
 * @throws {Error} IPC调用失败时
 */
export async function listBases() {
  try {
    const result = await ipc.invoke(apiRoutes.listBases);
    // 后端直接返回数组，因此不需要检查 result.success
    if (result) { // 确保 result 不是 undefined 或 null
      return result; // result 就是数据数组
    } else {
      // 通常 ipc.invoke 失败会直接抛出异常进入 catch块
      // 但如果后端返回了 null 或 undefined 而没有错误，这里可以处理
      console.error('listBases service error: Received null or undefined from backend', 'Raw result:', result);
      throw new Error('获取知识库列表失败: 后端返回无效数据');
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.listBases} failed:`, error);
    // 重新抛出错误，或根据需要包装错误
    throw new Error(`获取知识库列表失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function createBase
 * @description 创建新的知识库
 * @param {{ name: string, description?: string, owner?: string }} baseDetails - 知识库详情
 * @returns {Promise<object>} 创建的知识库对象 { id, name, description, owner }
 * @throws {Error} IPC调用失败时
 */
export async function createBase(baseDetails) {
  try {
    const result = await ipc.invoke(apiRoutes.createBase, baseDetails);
    // 后端直接返回创建的知识库对象
    if (result && result.id) { // 假设成功时总有id
      return result;
    } else {
      const errorMessage = result ? JSON.stringify(result) : '后端返回无效数据';
      console.error('createBase service error:', errorMessage, 'Raw result:', result);
      throw new Error(`创建知识库失败: ${errorMessage}`);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.createBase} failed:`, error);
    throw new Error(`创建知识库失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function listDocuments
 * @description 获取指定知识库下的文档列表
 * @param {string} knowledgeBaseId - 知识库ID
 * @returns {Promise<Array<object>>} 文档列表
 * @throws {Error} IPC调用失败时
 */
export async function listDocuments(knowledgeBaseId) {
  try {
    const result = await ipc.invoke(apiRoutes.listDocuments, knowledgeBaseId);
    // 后端直接返回数组
    if (result) {
      return result;
    } else {
      console.error('listDocuments service error: Received null or undefined from backend', 'Raw result:', result);
      throw new Error('获取文档列表失败: 后端返回无效数据');
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.listDocuments} for base ${knowledgeBaseId} failed:`, error);
    throw new Error(`获取文档列表失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function getDocumentChunks
 * @description 获取指定文档的分块信息
 * @param {string} documentId - 文档ID
 * @returns {Promise<Array<object>>} 文档分块信息列表
 * @throws {Error} IPC调用失败时
 */
export async function getDocumentChunks(documentId) {
  try {
    const result = await ipc.invoke(apiRoutes.getDocumentChunks, documentId);
    // 后端直接返回数组
    if (result) {
      return result;
    } else {
      console.error('getDocumentChunks service error: Received null or undefined from backend', 'Raw result:', result);
      throw new Error('获取文档分块失败: 后端返回无效数据');
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getDocumentChunks} for document ${documentId} failed:`, error);
    throw new Error(`获取文档分块失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function ingestFromPath
 * @description 从指定路径提取文档内容并存入知识库
 * @param {{ knowledgeBaseId: string, sourcePath: string, metadata?: object }} ingestDetails - 提取详情
 * @returns {Promise<object>} 后端返回的提取结果 { docId, chunkCount }
 * @throws {Error} IPC调用失败时
 */
export async function ingestFromPath(ingestDetails) {
  try {
    const result = await ipc.invoke(apiRoutes.ingestFromPath, ingestDetails);
    // 后端直接返回 { docId, chunkCount }
    if (result && result.docId) { // 假设成功时总有 docId
      return result;
    } else {
      const errorMessage = result ? JSON.stringify(result) : '后端返回无效数据';
      console.error('ingestFromPath service error:', errorMessage, 'Raw result:', result);
      throw new Error(`文档提取失败: ${errorMessage}`);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.ingestFromPath} failed:`, error);
    throw new Error(`文档提取失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function getRetriever
 * @description 获取知识库的检索器实例
 * @returns {Promise<any>} 后端返回的检索器实例或相关数据
 * @throws {Error} IPC调用失败时
 */
export async function getRetriever() {
  try {
    const result = await ipc.invoke(apiRoutes.getRetriever);
    // 后端直接返回检索器实例或相关数据
    if (result) {
      return result;
    } else {
      console.error('getRetriever service error: Received null or undefined from backend', 'Raw result:', result);
      throw new Error('获取检索器失败: 后端返回无效数据');
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getRetriever} failed:`, error);
    throw new Error(`获取检索器失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function deleteDocument
 * @description 删除指定的文档及其相关数据
 * @param {string} documentId - 文档ID
 * @returns {Promise<boolean>} 删除成功则为 true
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function deleteDocument(documentId) {
  try {
    const result = await ipc.invoke(apiRoutes.deleteDocument, documentId);
    // 此接口后端控制器返回 { success: true }
    if (result && result.success) {
      return true;
    } else {
      const errorMessage = result ? result.message : '删除文档失败 (未知错误)';
      console.error('deleteDocument service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteDocument} for document ${documentId} failed:`, error);
    throw new Error(`删除文档失败: ${error.message || error}`);
  }
}

/**
 * @async
 * @function deleteBase
 * @description 删除指定的知识库及其所有内容
 * @param {string} knowledgeBaseId - 知识库ID
 * @returns {Promise<boolean>} 删除成功则为 true
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function deleteBase(knowledgeBaseId) {
  try {
    const result = await ipc.invoke(apiRoutes.deleteBase, knowledgeBaseId);
    // 此接口后端控制器返回 { success: true }
    if (result && result.success) {
      return true;
    } else {
      const errorMessage = result ? result.message : '删除知识库失败 (未知错误)';
      console.error('deleteBase service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteBase} for base ${knowledgeBaseId} failed:`, error);
    throw new Error(`删除知识库失败: ${error.message || error}`);
  }
} 