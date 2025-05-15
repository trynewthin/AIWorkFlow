import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * @async
 * @function checkConnection
 * @description 检查与后端的连接状态
 * @returns {Promise<any>} 后端返回的连接状态数据
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function checkConnection() {
  try {
    const result = await ipc.invoke(apiRoutes.checkConnection);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '连接检查失败';
      console.error('checkConnection service error:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.checkConnection} failed:`, error);
    throw error;
  }
} 