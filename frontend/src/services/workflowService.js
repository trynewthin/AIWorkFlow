import { ipc } from '../utils/ipcRenderer';
import apiRoutes from '../api/ipcApiRoute';

/**
 * @async
 * @function createWorkflow
 * @description 创建新的工作流
 * @param {{ name: string, description?: string, config?: object }} workflowDetails - 工作流详情
 * @returns {Promise<object>} 创建成功后的工作流对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function createWorkflow(workflowDetails) {
  try {
    const result = await ipc.invoke(apiRoutes.createWorkflow, workflowDetails);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '创建工作流失败';
      console.error('createWorkflow service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
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
 * @returns {Promise<object>} 工作流对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflow(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.getWorkflow, { id: workflowId });
    if (result && result.success) {
      return result.data;
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
 * @returns {Promise<Array<object>>} 工作流对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function listWorkflows() {
  try {
    const result = await ipc.invoke(apiRoutes.listWorkflows);
    if (result && result.success) {
      return result.data;
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
 * @param {{ name?: string, description?: string, config?: object }} updates - 需要更新的字段
 * @returns {Promise<boolean>} 更新成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function updateWorkflow(workflowId, updates) {
  try {
    const result = await ipc.invoke(apiRoutes.updateWorkflow, { id: workflowId, ...updates });
    if (result && result.success) {
      return result.data; // 通常是 true
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
export async function deleteWorkflow(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.deleteWorkflow, { id: workflowId });
    if (result && result.success) {
      return result.data; // 通常是 true
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
 * @param {{ workflowId: string, nodeType: string, index?: number }} nodeDetails - 节点详情
 *                 (flowConfig 和 workConfig 将由后端根据 nodeType 使用默认值)
 * @returns {Promise<object>} 包含新节点ID的对象, e.g., { nodeId: 'some-id' }
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function addNode(nodeDetails) {
  try {
    // 后端控制器会使用 nodeType 的默认 flowConfig 和 workConfig
    const result = await ipc.invoke(apiRoutes.addNode, nodeDetails);
    if (result && result.success) {
      return result.data;
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
 * @param {{ flowConfig?: object, workConfig?: object }} configs - 节点的流程配置或工作配置
 * @returns {Promise<boolean>} 更新成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function updateNode(nodeId, configs) {
  try {
    const result = await ipc.invoke(apiRoutes.updateNode, { nodeId, ...configs });
    if (result && result.success) {
      return result.data; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '更新节点失败';
      console.error('updateNode service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
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
export async function deleteNode(nodeId) {
  try {
    const result = await ipc.invoke(apiRoutes.deleteNode, { nodeId });
    if (result && result.success) {
      return result.data; // 通常是 true
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
export async function moveNode(nodeId, newIndex) {
  try {
    const result = await ipc.invoke(apiRoutes.moveNode, { nodeId, newIndex });
    if (result && result.success) {
      return result.data; // 通常是 true
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
 * @returns {Promise<Array<string>>} 节点类型字符串列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getNodeTypes() {
  try {
    const result = await ipc.invoke(apiRoutes.getNodeTypes);
    if (result && result.success) {
      return result.data;
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
 * @param {object} input - 工作流执行所需的输入数据（e.g., { text: '...' }）
 * @param {object} [options] - 可选的执行选项，如 { debug: boolean, timeout: number }
 * @returns {Promise<any>} 工作流执行结果
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function executeWorkflow(workflowId, input = {}, options = {}) {
  try {
    // 将参数名调整为后端控制器期望的字段名 input 和 options
    const result = await ipc.invoke(apiRoutes.executeWorkflow, { workflowId, input, options });
    if (result && result.success) {
      return result.data;
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