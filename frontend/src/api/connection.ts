import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 连接检查响应类型
 */
export interface ConnectionResponse {
  success: boolean;
  message: string;
  timestamp?: number;
}

/**
 * 检查与后端的连接是否成功
 * @returns {Promise<ConnectionResponse>} 连接结果
 */
export const checkConnection = async (): Promise<ConnectionResponse> => {
  try {
    const result = await ipc?.invoke(ipcApiRoute.checkConnection);
    return result as ConnectionResponse;
  } catch (error) {
    console.error('连接检查失败:', error);
    throw error;
  }
}; 