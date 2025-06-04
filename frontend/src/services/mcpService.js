import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from '../api/ipcApiRoute';

/**
 * @async
 * @function initializeMCP
 * @description 初始化MCP集成
 * @param {Object} options - 初始化选项
 * @returns {Promise<Object>} 初始化结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function initializeMCP(options = {}) {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpInitialize, options);
    if (result) {
      return result;
    } else {
      console.error('initializeMCP service error: Empty result');
      throw new Error('初始化MCP失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpInitialize} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function startMCPService
 * @description 启动MCP服务
 * @param {number} port - 端口号，默认3000
 * @param {string} host - 主机地址，默认localhost
 * @returns {Promise<Object>} 启动结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function startMCPService(port = 3000, host = 'localhost') {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpStartService, port, host);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '启动MCP服务失败');
      }
    } else {
      console.error('startMCPService service error: Empty result');
      throw new Error('启动MCP服务失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpStartService} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function stopMCPService
 * @description 停止MCP服务
 * @returns {Promise<Object>} 停止结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function stopMCPService() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpStopService);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '停止MCP服务失败');
      }
    } else {
      console.error('stopMCPService service error: Empty result');
      throw new Error('停止MCP服务失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpStopService} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function restartMCPService
 * @description 重启MCP服务
 * @param {number} port - 端口号
 * @param {string} host - 主机地址
 * @returns {Promise<Object>} 重启结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function restartMCPService(port, host) {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpRestartService, port, host);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '重启MCP服务失败');
      }
    } else {
      console.error('restartMCPService service error: Empty result');
      throw new Error('重启MCP服务失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpRestartService} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getMCPServiceStatus
 * @description 获取MCP服务状态
 * @returns {Promise<Object>} 服务状态信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getMCPServiceStatus() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpGetServiceStatus);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        // 返回实际数据，并添加status字段用于前端显示
        return {
          ...result.data,
          status: result.data.running ? 'running' : 'stopped',
          message: result.message
        };
      } else {
        throw new Error(result.error || result.message || '获取服务状态失败');
      }
    } else {
      console.error('getMCPServiceStatus service error: Empty result');
      throw new Error('获取MCP服务状态失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpGetServiceStatus} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getAvailableModules
 * @description 获取可用模块列表
 * @returns {Promise<Array<Object>>} 模块列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getAvailableModules() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpGetAvailableModules);
    if (result) {
      // 后端返回格式: {success: true, data: [...], message: "..."}
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.error || result.message || '获取可用模块失败');
      }
    } else {
      console.error('getAvailableModules service error: Empty result');
      throw new Error('获取可用模块失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpGetAvailableModules} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function toggleModule
 * @description 切换模块状态
 * @param {string} moduleName - 模块名称
 * @param {boolean} enabled - 是否启用
 * @returns {Promise<Object>} 切换结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function toggleModule(moduleName, enabled) {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpToggleModule, moduleName, enabled);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '切换模块状态失败');
      }
    } else {
      console.error('toggleModule service error: Empty result');
      throw new Error('切换模块状态失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpToggleModule} for module ${moduleName} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function enableModule
 * @description 启用模块
 * @param {string} moduleName - 模块名称
 * @returns {Promise<Object>} 启用结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function enableModule(moduleName) {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpEnableModule, moduleName);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '启用模块失败');
      }
    } else {
      console.error('enableModule service error: Empty result');
      throw new Error('启用模块失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpEnableModule} for module ${moduleName} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function disableModule
 * @description 禁用模块
 * @param {string} moduleName - 模块名称
 * @returns {Promise<Object>} 禁用结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function disableModule(moduleName) {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpDisableModule, moduleName);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '禁用模块失败');
      }
    } else {
      console.error('disableModule service error: Empty result');
      throw new Error('禁用模块失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpDisableModule} for module ${moduleName} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getClaudeConfig
 * @description 获取Claude Desktop配置
 * @returns {Promise<Object>} Claude配置信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getClaudeConfig() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpGetClaudeConfig);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '获取Claude配置失败');
      }
    } else {
      console.error('getClaudeConfig service error: Empty result');
      throw new Error('获取Claude配置失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpGetClaudeConfig} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function checkHealth
 * @description 检查MCP服务健康状态
 * @returns {Promise<Object>} 健康状态信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function checkHealth() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpCheckHealth);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return {
          ...result.data,
          status: result.data.healthy ? 'healthy' : 'error',
          message: result.message
        };
      } else {
        return {
          status: 'error',
          message: result.error || result.message || '健康检查失败',
          healthy: false
        };
      }
    } else {
      console.error('checkHealth service error: Empty result');
      throw new Error('检查健康状态失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpCheckHealth} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getServiceMetrics
 * @description 获取服务运行指标
 * @returns {Promise<Object>} 服务指标信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getServiceMetrics() {
  try {
    const result = await ipc.invoke(ipcApiRoute.mcpGetServiceMetrics);
    if (result) {
      // 后端返回格式: {success: true, data: {...}, message: "..."}
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || result.message || '获取服务指标失败');
      }
    } else {
      console.error('getServiceMetrics service error: Empty result');
      throw new Error('获取服务指标失败');
    }
  } catch (error) {
    console.error(`IPC call to ${ipcApiRoute.mcpGetServiceMetrics} failed:`, error);
    throw error;
  }
} 