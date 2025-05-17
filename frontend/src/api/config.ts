import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 节点静态配置接口
 */
export interface NodeConfig {
  id: string;
  name: string;
  type: string;
  tag: string;
  description: string;
  version: string;
  supportedInputPipelines: string[];
  supportedOutputPipelines: string[];
}

/**
 * 节点流程配置接口
 */
export interface FlowConfig {
  nodeName: string;
  status: string;
  position?: { x: number; y: number };
  [key: string]: any;
}

/**
 * 节点运行时配置接口
 */
export interface WorkConfig {
  [key: string]: any;
}

/**
 * 配置相关 API
 */

/**
 * 获取所有可用节点类型名称列表
 * @returns {Promise<string[]>} 节点类型名称列表
 */
export const getNodeTypes = async (): Promise<string[]> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getConfigNodeTypes);
    return res as string[];
  } catch (error) {
    console.error('获取节点类型列表失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取节点静态配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<NodeConfig>} 节点静态配置
 */
export const getNodeConfigByType = async (nodeType: string): Promise<NodeConfig> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getNodeConfigByType, { nodeType });
    return res as NodeConfig;
  } catch (error) {
    console.error('获取节点配置失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取默认流程配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<FlowConfig>} 默认流程配置
 */
export const getDefaultFlowConfig = async (nodeType: string): Promise<FlowConfig> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getDefaultFlowConfig, { nodeType });
    return res as FlowConfig;
  } catch (error) {
    console.error('获取默认流程配置失败:', error);
    throw error;
  }
};

/**
 * 根据节点类型名称获取默认运行时配置
 * @param {string} nodeType 节点类型名称 (例如 'StartNode')
 * @returns {Promise<WorkConfig>} 默认运行时配置
 */
export const getDefaultWorkConfig = async (nodeType: string): Promise<WorkConfig> => {
  try {
    const res = await ipc?.invoke(ipcApiRoute.getDefaultWorkConfig, { nodeType });
    return res as WorkConfig;
  } catch (error) {
    console.error('获取默认运行时配置失败:', error);
    throw error;
  }
}; 