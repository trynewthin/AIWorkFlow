/**
 * @file electron/core/workflow/models/WorkflowService.js
 * @class WorkflowService
 * @description 工作流服务层，封装模型层的 WorkflowManager、WorkflowExecutor 及 NodeFactory
 */
const { getWorkflowManager } = require('../models/WorkflowManager'); // Adjusted path, assuming getWorkflowManager is exported
const { getWorkflowExecutor } = require('../models/WorkflowExecutor');
const { getNodeFactory } = require('../../node/services/NodeFactory'); // Adjusted path
const { getUserDb } = require('../../database'); // 导入用户数据库服务
const { getConversationService } = require('./ConversationService'); // 导入对话服务
const { logger } = require('ee-core/log');

class WorkflowService {
  constructor() {
    /** @type {import('../models/WorkflowManager').WorkflowManager} 工作流管理器实例 */
    this.workflowManager = getWorkflowManager(); // Use the getter
    /** @type {import('../models/WorkflowExecutor').WorkflowExecutor} 工作流执行器实例 */
    this.workflowExecutor = getWorkflowExecutor();
    /** @type {import('../../node/services/NodeFactory').NodeFactory} 节点工厂实例 */
    this.nodeFactory = getNodeFactory();
    /** @type {import('../../database').UserDb} 用户数据库服务实例 */
    this.userDb = getUserDb();
    /** @type {import('./ConversationService').ConversationService} 对话服务实例 */
    this.conversationService = getConversationService();
  }

  /**
   * @private
   * @description 获取当前登录用户ID
   * @returns {Promise<number|null>} 当前登录用户ID，无登录用户则返回null
   */
  async _getCurrentUserId() {
    try {
      const currentUser = await this.userDb.getCurrentLoggedInUser();
      return currentUser ? currentUser.id : null;
    } catch (error) {
      logger.error('获取当前用户ID失败:', error);
      return null;
    }
  }

  /**
   * @description 创建新的工作流
   * @param {string} name - 工作流名称
   * @param {string} [description] - 工作流描述
   * @param {Object} [config] - 工作流配置
   * @returns {Promise<import('../models/Workflow')>} 创建的工作流对象
   */
  async createWorkflow(name, description = '', config = {}) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法创建工作流');
    }

    // 创建工作流
    const workflow = await this.workflowManager.createWorkflow(name, description, config);
    
    // 添加工作流与用户的关联
    await this.workflowManager.workflowDb.addWorkflowUserRelation(workflow.id, currentUserId);
    
    return workflow;
  }

  /**
   * @description 根据 ID 获取工作流
   * @param {string} id - 工作流 ID
   * @returns {Promise<import('../models/Workflow')|null>} 工作流对象或 null
   */
  async getWorkflow(id) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法获取工作流');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(id, currentUserId);
    if (!isOwner) {
      logger.warn(`用户 ${currentUserId} 尝试访问非其所有的工作流 ${id}`);
      return null;
    }

    return this.workflowManager.getWorkflow(id);
  }

  /**
   * @description 获取所有工作流列表
   * @returns {Promise<Array<import('../models/Workflow')>>} 工作流列表
   */
  async listWorkflows() {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      logger.warn('没有登录用户，返回空工作流列表');
      return [];
    }

    // 获取用户的所有工作流
    const userWorkflows = await this.workflowManager.workflowDb.getUserWorkflows(currentUserId);
    
    // 转换为工作流模型对象
    const workflows = [];
    for (const workflowData of userWorkflows) {
      const workflow = await this.workflowManager.getWorkflow(workflowData.id);
      if (workflow) {
        workflows.push(workflow);
      }
    }
    
    return workflows;
  }

  /**
   * @description 更新工作流信息
   * @param {string} id - 工作流 ID
   * @param {Object} data - 更新字段，包括 name、description、config
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateWorkflow(id, data) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法更新工作流');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(id, currentUserId);
    if (!isOwner) {
      logger.warn(`用户 ${currentUserId} 尝试更新非其所有的工作流 ${id}`);
      return false;
    }

    return this.workflowManager.updateWorkflow(id, data);
  }

  /**
   * @description 删除指定工作流
   * @param {string} id - 工作流 ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteWorkflow(id) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法删除工作流');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(id, currentUserId);
    if (!isOwner) {
      logger.warn(`用户 ${currentUserId} 尝试删除非其所有的工作流 ${id}`);
      return false;
    }

    // 删除工作流（表内的外键约束会自动删除用户关联）
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
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法添加节点');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(workflowId, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限添加节点到工作流 ${workflowId}`);
    }

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
    // 获取节点信息
    const node = await this.workflowManager.workflowDb.getNode(nodeId);
    if (!node) {
      return false;
    }

    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法更新节点');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(node.workflow_id, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限更新节点 ${nodeId}`);
    }

    return this.workflowManager.updateNode(nodeId, flowConfig, workConfig);
  }

  /**
   * @description 删除指定节点
   * @param {string} nodeId - 节点 ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteNode(nodeId) {
    // 获取节点信息
    const node = await this.workflowManager.workflowDb.getNode(nodeId);
    if (!node) {
      return false;
    }

    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法删除节点');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(node.workflow_id, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限删除节点 ${nodeId}`);
    }

    return this.workflowManager.deleteNode(nodeId);
  }

  /**
   * @description 移动节点到新的位置
   * @param {string} nodeId - 节点 ID
   * @param {number} newIndex - 新的位置索引
   * @returns {Promise<boolean>} 移动是否成功
   */
  async moveNode(nodeId, newIndex) {
    // 获取节点信息
    const node = await this.workflowManager.workflowDb.getNode(nodeId);
    if (!node) {
      return false;
    }

    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法移动节点');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(node.workflow_id, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限移动节点 ${nodeId}`);
    }

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
   * @description 创建工作流对话轮次
   * @param {string} workflowId 工作流ID
   * @returns {Promise<string>} 对话轮次ID
   */
  async createWorkflowConversation(workflowId) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法创建对话');
    }
    
    // 检查工作流权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(workflowId, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限为工作流 ${workflowId} 创建对话`);
    }
    
    // 创建对话轮次
    const conversationId = await this.conversationService.createConversation(workflowId);
    
    // 将对话ID关联到工作流配置
    await this._updateWorkflowConversationId(workflowId, conversationId);
    
    logger.info(`[WorkflowService] 为工作流 ${workflowId} 创建对话轮次: ${conversationId}`);
    return conversationId;
  }
  
  /**
   * @private
   * @description 更新工作流配置中的当前对话ID
   * @param {string} workflowId 工作流ID
   * @param {string} conversationId 对话轮次ID
   */
  async _updateWorkflowConversationId(workflowId, conversationId) {
    const workflow = await this.workflowManager.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`工作流不存在: ${workflowId}`);
    }
    
    const updatedConfig = {
      ...workflow.config,
      currentConversationId: conversationId
    };
    
    await this.workflowManager.updateWorkflow(workflowId, { config: updatedConfig });
  }
  
  /**
   * @description 获取工作流当前关联的对话轮次
   * @param {string} workflowId 工作流ID
   * @returns {Promise<string|null>} 对话轮次ID，不存在则返回null
   */
  async getWorkflowCurrentConversation(workflowId) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法获取对话');
    }
    
    // 检查工作流权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(workflowId, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限访问工作流 ${workflowId} 的对话`);
    }
    
    const workflow = await this.workflowManager.getWorkflow(workflowId);
    if (!workflow) {
      return null;
    }
    
    return workflow.config.currentConversationId || null;
  }
  
  /**
   * @description 获取工作流的所有对话轮次
   * @param {string} workflowId 工作流ID
   * @returns {Promise<Array<Object>>} 对话轮次列表
   */
  async getWorkflowConversations(workflowId) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法获取对话');
    }
    
    // 检查工作流权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(workflowId, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限访问工作流 ${workflowId} 的对话`);
    }
    
    return this.conversationService.getWorkflowConversations(workflowId);
  }
  
  /**
   * @description 执行指定工作流，并可选记录对话
   * @param {string} workflowId - 工作流 ID
   * @param {import('../../core/pipeline/Pipeline')|Object} input - 输入数据或 Pipeline 实例
   * @param {Object} [options={}] - 执行选项
   * @param {boolean} [options.recordConversation=false] - 是否记录对话
   * @param {string} [options.conversationId] - 对话轮次ID，为空则使用工作流关联的当前对话ID
   * @param {boolean} [options.recordNodeExecution=false] - 是否记录节点执行信息
   * @param {boolean} [options.recordIntermediateResults=false] - 是否记录中间结果
   * @returns {Promise<import('../../core/pipeline/Pipeline')>} 执行结果 Pipeline
   */
  async executeWorkflow(workflowId, input, options = {}) {
    // 获取当前登录用户ID
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      throw new Error('没有登录用户，无法执行工作流');
    }

    // 检查权限
    const isOwner = await this.workflowManager.workflowDb.isWorkflowOwner(workflowId, currentUserId);
    if (!isOwner) {
      throw new Error(`无权限执行工作流 ${workflowId}`);
    }
    
    // 记录对话相关处理
    if (options.recordConversation) {
      // 获取或创建对话轮次ID
      let conversationId = options.conversationId;
      if (!conversationId) {
        const workflow = await this.workflowManager.getWorkflow(workflowId);
        conversationId = workflow.config.currentConversationId;
        
        // 如果没有关联的对话轮次，创建新的
        if (!conversationId) {
          conversationId = await this.createWorkflowConversation(workflowId);
        }
      }
      
      // 更新选项中的对话ID
      options.conversationId = conversationId;
      
      // 记录用户输入
      const userContent = this._formatInputForConversation(input);
      await this.conversationService.addUserMessage(conversationId, userContent);
      
      logger.info(`[WorkflowService] 记录用户输入到对话 ${conversationId}`);
    }

    // 执行工作流
    const resultPipeline = await this.workflowExecutor.execute(workflowId, input, options);
    
    // 记录AI回复
    if (options.recordConversation && options.conversationId) {
      const aiContent = this._formatOutputForConversation(resultPipeline);
      await this.conversationService.addAIMessage(options.conversationId, aiContent);
      
      logger.info(`[WorkflowService] 记录AI回复到对话 ${options.conversationId}`);
    }

    return resultPipeline;
  }
  
  /**
   * @private
   * @description 格式化输入数据用于对话记录
   * @param {any} input 输入数据
   * @returns {string} 格式化后的内容
   */
  _formatInputForConversation(input) {
    try {
      if (input === null || input === undefined) {
        return '';
      }
      
      // 如果输入是字符串，直接返回
      if (typeof input === 'string') {
        return input;
      }
      
      // 处理对象类型的输入
      if (typeof input === 'object') {
        // 如果是含有text字段的普通对象，直接返回text内容
        if (input.text !== undefined) {
          return input.text;
        }
        
        // 如果是Pipeline对象
        if (input && typeof input.getPipelineType === 'function' && typeof input.getAll === 'function') {
          const items = input.getAll();
          if (items && items.length > 0) {
            const firstItem = items[0];
            
            // 如果数据是对象且包含text字段，提取text字段
            if (typeof firstItem.data === 'object' && firstItem.data !== null && firstItem.data.text !== undefined) {
              return firstItem.data.text;
            }
            
            // 其他情况返回原始数据或其字符串表示
            return typeof firstItem.data === 'object' ? 
              JSON.stringify(firstItem.data, null, 2) : String(firstItem.data);
          }
          return '[空管道数据]';
        }
        
        // 处理其他对象类型，优先提取常见的内容字段
        if (input.content !== undefined) {
          return input.content;
        }
        
        // 最后默认进行JSON字符串化
        return JSON.stringify(input, null, 2);
      }
      
      // 其他基本类型直接转为字符串
      return String(input);
    } catch (error) {
      logger.warn(`[WorkflowService] 格式化输入数据失败: ${error.message}`);
      return '[无法解析的输入数据]';
    }
  }
  
  /**
   * @private
   * @description 格式化输出数据用于对话记录
   * @param {any} output 输出数据
   * @returns {string} 格式化后的内容
   */
  _formatOutputForConversation(output) {
    try {
      if (output === null || output === undefined) {
        return '';
      }
      
      if (typeof output === 'string') {
        return output;
      }
      
      if (typeof output === 'object') {
        // 如果是Pipeline对象
        if (output && typeof output.getPipelineType === 'function' && typeof output.getAll === 'function') {
          const items = output.getAll();
          if (items && items.length > 0) {
            // 尝试找到TEXT类型的数据（优先）
            const textItem = items.find(item => item.type === 'TEXT' || item.type === 'text');
            if (textItem) {
              return typeof textItem.data === 'object' ? 
                JSON.stringify(textItem.data, null, 2) : String(textItem.data);
            }
            
            // 否则返回第一个数据项
            const firstItem = items[0];
            return typeof firstItem.data === 'object' ? 
              JSON.stringify(firstItem.data, null, 2) : String(firstItem.data);
          }
          return '[空管道数据]';
        }
        
        return JSON.stringify(output, null, 2);
      }
      
      return String(output);
    } catch (error) {
      logger.warn(`[WorkflowService] 格式化输出数据失败: ${error.message}`);
      return '[无法解析的输出数据]';
    }
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