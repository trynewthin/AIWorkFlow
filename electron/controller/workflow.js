/**
 * @file workflow.js
 * @description 工作流控制器，处理前端的工作流相关请求
 */

const { logger } = require('ee-core/log');
const WorkflowManager = require('../model/workflow/WorkflowManager');
const { getWorkflowExecutor } = require('../model/workflow/WorkflowExecutor');
const { getNodeFactory } = require('../model/workflow/NodeFactory');

/**
 * 工作流控制器
 * @class
 */
class WorkflowController {
  constructor(ctx) {
    this.ctx = ctx;
    this.workflowManager = new WorkflowManager();
    this.workflowExecutor = getWorkflowExecutor();
    this.nodeFactory = getNodeFactory();
  }

  /**
   * 创建工作流
   */
  async createWorkflow() {
    try {
      const { name, description, config } = this.ctx.request.body;
      
      if (!name) {
        return { code: 400, message: '工作流名称不能为空', success: false };
      }
      
      const workflow = await this.workflowManager.createWorkflow(name, description, config);
      return { code: 200, data: workflow, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 创建工作流失败: ${error.message}`);
      return { code: 500, message: `创建工作流失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取工作流
   */
  async getWorkflow() {
    try {
      const { id } = this.ctx.request.body;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const workflow = await this.workflowManager.getWorkflow(id);
      
      if (!workflow) {
        return { code: 404, message: '工作流不存在', success: false };
      }
      
      return { code: 200, data: workflow, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 获取工作流失败: ${error.message}`);
      return { code: 500, message: `获取工作流失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取工作流列表
   */
  async listWorkflows() {
    try {
      const workflows = await this.workflowManager.listWorkflows();
      return { code: 200, data: workflows, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 获取工作流列表失败: ${error.message}`);
      return { code: 500, message: `获取工作流列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 更新工作流
   */
  async updateWorkflow() {
    try {
      const { id, name, description, config } = this.ctx.request.body;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (config !== undefined) data.config = config;
      
      const result = await this.workflowManager.updateWorkflow(id, data);
      
      if (!result) {
        return { code: 404, message: '工作流不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 更新工作流失败: ${error.message}`);
      return { code: 500, message: `更新工作流失败: ${error.message}`, success: false };
    }
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow() {
    try {
      const { id } = this.ctx.request.body;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const result = await this.workflowManager.deleteWorkflow(id);
      
      if (!result) {
        return { code: 404, message: '工作流不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 删除工作流失败: ${error.message}`);
      return { code: 500, message: `删除工作流失败: ${error.message}`, success: false };
    }
  }

  /**
   * 添加节点
   */
  async addNode() {
    try {
      const { workflowId, nodeType, flowConfig, workConfig, index } = this.ctx.request.body;
      
      if (!workflowId) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      if (!nodeType) {
        return { code: 400, message: '节点类型不能为空', success: false };
      }
      
      // 检查节点类型是否存在
      if (!this.nodeFactory.hasNodeType(nodeType)) {
        return { code: 400, message: `未知节点类型: ${nodeType}`, success: false };
      }
      
      const nodeId = await this.workflowManager.addNode(
        workflowId,
        nodeType,
        flowConfig || {},
        workConfig || {},
        index !== undefined ? index : -1
      );
      
      return { code: 200, data: { nodeId }, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 添加节点失败: ${error.message}`);
      return { code: 500, message: `添加节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 更新节点
   */
  async updateNode() {
    try {
      const { nodeId, flowConfig, workConfig } = this.ctx.request.body;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      const result = await this.workflowManager.updateNode(nodeId, flowConfig, workConfig);
      
      if (!result) {
        return { code: 404, message: '节点不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 更新节点失败: ${error.message}`);
      return { code: 500, message: `更新节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 删除节点
   */
  async deleteNode() {
    try {
      const { nodeId } = this.ctx.request.body;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      const result = await this.workflowManager.deleteNode(nodeId);
      
      if (!result) {
        return { code: 404, message: '节点不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 删除节点失败: ${error.message}`);
      return { code: 500, message: `删除节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 移动节点
   */
  async moveNode() {
    try {
      const { nodeId, newIndex } = this.ctx.request.body;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      if (newIndex === undefined || newIndex < 0) {
        return { code: 400, message: '新位置索引不能为空或负数', success: false };
      }
      
      const result = await this.workflowManager.moveNode(nodeId, newIndex);
      
      if (!result) {
        return { code: 404, message: '节点不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 移动节点失败: ${error.message}`);
      return { code: 500, message: `移动节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取可用节点类型列表
   */
  async getNodeTypes() {
    try {
      const nodeTypes = this.nodeFactory.getRegisteredTypes();
      return { code: 200, data: nodeTypes, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 获取节点类型列表失败: ${error.message}`);
      return { code: 500, message: `获取节点类型列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 执行工作流
   */
  async executeWorkflow() {
    try {
      const { workflowId, input, options } = this.ctx.request.body;
      
      if (!workflowId) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const result = await this.workflowExecutor.execute(workflowId, input, options);
      
      // 返回管道数据
      return { 
        code: 200, 
        data: {
          pipelineType: result.getPipelineType(),
          items: result.getAll()
        }, 
        success: true 
      };
    } catch (error) {
      logger.error(`[WorkflowController] 执行工作流失败: ${error.message}`);
      return { code: 500, message: `执行工作流失败: ${error.message}`, success: false };
    }
  }
}

module.exports = WorkflowController; 