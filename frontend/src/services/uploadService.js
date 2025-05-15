import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * @async
 * @function uploadFile
 * @description 上传文件服务。前端应提供文件的源路径、原始文件名和MIME类型。
 * @param {{ sourcePath: string, filename: string, mimetype: string }} fileDetails - 文件详情对象
 * @param {string} fileDetails.sourcePath - 文件的完整源路径 (例如，通过 Electron 的 dialog.showOpenDialog 获取)
 * @param {string} fileDetails.filename - 原始文件名
 * @param {string} fileDetails.mimetype - 文件的 MIME 类型
 * @returns {Promise<object>} 后端返回的上传结果，通常包含文件信息
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function uploadFile(fileDetails) {
  try {
    const result = await ipc.invoke(apiRoutes.uploadFile, fileDetails);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '上传文件失败';
      console.error('uploadFile service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.uploadFile} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function listFiles
 * @description 获取已上传文件列表服务
 * @returns {Promise<Array<object>>} 文件列表
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function listFiles() {
  try {
    const result = await ipc.invoke(apiRoutes.listFiles);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取文件列表失败';
      console.error('listFiles service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.listFiles} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getFileInfo
 * @description 根据文件ID获取文件信息服务
 * @param {string} fileId - 文件ID
 * @returns {Promise<object>} 文件信息对象
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function getFileInfo(fileId) {
  try {
    // 后端控制器期望直接接收 id 字符串作为参数
    const result = await ipc.invoke(apiRoutes.getFileInfo, fileId);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取文件信息失败';
      console.error('getFileInfo service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getFileInfo} with id ${fileId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function deleteFile
 * @description 根据文件ID删除文件（包括记录和实际文件）服务
 * @param {string} fileId - 文件ID
 * @returns {Promise<boolean>} 删除成功则为 true
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function deleteFile(fileId) {
  try {
    // 后端控制器期望直接接收 id 字符串作为参数
    const result = await ipc.invoke(apiRoutes.deleteFile, fileId);
    if (result && result.success) {
      return true; // 后端控制器直接返回 { success: true }
    } else {
      const errorMessage = result ? result.message : '删除文件失败';
      console.error('deleteFile service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteFile} with id ${fileId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getFilePath
 * @description 根据文件ID获取文件在服务器上的绝对路径服务
 * @param {string} fileId - 文件ID
 * @returns {Promise<string>} 文件的绝对路径
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function getFilePath(fileId) {
  try {
    // 后端控制器期望直接接收 id 字符串作为参数
    const result = await ipc.invoke(apiRoutes.getFilePath, fileId);
    if (result && result.success) { // 假设成功时 data 包含路径
      return result.data;
    } else {
      // 如果后端不遵循 {success, data, message} 结构，且直接返回路径或错误
      // 此处需要根据实际返回调整
      // 假设 getFilePath 成功时，result.data 是路径字符串；失败时 result.success 是 false
      const errorMessage = result ? result.message : '获取文件路径失败';
      console.error('getFilePath service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getFilePath} with id ${fileId} failed:`, error);
    throw error;
  }
} 