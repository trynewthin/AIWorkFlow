import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 配置相关 API
 */

/**
 * 获取所有可用节点类型名称列表
 * @returns {Promise<string[]>} 节点类型名称列表
 */
export const getNodeTypes = async () => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getConfigNodeTypes);
    return res;
  } catch (error) {
    console.error('获取节点类型列表失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取节点静态配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<object>} 节点静态配置
 */
export const getNodeConfigByType = async (nodeType) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getNodeConfigByType, { nodeType });
    return res;
  } catch (error) {
    console.error('获取节点配置失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取默认流程配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<object>} 默认流程配置
 */
export const getDefaultFlowConfig = async (nodeType) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getDefaultFlowConfig, { nodeType });
    return res;
  } catch (error) {
    console.error('获取默认流程配置失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取默认运行时配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<object>} 默认运行时配置
 */
export const getDefaultWorkConfig = async (nodeType) => {
  try {
    const res = await ipc.invoke(ipcApiRoute.getDefaultWorkConfig, { nodeType });
    return res;
  } catch (error) {
    console.error('获取默认运行时配置失败:', error);
    throw error;
  }
}; 