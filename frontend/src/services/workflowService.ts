import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';
import { 
  Workflow, 
  ExecuteOptions, 
  ExecuteResult, 
  OwnershipInfo,
  ApiResponse
} from '../api/workflow';
import { FlowConfig, WorkConfig } from '../api/config';
import { User } from '../api/user';
import { adaptApiResponse } from '../utils/apiAdapter';

/**
 * 创建工作流参数接口
 */
interface CreateWorkflowParams {
  name: string;
  description?: string;
  config?: Record<string, any>;
}

/**
 * 更新节点参数接口
 */
interface UpdateNodeParams {
  flowConfig?: FlowConfig;
  workConfig?: WorkConfig;
}

/**
 * 添加节点参数接口
 */
interface AddNodeParams {
  workflowId: string;
  nodeType: string;
  flowConfig?: FlowConfig;
  workConfig?: WorkConfig;
  index?: number;
}

/**
 * @async
 * @function createWorkflow
 * @description 创建新的工作流
 * @param {CreateWorkflowParams} workflowDetails - 工作流详情
 * @returns {Promise<Workflow>} 创建成功后的工作流对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function createWorkflow(workflowDetails: CreateWorkflowParams): Promise<Workflow> {
  try {
    const result = await ipc?.invoke(apiRoutes.createWorkflow, workflowDetails);
    const adaptedResult = adaptApiResponse<Workflow>(result, '创建工作流失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data as Workflow;
    } else {
      console.error('createWorkflow service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.createWorkflow} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getWorkflow
 * @description 根据ID获取工作流详情
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<Workflow>} 工作流对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflow(workflowId: string): Promise<Workflow> {
  try {
    const result = await ipc?.invoke(apiRoutes.getWorkflow, { id: workflowId }) as ApiResponse<Workflow>;
    if (result && result.success) {
      return result.data as Workflow;
    } else {
      const errorMessage = result ? result.message : '获取工作流失败';
      console.error('getWorkflow service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getWorkflow} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function listWorkflows
 * @description 获取所有工作流列表
 * @returns {Promise<Workflow[]>} 工作流对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function listWorkflows(): Promise<Workflow[]> {
  try {
    const result = await ipc?.invoke(apiRoutes.listWorkflows) as ApiResponse<Workflow[]>;
    if (result && result.success) {
      return result.data as Workflow[];
    } else {
      const errorMessage = result ? result.message : '获取工作流列表失败';
      console.error('listWorkflows service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.listWorkflows} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function updateWorkflow
 * @description 更新指定ID的工作流
 * @param {string} workflowId - 要更新的工作流ID
 * @param {Partial<CreateWorkflowParams>} updates - 需要更新的字段
 * @returns {Promise<boolean>} 更新成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function updateWorkflow(
  workflowId: string, 
  updates: Partial<CreateWorkflowParams>
): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.updateWorkflow, { id: workflowId, ...updates }) as ApiResponse<boolean>;
    if (result && result.success) {
      return result.data as boolean; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '更新工作流失败';
      console.error('updateWorkflow service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.updateWorkflow} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function deleteWorkflow
 * @description 删除指定ID的工作流
 * @param {string} workflowId - 要删除的工作流ID
 * @returns {Promise<boolean>} 删除成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function deleteWorkflow(workflowId: string): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.deleteWorkflow, { id: workflowId }) as ApiResponse<boolean>;
    if (result && result.success) {
      return result.data as boolean; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '删除工作流失败';
      console.error('deleteWorkflow service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteWorkflow} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function addNode
 * @description向指定工作流添加新节点
 * @param {AddNodeParams} nodeDetails - 节点详情
 * @returns {Promise<{nodeId: string}>} 包含新节点ID的对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function addNode(nodeDetails: AddNodeParams): Promise<{nodeId: string}> {
  try {
    // 后端控制器会使用 nodeType 的默认 flowConfig 和 workConfig
    const result = await ipc?.invoke(apiRoutes.addNode, nodeDetails) as ApiResponse<{nodeId: string}>;
    if (result && result.success) {
      return result.data as {nodeId: string};
    } else {
      const errorMessage = result ? result.message : '添加节点失败';
      console.error('addNode service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.addNode} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function updateNode
 * @description 更新指定ID的节点配置
 * @param {string} nodeId - 要更新的节点ID
 * @param {UpdateNodeParams} configs - 节点的流程配置或工作配置
 * @returns {Promise<boolean>} 更新成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function updateNode(nodeId: string, configs: UpdateNodeParams): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.updateNode, { nodeId, ...configs });
    const adaptedResult = adaptApiResponse<boolean>(result, '更新节点失败');
    
    if (adaptedResult.success) {
      return adaptedResult.data as boolean; // 通常是 true
    } else {
      console.error('updateNode service error:', adaptedResult.message, 'Raw result:', result);
      throw new Error(adaptedResult.message);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.updateNode} for id ${nodeId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function deleteNode
 * @description 删除指定ID的节点
 * @param {string} nodeId - 要删除的节点ID
 * @returns {Promise<boolean>} 删除成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function deleteNode(nodeId: string): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.deleteNode, { nodeId }) as ApiResponse<boolean>;
    if (result && result.success) {
      return result.data as boolean; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '删除节点失败';
      console.error('deleteNode service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteNode} for id ${nodeId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function moveNode
 * @description 移动节点到新的位置
 * @param {string} nodeId - 要移动的节点ID
 * @param {number} newIndex - 节点在工作流中的新索引（从0开始）
 * @returns {Promise<boolean>} 移动成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function moveNode(nodeId: string, newIndex: number): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.moveNode, { nodeId, newIndex }) as ApiResponse<boolean>;
    if (result && result.success) {
      return result.data as boolean; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '移动节点失败';
      console.error('moveNode service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.moveNode} for id ${nodeId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getNodeTypes
 * @description 获取所有可用的节点类型列表
 * @returns {Promise<string[]>} 节点类型字符串列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getNodeTypes(): Promise<string[]> {
  try {
    const result = await ipc?.invoke(apiRoutes.getNodeTypes) as ApiResponse<string[]>;
    if (result && result.success) {
      return result.data as string[];
    } else {
      const errorMessage = result ? result.message : '获取节点类型列表失败';
      console.error('getNodeTypes service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getNodeTypes} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function executeWorkflow
 * @description 执行指定ID的工作流
 * @param {string} workflowId - 要执行的工作流ID
 * @param {any} input - 工作流执行所需的输入数据（e.g., { text: '...' }）
 * @param {ExecuteOptions} [options] - 可选的执行选项，如 { debug: boolean, timeout: number }
 * @returns {Promise<ExecuteResult>} 工作流执行结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function executeWorkflow(
  workflowId: string, 
  input: any = {}, 
  options: ExecuteOptions = {}
): Promise<ExecuteResult> {
  try {
    // 将参数名调整为后端控制器期望的字段名 input 和 options
    const result = await ipc?.invoke(apiRoutes.executeWorkflow, { workflowId, input, options }) as ApiResponse<ExecuteResult>;
    if (result && result.success) {
      return result.data as ExecuteResult;
    } else {
      const errorMessage = result ? result.message : '执行工作流失败';
      console.error('executeWorkflow service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.executeWorkflow} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getCurrentUserWorkflows
 * @description 获取当前登录用户的工作流列表
 * @returns {Promise<Workflow[]>} 当前用户的工作流对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getCurrentUserWorkflows(): Promise<Workflow[]> {
  try {
    const result = await ipc?.invoke(apiRoutes.getCurrentUserWorkflows) as ApiResponse<Workflow[]>;
    if (result && result.success) {
      return result.data as Workflow[];
    } else {
      const errorMessage = result ? result.message : '获取当前用户工作流列表失败';
      console.error('getCurrentUserWorkflows service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getCurrentUserWorkflows} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function checkWorkflowOwnership
 * @description 检查当前用户是否为工作流所有者
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<OwnershipInfo>} 包含所有权信息的对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function checkWorkflowOwnership(workflowId: string): Promise<OwnershipInfo> {
  try {
    const result = await ipc?.invoke(apiRoutes.checkWorkflowOwnership, { workflowId }) as ApiResponse<OwnershipInfo>;
    if (result && result.success) {
      return result.data as OwnershipInfo;
    } else {
      const errorMessage = result ? result.message : '检查工作流所有权失败';
      console.error('checkWorkflowOwnership service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.checkWorkflowOwnership} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function transferWorkflowOwnership
 * @description 转移工作流所有权到其他用户
 * @param {string} workflowId - 工作流ID
 * @param {number} newUserId - 新所有者用户ID
 * @returns {Promise<boolean>} 转移成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function transferWorkflowOwnership(workflowId: string, newUserId: number): Promise<boolean> {
  try {
    const result = await ipc?.invoke(apiRoutes.transferWorkflowOwnership, { workflowId, newUserId }) as ApiResponse<boolean>;
    if (result && result.success) {
      return result.data as boolean;
    } else {
      const errorMessage = result ? result.message : '转移工作流所有权失败';
      console.error('transferWorkflowOwnership service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.transferWorkflowOwnership} for id ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getWorkflowOwner
 * @description 获取工作流所有者信息
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<User>} 所有者用户信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflowOwner(workflowId: string): Promise<User> {
  try {
    const result = await ipc?.invoke(apiRoutes.getWorkflowOwner, { workflowId }) as ApiResponse<User>;
    if (result && result.success) {
      return result.data as User;
    } else {
      const errorMessage = result ? result.message : '获取工作流所有者信息失败';
      console.error('getWorkflowOwner service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getWorkflowOwner} for id ${workflowId} failed:`, error);
    throw error;
  }
} 