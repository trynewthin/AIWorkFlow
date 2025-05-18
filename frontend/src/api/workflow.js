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

/**
 * 获取当前用户的工作流列表
 * @returns {Promise<Array<Object>>} 当前用户的工作流列表
 */
export function getCurrentUserWorkflows() {
  return ipc.invoke(ipcApiRoute.getCurrentUserWorkflows, {});
}

/**
 * 检查工作流所有权
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<Object>} 所有权信息，包含 isOwner 等字段
 */
export function checkWorkflowOwnership(workflowId) {
  return ipc.invoke(ipcApiRoute.checkWorkflowOwnership, { workflowId });
}

/**
 * 转移工作流所有权
 * @param {string} workflowId - 工作流ID
 * @param {number} newUserId - 新所有者ID
 * @returns {Promise<Object>} 转移结果
 */
export function transferWorkflowOwnership(workflowId, newUserId) {
  return ipc.invoke(ipcApiRoute.transferWorkflowOwnership, { workflowId, newUserId });
}

/**
 * 获取工作流所有者信息
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<Object>} 所有者信息
 */
export function getWorkflowOwner(workflowId) {
  return ipc.invoke(ipcApiRoute.getWorkflowOwner, { workflowId });
}

/**
 * 创建工作流对话轮次
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<{conversationId: string}>} 对话轮次ID
 */
export function createWorkflowConversation(workflowId) {
  return ipc.invoke(ipcApiRoute.createWorkflowConversation, { workflowId });
}

/**
 * 获取工作流当前关联的对话轮次
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<{conversationId: string}>} 对话轮次ID
 */
export function getWorkflowCurrentConversation(workflowId) {
  return ipc.invoke(ipcApiRoute.getWorkflowCurrentConversation, { workflowId });
}

/**
 * 获取工作流的所有对话轮次
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<Array<Object>>} 对话轮次列表
 */
export function getWorkflowConversations(workflowId) {
  return ipc.invoke(ipcApiRoute.getWorkflowConversations, { workflowId });
}

/**
 * 获取对话消息历史
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<Array<Object>>} 消息列表
 */
export function getConversationMessages(conversationId) {
  return ipc.invoke(ipcApiRoute.getConversationMessages, { conversationId });
}

/**
 * 添加用户消息到对话
 * @param {string} conversationId - 对话轮次ID
 * @param {string} content - 消息内容
 * @returns {Promise<{messageId: string}>} 消息ID
 */
export function addUserMessage(conversationId, content) {
  return ipc.invoke(ipcApiRoute.addUserMessage, { conversationId, content });
}

/**
 * 添加AI消息到对话
 * @param {string} conversationId - 对话轮次ID
 * @param {string} content - 消息内容
 * @returns {Promise<{messageId: string}>} 消息ID
 */
export function addAIMessage(conversationId, content) {
  return ipc.invoke(ipcApiRoute.addAIMessage, { conversationId, content });
}

/**
 * 删除对话轮次
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export function deleteConversation(conversationId) {
  return ipc.invoke(ipcApiRoute.deleteConversation, { conversationId });
}

/**
 * 获取对话统计信息
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<Object>} 统计信息对象
 */
export function getConversationStats(conversationId) {
  return ipc.invoke(ipcApiRoute.getConversationStats, { conversationId });
}

/**
 * 导出对话历史为JSON
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<string>} JSON格式的对话历史
 */
export function exportConversationAsJson(conversationId) {
  return ipc.invoke(ipcApiRoute.exportConversationAsJson, { conversationId });
}

/**
 * 执行工作流并记录对话（便捷方法）
 * @param {string} workflowId - 工作流ID
 * @param {Object} input - 输入数据
 * @param {string} [conversationId] - 可选的对话轮次ID，不提供则使用工作流当前对话或创建新对话
 * @param {boolean} [recordNodeExecution=false] - 是否记录节点执行过程
 * @returns {Promise<{result: Object, conversationId: string}>} 执行结果和使用的对话ID
 */
export function executeWorkflowWithConversation(workflowId, input, conversationId, recordNodeExecution = false) {
  return ipc.invoke(ipcApiRoute.executeWorkflowWithConversation, { 
    workflowId, 
    input, 
    conversationId,
    recordNodeExecution
  });
} 