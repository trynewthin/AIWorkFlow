import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';
import { NodeConfig, FlowConfig, WorkConfig } from '../api/config';
import { adaptApiResponse } from '../utils/apiAdapter';


/**
 * @async
 * @function getConfigNodeTypes
 * @description 获取所有配置的节点类型名称列表 (对应后端 CoreConfigsController.getNodeTypes)
 * @returns {Promise<Array<string>>} 节点类型名称列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getConfigNodeTypes(): Promise<string[]> {
  try {
    // 注意：前端API路由为 getConfigNodeTypes，后端控制器方法为 getNodeTypes
    const result = await ipc?.invoke(apiRoutes.getConfigNodeTypes);
    const adaptedResult = adaptApiResponse<string[]>(result, '获取配置节点类型列表失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data || [];
    } else {
      console.error('getConfigNodeTypes service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getConfigNodeTypes} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getNodeConfigByType
 * @description 根据节点类型名称获取节点的类级别配置信息
 * @param {string} nodeType - 节点类型名称 (通常是驼峰式，如 'ChatNode')
 * @returns {Promise<NodeConfig>} 节点的类配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getNodeConfigByType(nodeType: string): Promise<NodeConfig> {
  try {
    const result = await ipc?.invoke(apiRoutes.getNodeConfigByType, { nodeType });
    const adaptedResult = adaptApiResponse<NodeConfig>(result, '获取节点类配置失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data as NodeConfig;
    } else {
      console.error('getNodeConfigByType service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getNodeConfigByType} for type ${nodeType} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getDefaultFlowConfig
 * @description 根据节点类型名称获取节点的默认流程配置
 * @param {string} nodeType - 节点类型名称
 * @returns {Promise<FlowConfig>} 节点的默认流程配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getDefaultFlowConfig(nodeType: string): Promise<FlowConfig> {
  try {
    const result = await ipc?.invoke(apiRoutes.getDefaultFlowConfig, { nodeType });
    const adaptedResult = adaptApiResponse<FlowConfig>(result, '获取默认流程配置失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data as FlowConfig;
    } else {
      console.error('getDefaultFlowConfig service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getDefaultFlowConfig} for type ${nodeType} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getDefaultWorkConfig
 * @description 根据节点类型名称获取节点的默认运行时配置
 * @param {string} nodeType - 节点类型名称
 * @returns {Promise<WorkConfig>} 节点的默认运行时配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getDefaultWorkConfig(nodeType: string): Promise<WorkConfig> {
  try {
    const result = await ipc?.invoke(apiRoutes.getDefaultWorkConfig, { nodeType });
    const adaptedResult = adaptApiResponse<WorkConfig>(result, '获取默认运行时配置失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data as WorkConfig;
    } else {
      console.error('getDefaultWorkConfig service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getDefaultWorkConfig} for type ${nodeType} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getAllPipelineTypes
 * @description 获取系统中所有支持的管道类型列表
 * @returns {Promise<string[]>} 管道类型名称列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getAllPipelineTypes(): Promise<string[]> {
  try {
    const result = await ipc?.invoke(apiRoutes.getAllPipelineTypes);
    const adaptedResult = adaptApiResponse<string[]>(result, '获取管道类型列表失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data || [];
    } else {
      console.error('getAllPipelineTypes service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getAllPipelineTypes} failed:`, error);
    throw error;
  }
} 