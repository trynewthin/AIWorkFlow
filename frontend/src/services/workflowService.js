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
 * @param {object} [options] - 可选的执行选项
 * @param {boolean} [options.validateStartEnd=true] - 是否校验工作流首尾节点类型，true表示需要校验首节点为StartNode且尾节点为EndNode
 * @param {boolean} [options.failOnError] - 节点执行失败时是否终止整个工作流
 * @param {number} [options.timeout] - 执行超时时间（毫秒）
 * @param {number} [options.maxSteps] - 最大执行步数
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

/**
 * @async
 * @function getCurrentUserWorkflows
 * @description 获取当前登录用户的工作流列表
 * @returns {Promise<Array<object>>} 当前用户的工作流对象列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getCurrentUserWorkflows() {
  try {
    const result = await ipc.invoke(apiRoutes.getCurrentUserWorkflows);
    if (result && result.success) {
      return result.data;
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
 * @returns {Promise<{isOwner: boolean}>} 包含所有权信息的对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function checkWorkflowOwnership(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.checkWorkflowOwnership, { workflowId });
    if (result && result.success) {
      return result.data;
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
export async function transferWorkflowOwnership(workflowId, newUserId) {
  try {
    const result = await ipc.invoke(apiRoutes.transferWorkflowOwnership, { workflowId, newUserId });
    if (result && result.success) {
      return result.data;
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
 * @returns {Promise<object>} 所有者用户信息
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflowOwner(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.getWorkflowOwner, { workflowId });
    if (result && result.success) {
      return result.data;
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

/**
 * @async
 * @function createWorkflowConversation
 * @description 为工作流创建新的对话轮次
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<string>} 创建的对话轮次ID
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function createWorkflowConversation(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.createWorkflowConversation, { workflowId });
    if (result && result.success) {
      return result.data.conversationId;
    } else {
      const errorMessage = result ? result.message : '创建对话轮次失败';
      console.error('createWorkflowConversation service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.createWorkflowConversation} for workflow ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getWorkflowCurrentConversation
 * @description 获取工作流当前关联的对话轮次ID
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<string|null>} 对话轮次ID，若工作流未关联对话则返回null
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflowCurrentConversation(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.getWorkflowCurrentConversation, { workflowId });
    if (result && result.success) {
      return result.data.conversationId;
    } else if (result && result.code === 404) {
      // 工作流未关联对话轮次
      return null;
    } else {
      const errorMessage = result ? result.message : '获取当前对话轮次失败';
      console.error('getWorkflowCurrentConversation service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getWorkflowCurrentConversation} for workflow ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getWorkflowConversations
 * @description 获取工作流的所有对话轮次
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<Array<Object>>} 对话轮次列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getWorkflowConversations(workflowId) {
  try {
    const result = await ipc.invoke(apiRoutes.getWorkflowConversations, { workflowId });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取对话轮次列表失败';
      console.error('getWorkflowConversations service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getWorkflowConversations} for workflow ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getConversationMessages
 * @description 获取对话消息历史
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<Array<Object>>} 消息列表
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getConversationMessages(conversationId) {
  try {
    const result = await ipc.invoke(apiRoutes.getConversationMessages, { conversationId });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取对话消息失败';
      console.error('getConversationMessages service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getConversationMessages} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function addUserMessage
 * @description 添加用户消息到对话
 * @param {string} conversationId - 对话轮次ID
 * @param {string} content - 消息内容
 * @returns {Promise<string>} 消息ID
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function addUserMessage(conversationId, content) {
  try {
    const result = await ipc.invoke(apiRoutes.addUserMessage, { conversationId, content });
    if (result && result.success) {
      return result.data.messageId;
    } else {
      const errorMessage = result ? result.message : '添加用户消息失败';
      console.error('addUserMessage service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.addUserMessage} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function addAIMessage
 * @description 添加AI消息到对话
 * @param {string} conversationId - 对话轮次ID
 * @param {string} content - 消息内容
 * @returns {Promise<string>} 消息ID
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function addAIMessage(conversationId, content) {
  try {
    const result = await ipc.invoke(apiRoutes.addAIMessage, { conversationId, content });
    if (result && result.success) {
      return result.data.messageId;
    } else {
      const errorMessage = result ? result.message : '添加AI消息失败';
      console.error('addAIMessage service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.addAIMessage} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function deleteConversation
 * @description 删除对话轮次及其所有消息
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<boolean>} 删除成功则返回true
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function deleteConversation(conversationId) {
  try {
    const result = await ipc.invoke(apiRoutes.deleteConversation, { conversationId });
    if (result && result.success) {
      return result.data; // 通常是 true
    } else {
      const errorMessage = result ? result.message : '删除对话轮次失败';
      console.error('deleteConversation service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.deleteConversation} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getConversationStats
 * @description 获取对话统计信息
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<Object>} 统计信息对象
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getConversationStats(conversationId) {
  try {
    const result = await ipc.invoke(apiRoutes.getConversationStats, { conversationId });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '获取对话统计信息失败';
      console.error('getConversationStats service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.getConversationStats} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function exportConversationAsJson
 * @description 导出对话历史为JSON格式
 * @param {string} conversationId - 对话轮次ID
 * @returns {Promise<string>} JSON格式的对话历史
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function exportConversationAsJson(conversationId) {
  try {
    const result = await ipc.invoke(apiRoutes.exportConversationAsJson, { conversationId });
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '导出对话历史失败';
      console.error('exportConversationAsJson service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.exportConversationAsJson} for conversation ${conversationId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function executeWorkflowWithConversation
 * @description 执行工作流并记录对话
 * @param {string} workflowId - 工作流ID
 * @param {Object} input - 输入数据
 * @param {Object} options - 执行选项
 * @param {string} [options.conversationId] - 可选的对话轮次ID，不提供则使用工作流当前对话或创建新对话
 * @param {boolean} [options.recordNodeExecution=false] - 是否记录节点执行过程
 * @returns {Promise<{result: Object, conversationId: string}>} 执行结果和使用的对话ID
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function executeWorkflowWithConversation(workflowId, input, options = {}) {
  try {
    const { conversationId, recordNodeExecution = false } = options;
    
    const params = {
      workflowId,
      input,
      conversationId,
      recordNodeExecution
    };
    
    const result = await ipc.invoke(apiRoutes.executeWorkflowWithConversation, params);
    if (result && result.success) {
      return result.data;
    } else {
      const errorMessage = result ? result.message : '执行工作流并记录对话失败';
      console.error('executeWorkflowWithConversation service error:', errorMessage, 'Raw result:', result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`IPC call to ${apiRoutes.executeWorkflowWithConversation} for workflow ${workflowId} failed:`, error);
    throw error;
  }
}

/**
 * @async
 * @function getOrCreateConversation
 * @description 获取工作流当前对话，如果不存在则创建新对话
 * @param {string} workflowId - 工作流ID
 * @returns {Promise<string>} 对话轮次ID
 * @throws {Error} IPC调用失败或后端业务逻辑错误时
 */
export async function getOrCreateConversation(workflowId) {
  try {
    // 尝试获取当前对话
    let conversationId = await getWorkflowCurrentConversation(workflowId);
    
    // 如果不存在，创建新对话
    if (!conversationId) {
      conversationId = await createWorkflowConversation(workflowId);
    }
    
    return conversationId;
  } catch (error) {
    console.error(`Failed to get or create conversation for workflow ${workflowId}:`, error);
    throw error;
  }
} 