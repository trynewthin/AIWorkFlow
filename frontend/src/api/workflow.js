/**
 * 工作流API封装
 */
import { ipc } from '@/utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 获取工作流列表
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回工作流列表
 */
export function getWorkflowList(params) { 
  return ipc.invoke(ipcApiRoute.workflowList, params); 
}

/**
 * 获取工作流详情
 * @param {String} id - 工作流ID
 * @returns {Promise} - 返回工作流详情
 */
export function getWorkflowDetail(id) { 
  return ipc.invoke(ipcApiRoute.workflowDetail, { name: id }); 
}

/**
 * 创建或更新工作流
 * @param {Object} data - 工作流数据
 * @returns {Promise} - 返回保存结果
 */
export function saveWorkflow(data) {
  // 根据是否有ID判断是创建还是更新
  if (data.id) {
    return ipc.invoke(ipcApiRoute.workflowUpdate, { name: data.id, config: data });
  } else {
    return ipc.invoke(ipcApiRoute.workflowSave, { name: data.name, config: data });
  }
}

/**
 * 删除工作流
 * @param {String} id - 工作流ID
 * @returns {Promise} - 返回删除结果
 */
export function deleteWorkflow(id) { 
  return ipc.invoke(ipcApiRoute.workflowDelete, { name: id }); 
}

/**
 * 运行工作流
 * @param {String} id - 工作流ID
 * @param {Object} input - 可选的工作流输入参数
 * @returns {Promise} - 返回运行结果
 */
export function runWorkflow(id, input = {}) { 
  return ipc.invoke(ipcApiRoute.workflowRun, { name: id, input }); 
}

/**
 * 获取工作流执行状态
 * @param {String} engineId - 工作流引擎ID
 * @returns {Promise} - 返回工作流状态
 */
export function getWorkflowStatus(engineId) {
  return ipc.invoke(ipcApiRoute.workflowStatus, { engineId });
}

/**
 * 控制工作流执行
 * @param {String} engineId - 工作流引擎ID
 * @param {String} action - 控制动作（'pause'|'resume'|'stop'）
 * @returns {Promise} - 返回控制结果
 */
export function controlWorkflow(engineId, action) {
  return ipc.invoke(ipcApiRoute.workflowControl, { engineId, action });
} 