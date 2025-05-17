import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * 连接状态响应接口
 */
interface ConnectionResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    timestamp: number;
    version?: string;
  };
}

/**
 * 后端实际返回的连接状态响应格式
 */
interface BackendConnectionResponse {
  status: string;
  message: string;
  timestamp?: number;
  version?: string;
}

/**
 * @async
 * @function checkConnection
 * @description 检查与后端的连接状态
 * @returns {Promise<ConnectionResponse['data']>} 后端返回的连接状态数据
 * @throws {Error} IPC调用失败或后端返回错误时
 */
export async function checkConnection(): Promise<ConnectionResponse['data']> {
  try {
    const result = await ipc?.invoke(apiRoutes.checkConnection) as BackendConnectionResponse;
    // 适配后端响应结构到前端预期的结构
    const adaptedResult: ConnectionResponse = {
      success: result.status === 'success',
      message: result.message || '连接状态未知',
      data: {
        status: result.status,
        timestamp: result.timestamp || Date.now(),
        version: result.version
      }
    };
    
    if (adaptedResult.success) {
      return adaptedResult.data;
    } else {
      const errorMessage = adaptedResult.message;
      console.error('checkConnection service error:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.checkConnection} failed:`, error);
    throw error;
  }
} 