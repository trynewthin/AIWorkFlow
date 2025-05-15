/**
 * @file electron/core/workflow/models/WorkflowService.js
 * @class WorkflowService
 * @description 工作流服务层，封装模型层的 WorkflowManager、WorkflowExecutor 及 NodeFactory
 */
const { getWorkflowManager } = require('../models/WorkflowManager'); // Adjusted path, assuming getWorkflowManager is exported
const { getWorkflowExecutor } = require('../models/WorkflowExecutor');
const { getNodeFactory } = require('../../node/services/NodeFactory'); // Adjusted path

class WorkflowService {
  constructor() {
    /** @type {import('../models/WorkflowManager').WorkflowManager} 工作流管理器实例 */
    this.workflowManager = getWorkflowManager(); // Use the getter
    /** @type {import('../models/WorkflowExecutor').WorkflowExecutor} 工作流执行器实例 */
    this.workflowExecutor = getWorkflowExecutor();
    /** @type {import('../../node/services/NodeFactory').NodeFactory} 节点工厂实例 */
    this.nodeFactory = getNodeFactory();
  }

  /**
   * @description 创建新的工作流
   * @param {string} name - 工作流名称
   * @param {string} [description] - 工作流描述
   * @param {Object} [config] - 工作流配置
   * @returns {Promise<import('../models/Workflow')>} 创建的工作流对象
   */
  async createWorkflow(name, description = '', config = {}) {
    return this.workflowManager.createWorkflow(name, description, config);
  }

  /**
   * @description 根据 ID 获取工作流
   * @param {string} id - 工作流 ID
   * @returns {Promise<import('../models/Workflow')|null>} 工作流对象或 null
   */
  async getWorkflow(id) {
    return this.workflowManager.getWorkflow(id);
  }

  /**
   * @description 获取所有工作流列表
   * @returns {Promise<Array<import('../models/Workflow')>>} 工作流列表
   */
  async listWorkflows() {
    return this.workflowManager.listWorkflows();
  }

  /**
   * @description 更新工作流信息
   * @param {string} id - 工作流 ID
   * @param {Object} data - 更新字段，包括 name、description、config
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateWorkflow(id, data) {
    return this.workflowManager.updateWorkflow(id, data);
  }

  /**
   * @description 删除指定工作流
   * @param {string} id - 工作流 ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteWorkflow(id) {
    return this.workflowManager.deleteWorkflow(id);
  }

  /**
   * @description 向指定工作流添加节点
   * @param {string} workflowId - 工作流 ID
   * @param {string} nodeType - 节点类型名称
   * @param {Object} [flowConfig] - 流程级配置
   * @param {Object} [workConfig] - 运行时配置
   * @param {number} [index] - 插入位置索引
   * @returns {Promise<string>} 新增节点的 ID
   */
  async addNode(workflowId, nodeType, flowConfig = {}, workConfig = {}, index = -1) {
    return this.workflowManager.addNode(workflowId, nodeType, flowConfig, workConfig, index);
  }

  /**
   * @description 更新节点配置
   * @param {string} nodeId - 节点 ID
   * @param {Object} flowConfig - 流程级配置
   * @param {Object} workConfig - 运行时配置
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateNode(nodeId, flowConfig, workConfig) {
    return this.workflowManager.updateNode(nodeId, flowConfig, workConfig);
  }

  /**
   * @description 删除指定节点
   * @param {string} nodeId - 节点 ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteNode(nodeId) {
    return this.workflowManager.deleteNode(nodeId);
  }

  /**
   * @description 移动节点到新的位置
   * @param {string} nodeId - 节点 ID
   * @param {number} newIndex - 新的位置索引
   * @returns {Promise<boolean>} 移动是否成功
   */
  async moveNode(nodeId, newIndex) {
    return this.workflowManager.moveNode(nodeId, newIndex);
  }

  /**
   * @description 获取所有已注册的节点类型列表
   * @returns {Array<string>} 节点类型名称数组
   */
  getNodeTypes() {
    return this.nodeFactory.getRegisteredTypes();
  }

  /**
   * @description 执行指定工作流
   * @param {string} workflowId - 工作流 ID
   * @param {import('../../core/pipeline/Pipeline')|Object} input - 输入数据或 Pipeline 实例
   * @param {Object} [options] - 执行选项
   * @returns {Promise<import('../../core/pipeline/Pipeline')>} 执行结果 Pipeline
   */
  async executeWorkflow(workflowId, input, options = {}) {
    return this.workflowExecutor.execute(workflowId, input, options);
  }
}

// 单例模式导出
let instance = null;

/**
 * @function getWorkflowService
 * @description 获取 WorkflowService 的单例
 * @returns {WorkflowService}
 */
function getWorkflowService() {
  if (!instance) {
    instance = new WorkflowService();
  }
  return instance;
}

module.exports = {
  WorkflowService, // 导出类本身，如果需要直接实例化
  getWorkflowService // 导出获取单例的函数
}; 