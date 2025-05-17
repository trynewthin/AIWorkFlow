import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * @async
 * @function getConfigNodeTypes
 * @description 获取所有配置的节点类型名称列表 (对应后端 CoreConfigsController.getNodeTypes)
 * @returns {Promise<Array<string>>} 节点类型名称列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getConfigNodeTypes() {
  try {
    // 注意：前端API路由为 getConfigNodeTypes，后端控制器方法为 getNodeTypes
    const result = await ipc.invoke(apiRoutes.getConfigNodeTypes);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取配置节点类型列表失败';
      console.error('getConfigNodeTypes service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
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
 * @returns {Promise<object>} 节点的类配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getNodeConfigByType(nodeType) {
  try {
    const result = await ipc.invoke(apiRoutes.getNodeConfigByType, { nodeType });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取节点类配置失败';
      console.error('getNodeConfigByType service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
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
 * @returns {Promise<object>} 节点的默认流程配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getDefaultFlowConfig(nodeType) {
  try {
    const result = await ipc.invoke(apiRoutes.getDefaultFlowConfig, { nodeType });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取默认流程配置失败';
      console.error('getDefaultFlowConfig service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
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
 * @returns {Promise<object>} 节点的默认运行时配置对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getDefaultWorkConfig(nodeType) {
  try {
    const result = await ipc.invoke(apiRoutes.getDefaultWorkConfig, { nodeType });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取默认运行时配置失败';
      console.error('getDefaultWorkConfig service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getDefaultWorkConfig} for type ${nodeType} failed:`, error);
    throw error;
  }
} 