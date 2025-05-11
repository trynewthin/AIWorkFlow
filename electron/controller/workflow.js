/**
 * @module WorkflowController
 * @description 工作流控制器，提供工作流管理和执行的API接口
 */
const workflowService = require('../services/workflow');

/**
 * @class WorkflowController
 */
class WorkflowController {
  /**
   * @description 获取工作流列表
   * @returns {Array} 工作流配置列表
   */
  getWorkflowList() {
    try {
      const list = workflowService.getWorkflowList();
      return {
        code: 0,
        message: '获取工作流列表成功',
        data: list
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取工作流列表失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 获取工作流详细配置
   * @param {string} name - 工作流名称
   * @returns {Object} 工作流配置
   */
  getWorkflowConfig(name) {
    try {
      const config = workflowService.getWorkflowConfig(name);
      if (!config) {
        return {
          code: -1,
          message: `未找到工作流: ${name}`,
          data: null
        };
      }
      return {
        code: 0,
        message: '获取工作流配置成功',
        data: config
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取工作流配置失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 创建新工作流
   * @param {string} name - 工作流名称
   * @param {Object} config - 工作流配置
   * @returns {Object} 操作结果
   */
  createWorkflow(name, config) {
    try {
      const result = workflowService.createWorkflow(name, config);
      if (!result) {
        return {
          code: -1,
          message: `创建工作流失败: 名称 ${name} 已存在`,
          data: null
        };
      }
      return {
        code: 0,
        message: '创建工作流成功',
        data: { name }
      };
    } catch (error) {
      return {
        code: -1,
        message: `创建工作流失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 更新工作流配置
   * @param {string} name - 工作流名称
   * @param {Object} config - 新的工作流配置
   * @returns {Object} 操作结果
   */
  updateWorkflow(name, config) {
    try {
      const result = workflowService.updateWorkflow(name, config);
      if (!result) {
        return {
          code: -1,
          message: `更新工作流失败: 未找到 ${name}`,
          data: null
        };
      }
      return {
        code: 0,
        message: '更新工作流成功',
        data: { name }
      };
    } catch (error) {
      return {
        code: -1,
        message: `更新工作流失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 删除工作流
   * @param {string} name - 工作流名称
   * @returns {Object} 操作结果
   */
  deleteWorkflow(name) {
    try {
      const result = workflowService.deleteWorkflow(name);
      if (!result) {
        return {
          code: -1,
          message: `删除工作流失败: 未找到 ${name}`,
          data: null
        };
      }
      return {
        code: 0,
        message: '删除工作流成功',
        data: { name }
      };
    } catch (error) {
      return {
        code: -1,
        message: `删除工作流失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 执行工作流
   * @param {string} name - 工作流名称
   * @param {*} input - 工作流输入数据
   * @returns {Object} 包含engineId的执行信息
   */
  async executeWorkflow(name, input) {
    try {
      const result = await workflowService.executeWorkflow(name, input);
      return {
        code: 0,
        message: '工作流执行已启动',
        data: result
      };
    } catch (error) {
      return {
        code: -1,
        message: `执行工作流失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 获取工作流执行状态
   * @param {string} engineId - 工作流引擎ID
   * @returns {Object} 工作流状态信息
   */
  getWorkflowStatus(engineId) {
    try {
      const status = workflowService.getWorkflowStatus(engineId);
      if (!status) {
        return {
          code: -1,
          message: `未找到指定的工作流实例: ${engineId}`,
          data: null
        };
      }
      return {
        code: 0,
        message: '获取工作流状态成功',
        data: status
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取工作流状态失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 控制工作流执行
   * @param {string} engineId - 工作流引擎ID
   * @param {string} action - 控制动作：pause, resume, stop
   * @returns {Object} 操作结果
   */
  controlWorkflow(engineId, action) {
    try {
      const result = workflowService.controlWorkflow(engineId, action);
      if (!result) {
        return {
          code: -1,
          message: `控制工作流失败: 未找到引擎 ${engineId} 或操作 ${action} 不允许`,
          data: null
        };
      }
      return {
        code: 0,
        message: `工作流${action}成功`,
        data: { engineId, action }
      };
    } catch (error) {
      return {
        code: -1,
        message: `控制工作流失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 获取所有运行中的工作流
   * @returns {Object} 运行中的工作流列表
   */
  getRunningWorkflows() {
    try {
      const list = workflowService.getRunningWorkflows();
      return {
        code: 0,
        message: '获取运行中工作流列表成功',
        data: list
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取运行中工作流列表失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 获取工作流的所有步骤
   * @param {string} name - 工作流名称
   * @returns {Object} 操作结果，包含步骤列表
   */
  getSteps(name) {
    try {
      const steps = workflowService.getSteps(name);
      return {
        code: 0,
        message: '获取工作流步骤成功',
        data: steps
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取工作流步骤失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 向工作流添加新步骤
   * @param {string} name - 工作流名称
   * @param {string} stepName - 新步骤的名称
   * @param {Object} stepConfig - 步骤配置 (nodeName, params, next, conditions)
   * @param {Object} [options] - 可选参数 { after?: string, before?: string }
   * @returns {Object} 操作结果
   */
  addStep(name, stepName, stepConfig, options = {}) {
    try {
      const result = workflowService.addStep(name, stepName, stepConfig, options);
      return {
        code: 0,
        message: '添加步骤成功',
        data: result
      };
    } catch (error) {
      return {
        code: -1,
        message: `添加步骤失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 更新工作流中的步骤
   * @param {string} name - 工作流名称
   * @param {string} stepName - 步骤名称
   * @param {Object} newConfig - 新的步骤配置
   * @returns {Object} 操作结果
   */
  updateStep(name, stepName, newConfig) {
    try {
      const result = workflowService.updateStep(name, stepName, newConfig);
      return {
        code: 0,
        message: '更新步骤成功',
        data: result
      };
    } catch (error) {
      return {
        code: -1,
        message: `更新步骤失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 从工作流移除步骤
   * @param {string} name - 工作流名称
   * @param {string} stepName - 步骤名称
   * @returns {Object} 操作结果
   */
  removeStep(name, stepName) {
    try {
      const result = workflowService.removeStep(name, stepName);
      return {
        code: 0,
        message: '移除步骤成功',
        data: result
      };
    } catch (error) {
      return {
        code: -1,
        message: `移除步骤失败: ${error.message}`,
        data: null
      };
    }
  }
  
  /**
   * @description 重新排序工作流中的步骤
   * @param {string} name - 工作流名称
   * @param {string[]} orderedStepNames - 步骤名称的有序数组
   * @returns {Object} 操作结果
   */
  reorderSteps(name, orderedStepNames) {
    try {
      const result = workflowService.reorderSteps(name, orderedStepNames);
      return {
        code: 0,
        message: '重新排序步骤成功',
        data: result
      };
    } catch (error) {
      return {
        code: -1,
        message: `重新排序步骤失败: ${error.message}`,
        data: null
      };
    }
  }
}

module.exports = WorkflowController; 