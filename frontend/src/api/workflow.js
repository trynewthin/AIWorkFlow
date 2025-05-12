/**
 * @file frontend/src/api/workflow.js
 * @description 工作流 API 封装
 */
import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 创建工作流
 * @param {string} name - 工作流名称 
 * @param {string} [description] - 工作流描述
 * @param {Object} [config] - 工作流配置
 * @returns {Promise<Object>} 创建的工作流对象
 */
export function createWorkflow(name, description = '', config = {}) {
  return ipc.invoke(ipcApiRoute.createWorkflow, { name, description, config });
}

/**
 * 获取工作流信息
 * @param {string} id - 工作流 ID
 * @returns {Promise<Object>} 工作流对象
 */
export function getWorkflow(id) {
  return ipc.invoke(ipcApiRoute.getWorkflow, { id });
}

/**
 * 获取工作流列表
 * @returns {Promise<Array<Object>>} 工作流列表 
 */
export function listWorkflows() {
  return ipc.invoke(ipcApiRoute.listWorkflows, {});
}

/**
 * 更新工作流信息
 * @param {string} id - 工作流 ID
 * @param {string} [name] - 工作流名称
 * @param {string} [description] - 工作流描述
 * @param {Object} [config] - 工作流配置
 * @returns {Promise<boolean>} 是否更新成功
 */
export function updateWorkflow(id, name, description, config) {
  const data = { id };
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (config !== undefined) data.config = config;
  
  return ipc.invoke(ipcApiRoute.updateWorkflow, data);
}

/**
 * 删除工作流
 * @param {string} id - 工作流 ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export function deleteWorkflow(id) {
  return ipc.invoke(ipcApiRoute.deleteWorkflow, { id });
}

/**
 * 添加节点到工作流
 * @param {string} workflowId - 工作流 ID
 * @param {string} nodeType - 节点类型
 * @param {Object} [flowConfig] - 流程级配置
 * @param {Object} [workConfig] - 运行时配置
 * @param {number} [index] - 插入位置
 * @returns {Promise<{nodeId: string}>} 创建的节点 ID
 */
export function addNode(workflowId, nodeType, flowConfig, workConfig, index) {
  return ipc.invoke(ipcApiRoute.addNode, { 
    workflowId, 
    nodeType, 
    flowConfig, 
    workConfig, 
    index 
  });
}

/**
 * 更新节点配置
 * @param {string} nodeId - 节点 ID
 * @param {Object} [flowConfig] - 流程级配置
 * @param {Object} [workConfig] - 运行时配置
 * @returns {Promise<boolean>} 是否更新成功
 */
export function updateNode(nodeId, flowConfig, workConfig) {
  return ipc.invoke(ipcApiRoute.updateNode, { 
    nodeId, 
    flowConfig, 
    workConfig 
  });
}

/**
 * 删除节点
 * @param {string} nodeId - 节点 ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export function deleteNode(nodeId) {
  return ipc.invoke(ipcApiRoute.deleteNode, { nodeId });
}

/**
 * 移动节点位置
 * @param {string} nodeId - 节点 ID
 * @param {number} newIndex - 新位置索引
 * @returns {Promise<boolean>} 是否移动成功
 */
export function moveNode(nodeId, newIndex) {
  return ipc.invoke(ipcApiRoute.moveNode, { nodeId, newIndex });
}

/**
 * 获取可用节点类型列表
 * @returns {Promise<Array<string>>} 节点类型列表
 */
export function getNodeTypes() {
  return ipc.invoke(ipcApiRoute.getNodeTypes, {});
}

/**
 * 执行工作流
 * @param {string} workflowId - 工作流 ID
 * @param {Object} input - 输入数据
 * @param {Object} [options] - 执行选项
 * @returns {Promise<Object>} 执行结果
 */
export function executeWorkflow(workflowId, input, options = {}) {
  return ipc.invoke(ipcApiRoute.executeWorkflow, { 
    workflowId, 
    input, 
    options 
  });
}

/**
 * 获取节点配置信息
 * @param {string} nodeType - 节点类型
 * @returns {Promise<Object>} 节点配置
 */
export function getNodeConfigByType(nodeType) {
  return ipc.invoke(ipcApiRoute.getNodeConfigByType, { nodeType });
}

/**
 * 获取节点默认流程配置
 * @param {string} nodeType - 节点类型
 * @returns {Promise<Object>} 默认流程配置
 */
export function getDefaultFlowConfig(nodeType) {
  return ipc.invoke(ipcApiRoute.getDefaultFlowConfig, { nodeType });
}

/**
 * 获取节点默认运行时配置
 * @param {string} nodeType - 节点类型
 * @returns {Promise<Object>} 默认运行时配置
 */
export function getDefaultWorkConfig(nodeType) {
  return ipc.invoke(ipcApiRoute.getDefaultWorkConfig, { nodeType });
} 