/**
 * @file workflow.js
 * @description 工作流控制器，处理前端的工作流相关请求
 */

const { logger } = require('ee-core/log');
const workflowService = require('../services/workflow/workflow-service');
const configService = require('../services/config/configService');

/**
 * 工作流控制器
 * @class
 */
class WorkflowController {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 创建工作流
   */
  async createWorkflow(params) {
    try {
      const { name, description, config } = params;
      
      if (!name) {
        return { code: 400, message: '工作流名称不能为空', success: false };
      }
      
      const workflow = await workflowService.createWorkflow(name, description, config);
      return { code: 200, data: workflow, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 创建工作流失败: ${error.message}`);
      return { code: 500, message: `创建工作流失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取工作流
   */
  async getWorkflow(params) {
    try {
      const { id } = params;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const workflow = await workflowService.getWorkflow(id);
      
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
      const workflows = await workflowService.listWorkflows();
      return { code: 200, data: workflows, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 获取工作流列表失败: ${error.message}`);
      return { code: 500, message: `获取工作流列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 更新工作流
   */
  async updateWorkflow(params) {
    try {
      const { id, name, description, config } = params;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (config !== undefined) data.config = config;
      
      const result = await workflowService.updateWorkflow(id, data);
      
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
  async deleteWorkflow(params) {
    try {
      const { id } = params;
      
      if (!id) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const result = await workflowService.deleteWorkflow(id);
      
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
  async addNode(params) {
    try {
      const { workflowId, nodeType, flowConfig, workConfig, index } = params;
      
      if (!workflowId) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      if (!nodeType) {
        return { code: 400, message: '节点类型不能为空', success: false };
      }
      
      // 检查节点类型是否存在 (通过服务中的节点类型列表检查)
      const nodeTypes = workflowService.getNodeTypes();
      if (!nodeTypes.includes(nodeType)) {
        return { code: 400, message: `未知节点类型: ${nodeType}`, success: false };
      }
      
      console.log('nodeType', nodeType, configService.getDefaultFlowConfig(nodeType), configService.getDefaultWorkConfig(nodeType));

      const nodeId = await workflowService.addNode(
        workflowId,
        nodeType,
        configService.getDefaultFlowConfig(nodeType),
        configService.getDefaultWorkConfig(nodeType),
        index !== undefined ? index : -1
      );
      
      return { code: 200, data: { nodeId }, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 添加节点失败: ${error.message}`);
      if (error.message.includes('节点类型不匹配')) {
        return { code: 400, message: error.message, success: false };
      }
      return { code: 500, message: `添加节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 更新节点
   */
  async updateNode(params) {
    try {
      const { nodeId, flowConfig, workConfig } = params;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      const result = await workflowService.updateNode(nodeId, flowConfig, workConfig);
      
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
  async deleteNode(params) {
    try {
      const { nodeId } = params;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      const result = await workflowService.deleteNode(nodeId);
      
      if (!result) {
        return { code: 404, message: '节点不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 删除节点失败: ${error.message}`);
      if (error.message.includes('节点类型不匹配') || error.message.includes('节点类型不兼容')) {
        return { code: 400, message: error.message, success: false };
      }
      return { code: 500, message: `删除节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 移动节点
   */
  async moveNode(params) {
    try {
      const { nodeId, newIndex } = params;
      
      if (!nodeId) {
        return { code: 400, message: '节点ID不能为空', success: false };
      }
      
      if (newIndex === undefined || newIndex < 0) {
        return { code: 400, message: '新位置索引不能为空或负数', success: false };
      }
      
      const result = await workflowService.moveNode(nodeId, newIndex);
      
      if (!result) {
        return { code: 404, message: '节点不存在', success: false };
      }
      
      return { code: 200, data: true, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 移动节点失败: ${error.message}`);
      if (error.message.includes('节点类型不匹配')) {
        return { code: 400, message: error.message, success: false };
      }
      return { code: 500, message: `移动节点失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取可用节点类型列表
   */
  async getNodeTypes() {
    try {
      const nodeTypes = workflowService.getNodeTypes();
      return { code: 200, data: nodeTypes, success: true };
    } catch (error) {
      logger.error(`[WorkflowController] 获取节点类型列表失败: ${error.message}`);
      return { code: 500, message: `获取节点类型列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(params) {
    try {
      const { workflowId, input, options } = params;
      
      if (!workflowId) {
        return { code: 400, message: '工作流ID不能为空', success: false };
      }
      
      const result = await workflowService.executeWorkflow(workflowId, input, options);
      
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