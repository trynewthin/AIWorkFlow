import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 检查与后端的连接是否成功
 * @returns {Promise<any>} 连接结果
 */
export const checkConnection = async () => {
  try {
    const result = await ipc.invoke(ipcApiRoute.checkConnection);
    return result;
  } catch (error) {
    console.error('连接检查失败:', error);
    throw error;
  }
}; 