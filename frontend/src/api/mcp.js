import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * MCP服务相关 API
 */

/**
 * 初始化MCP集成
 * @param {object} options 初始化选项
 * @returns {Promise<any>} 初始化结果
 */
export const initializeMCP = async (options = {}) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpInitialize, options);
    return res;
  } catch (error) {
    console.error('初始化MCP失败:', error);
    throw error;
  }
};

/**
 * 启动MCP服务
 * @param {number} port 端口号
 * @param {string} host 主机地址
 * @returns {Promise<any>} 启动结果
 */
export const startMCPService = async (port = 3000, host = 'localhost') => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpStartService, port, host);
    return res;
  } catch (error) {
    console.error('启动MCP服务失败:', error);
    throw error;
  }
};

/**
 * 停止MCP服务
 * @returns {Promise<any>} 停止结果
 */
export const stopMCPService = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpStopService);
    return res;
  } catch (error) {
    console.error('停止MCP服务失败:', error);
    throw error;
  }
};

/**
 * 重启MCP服务
 * @param {number} port 端口号
 * @param {string} host 主机地址
 * @returns {Promise<any>} 重启结果
 */
export const restartMCPService = async (port, host) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpRestartService, port, host);
    return res;
  } catch (error) {
    console.error('重启MCP服务失败:', error);
    throw error;
  }
};

/**
 * 获取MCP服务状态
 * @returns {Promise<any>} 服务状态
 */
export const getMCPServiceStatus = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpGetServiceStatus);
    return res;
  } catch (error) {
    console.error('获取MCP服务状态失败:', error);
    throw error;
  }
};

/**
 * 获取可用模块列表
 * @returns {Promise<any>} 模块列表
 */
export const getAvailableModules = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpGetAvailableModules);
    return res;
  } catch (error) {
    console.error('获取可用模块失败:', error);
    throw error;
  }
};

/**
 * 切换模块状态
 * @param {string} moduleName 模块名称
 * @param {boolean} enabled 是否启用
 * @returns {Promise<any>} 切换结果
 */
export const toggleModule = async (moduleName, enabled) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpToggleModule, moduleName, enabled);
    return res;
  } catch (error) {
    console.error('切换模块状态失败:', error);
    throw error;
  }
};

/**
 * 启用模块
 * @param {string} moduleName 模块名称
 * @returns {Promise<any>} 启用结果
 */
export const enableModule = async (moduleName) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpEnableModule, moduleName);
    return res;
  } catch (error) {
    console.error('启用模块失败:', error);
    throw error;
  }
};

/**
 * 禁用模块
 * @param {string} moduleName 模块名称
 * @returns {Promise<any>} 禁用结果
 */
export const disableModule = async (moduleName) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpDisableModule, moduleName);
    return res;
  } catch (error) {
    console.error('禁用模块失败:', error);
    throw error;
  }
};

/**
 * 获取Claude Desktop配置
 * @returns {Promise<any>} Claude配置
 */
export const getClaudeConfig = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpGetClaudeConfig);
    return res;
  } catch (error) {
    console.error('获取Claude配置失败:', error);
    throw error;
  }
};

/**
 * 检查MCP服务健康状态
 * @returns {Promise<any>} 健康状态
 */
export const checkHealth = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpCheckHealth);
    return res;
  } catch (error) {
    console.error('检查健康状态失败:', error);
    throw error;
  }
};

/**
 * 获取服务运行指标
 * @returns {Promise<any>} 服务指标
 */
export const getServiceMetrics = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.mcpGetServiceMetrics);
    return res;
  } catch (error) {
    console.error('获取服务指标失败:', error);
    throw error;
  }
}; 