/**
 * @file WorkflowManager.js
 * @description 工作流管理器，负责工作流的生命周期管理和节点操作
 */

const { randomUUID } = require('crypto');
const { logger } = require('ee-core/log');
const { getWorkflowDb } = require('../../database');
const Workflow = require('./Workflow');

/**
 * @class WorkflowManager
 * @description 工作流管理器，负责工作流的生命周期管理和节点操作
 */
class WorkflowManager {
  /**
   * @constructor
   */
  constructor() {
    /** @type {import('../../database/workflow-db').WorkflowDb} */
    this.workflowDb = getWorkflowDb();
  }

  /**
   * @method createWorkflow
   * @description 创建新工作流
   * @param {string} name - 工作流名称
   * @param {string} [description=''] - 工作流描述
   * @param {Object} [config={}] - 工作流配置
   * @returns {Promise<Workflow>} 创建的工作流实例
   */
  async createWorkflow(name, description = '', config = {}) {
    try {
      if (!name) throw new Error('工作流名称不能为空');

      const id = await this.workflowDb.createWorkflow({
        name,
        description,
        config
      });

      const workflow = new Workflow({
        id,
        name,
        description,
        config
      });

      logger.info(`[WorkflowManager] 创建工作流成功: ${id}`);
      return workflow;
    } catch (error) {
      logger.error(`[WorkflowManager] 创建工作流失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getWorkflow
   * @description 获取工作流及其节点
   * @param {string} id - 工作流ID
   * @returns {Promise<Workflow|null>} 工作流实例，不存在则返回null
   */
  async getWorkflow(id) {
    try {
      const dbWorkflow = await this.workflowDb.getWorkflow(id);
      if (!dbWorkflow) {
        return null;
      }

      const nodes = await this.workflowDb.getWorkflowNodes(id);
      const workflow = Workflow.fromDatabase(dbWorkflow, nodes);

      return workflow;
    } catch (error) {
      logger.error(`[WorkflowManager] 获取工作流失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method listWorkflows
   * @description 获取所有工作流列表
   * @returns {Promise<Array<Workflow>>} 工作流实例列表
   */
  async listWorkflows() {
    try {
      const dbWorkflows = await this.workflowDb.listWorkflows();
      const workflows = [];

      for (const dbWorkflow of dbWorkflows) {
        const nodes = await this.workflowDb.getWorkflowNodes(dbWorkflow.id);
        workflows.push(Workflow.fromDatabase(dbWorkflow, nodes));
      }

      return workflows;
    } catch (error) {
      logger.error(`[WorkflowManager] 获取工作流列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method updateWorkflow
   * @description 更新工作流元数据
   * @param {string} id - 工作流ID
   * @param {Object} data - 需要更新的字段
   * @param {string} [data.name] - 工作流名称
   * @param {string} [data.description] - 工作流描述
   * @param {Object} [data.config] - 工作流配置
   * @returns {Promise<boolean>} 更新成功返回true，工作流不存在返回false
   */
  async updateWorkflow(id, data = {}) {
    try {
      const result = await this.workflowDb.updateWorkflow(id, data);
      if (result) {
        logger.info(`[WorkflowManager] 更新工作流成功: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowManager] 更新工作流失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method deleteWorkflow
   * @description 删除工作流及其所有节点
   * @param {string} id - 工作流ID
   * @returns {Promise<boolean>} 删除成功返回true，工作流不存在返回false
   */
  async deleteWorkflow(id) {
    try {
      const result = await this.workflowDb.deleteWorkflow(id);
      if (result) {
        logger.info(`[WorkflowManager] 删除工作流成功: ${id}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowManager] 删除工作流失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method addNode
   * @description 向工作流添加节点
   * @param {string} workflowId - 工作流ID
   * @param {string} nodeType - 节点类型名称
   * @param {Object} [flowConfig={}] - 节点流程级配置
   * @param {Object} [workConfig={}] - 节点运行时配置
   * @param {number} [index=-1] - 插入位置，-1表示添加到末尾
   * @returns {Promise<string>} 节点ID
   */
  async addNode(workflowId, nodeType, flowConfig = {}, workConfig = {}, index = -1) {
    try {
      if (!workflowId) throw new Error('工作流ID不能为空');
      if (!nodeType) throw new Error('节点类型不能为空');

      const nodeId = await this.workflowDb.addNode({
        workflow_id: workflowId,
        type: nodeType,
        flow_config: flowConfig,
        work_config: workConfig,
        order_index: index >= 0 ? index : undefined
      });

      logger.info(`[WorkflowManager] 添加节点成功: ${nodeId} 到工作流 ${workflowId}`);
      return nodeId;
    } catch (error) {
      logger.error(`[WorkflowManager] 添加节点失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getNode
   * @description 获取节点信息
   * @param {string} nodeId - 节点ID
   * @returns {Promise<Object|null>} 节点信息，不存在则返回null
   */
  async getNode(nodeId) {
    try {
      return await this.workflowDb.getNode(nodeId);
    } catch (error) {
      logger.error(`[WorkflowManager] 获取节点失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method updateNode
   * @description 更新节点配置
   * @param {string} nodeId - 节点ID
   * @param {Object} [flowConfig] - 节点流程级配置
   * @param {Object} [workConfig] - 节点运行时配置
   * @returns {Promise<boolean>} 更新成功返回true，节点不存在返回false
   */
  async updateNode(nodeId, flowConfig, workConfig) {
    try {
      const updateData = {};
      if (flowConfig !== undefined) updateData.flow_config = flowConfig;
      if (workConfig !== undefined) updateData.work_config = workConfig;

      const result = await this.workflowDb.updateNode(nodeId, updateData);
      if (result) {
        logger.info(`[WorkflowManager] 更新节点成功: ${nodeId}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowManager] 更新节点失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method deleteNode
   * @description 删除节点
   * @param {string} nodeId - 节点ID
   * @returns {Promise<boolean>} 删除成功返回true，节点不存在返回false
   */
  async deleteNode(nodeId) {
    try {
      const result = await this.workflowDb.deleteNode(nodeId);
      if (result) {
        logger.info(`[WorkflowManager] 删除节点成功: ${nodeId}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowManager] 删除节点失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method moveNode
   * @description 移动节点位置
   * @param {string} nodeId - 节点ID
   * @param {number} newIndex - 新的位置索引
   * @returns {Promise<boolean>} 移动成功返回true，节点不存在返回false
   */
  async moveNode(nodeId, newIndex) {
    try {
      if (newIndex < 0) throw new Error('新位置索引不能为负数');

      const result = await this.workflowDb.moveNode(nodeId, newIndex);
      if (result) {
        logger.info(`[WorkflowManager] 移动节点成功: ${nodeId} 到位置 ${newIndex}`);
      }
      return result;
    } catch (error) {
      logger.error(`[WorkflowManager] 移动节点失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = WorkflowManager; 