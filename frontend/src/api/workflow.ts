/**
 * @file frontend/src/api/workflow.ts
 * @description 工作流 API 封装
 */
import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';
import { NodeConfig, FlowConfig, WorkConfig } from './config';
import { User } from './user';

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 工作流接口
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status?: string;
  ownerId?: number;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  nodesCount?: number;
  config?: Record<string, any>;
  nodes?: WorkflowNode[];
}

/**
 * 工作流节点接口
 */
export interface WorkflowNode {
  id: string;
  workflowId: string;
  nodeType: string;
  index: number;
  flowConfig: FlowConfig;
  workConfig: WorkConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * 工作流执行选项接口
 */
export interface ExecuteOptions {
  debug?: boolean;
  timeout?: number;
  startNodeId?: string;
  endNodeId?: string;
}

/**
 * 工作流执行结果接口
 */
export interface ExecuteResult {
  workflowId: string;
  success: boolean;
  data: any;
  logs?: string[];
  executionTime?: number;
  nodesExecuted?: number;
}

/**
 * 工作流所有权信息接口
 */
export interface OwnershipInfo {
  isOwner: boolean;
  canEdit: boolean;
  canExecute: boolean;
  owner?: User;
}

/**
 * 创建工作流
 * @param {string} name - 工作流名称 
 * @param {string} [description] - 工作流描述
 * @param {Record<string, any>} [config] - 工作流配置
 * @returns {Promise<ApiResponse<Workflow>>} 创建的工作流对象
 */
export function createWorkflow(
  name: string, 
  description: string = '', 
  config: Record<string, any> = {}
): Promise<ApiResponse<Workflow>> {
  return ipc?.invoke(ipcApiRoute.createWorkflow, { name, description, config });
}

/**
 * 获取工作流信息
 * @param {string} id - 工作流 ID
 * @returns {Promise<ApiResponse<Workflow>>} 工作流对象
 */
export function getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
  return ipc?.invoke(ipcApiRoute.getWorkflow, { id });
}

/**
 * 获取工作流列表
 * @returns {Promise<ApiResponse<Workflow[]>>} 工作流列表 
 */
export function listWorkflows(): Promise<ApiResponse<Workflow[]>> {
  return ipc?.invoke(ipcApiRoute.listWorkflows, {});
}

/**
 * 更新工作流信息
 * @param {string} id - 工作流 ID
 * @param {string} [name] - 工作流名称
 * @param {string} [description] - 工作流描述
 * @param {Record<string, any>} [config] - 工作流配置
 * @returns {Promise<ApiResponse<boolean>>} 是否更新成功
 */
export function updateWorkflow(
  id: string, 
  name?: string, 
  description?: string, 
  config?: Record<string, any>
): Promise<ApiResponse<boolean>> {
  const data: any = { id };
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (config !== undefined) data.config = config;
  
  return ipc?.invoke(ipcApiRoute.updateWorkflow, data);
}

/**
 * 删除工作流
 * @param {string} id - 工作流 ID
 * @returns {Promise<ApiResponse<boolean>>} 是否删除成功
 */
export function deleteWorkflow(id: string): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.deleteWorkflow, { id });
}

/**
 * 添加节点到工作流
 * @param {string} workflowId - 工作流 ID
 * @param {string} nodeType - 节点类型
 * @param {FlowConfig} [flowConfig] - 流程级配置
 * @param {WorkConfig} [workConfig] - 运行时配置
 * @param {number} [index] - 插入位置
 * @returns {Promise<ApiResponse<{nodeId: string}>>} 创建的节点 ID
 */
export function addNode(
  workflowId: string, 
  nodeType: string, 
  flowConfig?: FlowConfig, 
  workConfig?: WorkConfig, 
  index?: number
): Promise<ApiResponse<{nodeId: string}>> {
  return ipc?.invoke(ipcApiRoute.addNode, { 
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
 * @param {FlowConfig} [flowConfig] - 流程级配置
 * @param {WorkConfig} [workConfig] - 运行时配置
 * @returns {Promise<ApiResponse<boolean>>} 是否更新成功
 */
export function updateNode(
  nodeId: string, 
  flowConfig?: FlowConfig, 
  workConfig?: WorkConfig
): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.updateNode, { 
    nodeId, 
    flowConfig, 
    workConfig 
  });
}

/**
 * 删除节点
 * @param {string} nodeId - 节点 ID
 * @returns {Promise<ApiResponse<boolean>>} 是否删除成功
 */
export function deleteNode(nodeId: string): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.deleteNode, { nodeId });
}

/**
 * 移动节点位置
 * @param {string} nodeId - 节点 ID
 * @param {number} newIndex - 新位置索引
 * @returns {Promise<ApiResponse<boolean>>} 是否移动成功
 */
export function moveNode(nodeId: string, newIndex: number): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.moveNode, { nodeId, newIndex });
}

/**
 * 获取可用节点类型列表
 * @returns {Promise<ApiResponse<string[]>>} 节点类型列表
 */
export function getNodeTypes(): Promise<ApiResponse<string[]>> {
  return ipc?.invoke(ipcApiRoute.getNodeTypes, {});
}

/**
 * 执行工作流
 * @param {string} workflowId - 工作流 ID
 * @param {any} input - 输入数据
 * @param {ExecuteOptions} [options] - 执行选项
 * @returns {Promise<ApiResponse<ExecuteResult>>} 执行结果
 */
export function executeWorkflow(
  workflowId: string, 
  input: any, 
  options: ExecuteOptions = {}
): Promise<ApiResponse<ExecuteResult>> {
  return ipc?.invoke(ipcApiRoute.executeWorkflow, { 
    workflowId, 
    input, 
    options 
  });
}

/**
 * 获取节点配置信息
 * @param {string} nodeType - 节点类型
 * @returns {Promise<ApiResponse<NodeConfig>>} 节点配置
 */
export function getNodeConfigByType(nodeType: string): Promise<ApiResponse<NodeConfig>> {
  return ipc?.invoke(ipcApiRoute.getNodeConfigByType, { nodeType });
}

/**
 * 获取节点默认流程配置
 * @param {string} nodeType - 节点类型
 * @returns {Promise<ApiResponse<FlowConfig>>} 默认流程配置
 */
export function getDefaultFlowConfig(nodeType: string): Promise<ApiResponse<FlowConfig>> {
  return ipc?.invoke(ipcApiRoute.getDefaultFlowConfig, { nodeType });
}

/**
 * 获取节点默认运行时配置
 * @param {string} nodeType - 节点类型
 * @returns {Promise<ApiResponse<WorkConfig>>} 默认运行时配置
 */
export function getDefaultWorkConfig(nodeType: string): Promise<ApiResponse<WorkConfig>> {
  return ipc?.invoke(ipcApiRoute.getDefaultWorkConfig, { nodeType });
}

/**
 * 获取当前用户的工作流列表
 * @returns {Promise<ApiResponse<Workflow[]>>} 当前用户的工作流列表
 */
export function getCurrentUserWorkflows(): Promise<ApiResponse<Workflow[]>> {
  return ipc?.invoke(ipcApiRoute.getCurrentUserWorkflows, {});
}

/**
 * 检查工作流所有权
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<ApiResponse<OwnershipInfo>>} 所有权信息
 */
export function checkWorkflowOwnership(workflowId: string): Promise<ApiResponse<OwnershipInfo>> {
  return ipc?.invoke(ipcApiRoute.checkWorkflowOwnership, { workflowId });
}

/**
 * 转移工作流所有权
 * @param {string} workflowId - 工作流ID
 * @param {number} newUserId - 新所有者ID
 * @returns {Promise<ApiResponse<boolean>>} 转移结果
 */
export function transferWorkflowOwnership(
  workflowId: string, 
  newUserId: number
): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.transferWorkflowOwnership, { workflowId, newUserId });
}

/**
 * 获取工作流所有者信息
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<ApiResponse<User>>} 所有者信息
 */
export function getWorkflowOwner(workflowId: string): Promise<ApiResponse<User>> {
  return ipc?.invoke(ipcApiRoute.getWorkflowOwner, { workflowId });
} 