/**
 * @file electron/workflow/services/ConversationService.js
 * @class ConversationService
 * @description 工作流对话记录服务，提供对话轮次和消息的管理功能
 */

const { getWorkflowDb } = require('../../database/workflow-db');
const { getUserDb } = require('../../database');
const { logger } = require('ee-core/log');
const { randomUUID } = require('crypto');

/**
 * 工作流对话记录服务
 * 提供对话轮次管理、消息管理和上下文处理等功能
 */
class ConversationService {
  constructor() {
    /** @type {import('../../database/workflow-db').WorkflowDb} 工作流数据库服务实例 */
    this.workflowDb = getWorkflowDb();
    /** @type {import('../../database').UserDb} 用户数据库服务实例 */
    this.userDb = getUserDb();
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
      logger.error('[ConversationService] 获取当前用户ID失败:', error);
      return null;
    }
  }

  /**
   * @private
   * @description 检查工作流所有权
   * @param {string} workflowId 工作流ID
   * @returns {Promise<boolean>} 是否有权限访问该工作流
   */
  async _checkWorkflowOwnership(workflowId) {
    const currentUserId = await this._getCurrentUserId();
    if (!currentUserId) {
      return false;
    }
    
    return this.workflowDb.isWorkflowOwner(workflowId, currentUserId);
  }

  // ===== 对话轮次管理 =====

  /**
   * @description 创建新的对话轮次
   * @param {string} workflowId 工作流ID
   * @returns {Promise<string>} 创建的对话轮次ID
   * @throws {Error} 权限不足或工作流不存在时抛出错误
   */
  async createConversation(workflowId) {
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(workflowId);
    if (!hasPermission) {
      throw new Error(`无权限在工作流 ${workflowId} 中创建对话`);
    }
    
    // 创建对话轮次
    const conversationId = await this.workflowDb.createConversation({
      workflow_id: workflowId,
      id: randomUUID()
    });
    
    logger.info(`[ConversationService] 创建对话轮次成功: ${conversationId}`);
    return conversationId;
  }

  /**
   * @description 获取对话轮次信息
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<Object|null>} 对话轮次信息，不存在或无权限则返回null
   */
  async getConversation(conversationId) {
    try {
      // 获取对话轮次
      const conversation = await this.workflowDb.getConversation(conversationId);
      if (!conversation) {
        return null;
      }
      
      // 检查权限
      const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
      if (!hasPermission) {
        logger.warn(`[ConversationService] 用户无权限访问对话 ${conversationId}`);
        return null;
      }
      
      return conversation;
    } catch (error) {
      logger.error(`[ConversationService] 获取对话轮次失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description 获取工作流的所有对话轮次
   * @param {string} workflowId 工作流ID
   * @returns {Promise<Array<Object>>} 对话轮次列表
   * @throws {Error} 权限不足时抛出错误
   */
  async getWorkflowConversations(workflowId) {
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(workflowId);
    if (!hasPermission) {
      throw new Error(`无权限访问工作流 ${workflowId} 的对话`);
    }
    
    return this.workflowDb.getWorkflowConversations(workflowId);
  }

  /**
   * @description 删除对话轮次及其所有消息
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<boolean>} 删除是否成功
   * @throws {Error} 权限不足时抛出错误
   */
  async deleteConversation(conversationId) {
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(conversationId);
    if (!conversation) {
      return false;
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限删除对话 ${conversationId}`);
    }
    
    return this.workflowDb.deleteConversation(conversationId);
  }

  // ===== 对话消息管理 =====

  /**
   * @description 添加用户消息
   * @param {string} conversationId 对话轮次ID
   * @param {string} content 消息内容
   * @returns {Promise<string>} 消息ID
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async addUserMessage(conversationId, content) {
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`对话轮次不存在: ${conversationId}`);
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限向对话 ${conversationId} 添加消息`);
    }
    
    // 添加用户消息，格式化为 {role: "user", content: "xxx"} 的JSON字符串
    const userMessage = JSON.stringify({
      role: 'user',
      content: content
    });
    
    return this.workflowDb.addMessage({
      conversation_id: conversationId,
      content: userMessage
    });
  }

  /**
   * @description 添加AI回复消息
   * @param {string} conversationId 对话轮次ID
   * @param {string} content 消息内容
   * @returns {Promise<string>} 消息ID
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async addAIMessage(conversationId, content) {
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`对话轮次不存在: ${conversationId}`);
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限向对话 ${conversationId} 添加消息`);
    }
    
    // 添加AI消息，格式化为 {role: "assistant", content: "xxx"} 的JSON字符串
    const aiMessage = JSON.stringify({
      role: 'assistant',
      content: content
    });
    
    return this.workflowDb.addMessage({
      conversation_id: conversationId,
      content: aiMessage
    });
  }

  /**
   * @description 添加系统消息
   * @param {string} conversationId 对话轮次ID
   * @param {string} content 消息内容
   * @returns {Promise<string>} 消息ID
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async addSystemMessage(conversationId, content) {
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`对话轮次不存在: ${conversationId}`);
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限向对话 ${conversationId} 添加消息`);
    }
    
    // 添加系统消息，格式化为 {role: "system", content: "xxx"} 的JSON字符串
    const systemMessage = JSON.stringify({
      role: 'system',
      content: content
    });
    
    return this.workflowDb.addMessage({
      conversation_id: conversationId,
      content: systemMessage
    });
  }

  /**
   * @description 获取对话消息
   * @param {string} messageId 消息ID
   * @returns {Promise<Object|null>} 解析后的消息对象，不存在或无权限则返回null
   */
  async getMessage(messageId) {
    try {
      // 获取消息
      const message = await this.workflowDb.getMessage(messageId);
      if (!message) {
        return null;
      }
      
      // 获取对话轮次
      const conversation = await this.workflowDb.getConversation(message.conversation_id);
      if (!conversation) {
        logger.warn(`[ConversationService] 消息 ${messageId} 关联的对话轮次不存在`);
        return null;
      }
      
      // 检查权限
      const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
      if (!hasPermission) {
        logger.warn(`[ConversationService] 用户无权限访问消息 ${messageId}`);
        return null;
      }
      
      // 解析消息内容
      const parsedContent = JSON.parse(message.content);
      
      return {
        ...message,
        content: parsedContent
      };
    } catch (error) {
      logger.error(`[ConversationService] 获取消息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description 获取对话轮次的所有消息
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<Array<Object>>} 解析后的消息列表
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async getConversationMessages(conversationId) {
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`对话轮次不存在: ${conversationId}`);
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限访问对话 ${conversationId} 的消息`);
    }
    
    // 获取消息列表
    const messages = await this.workflowDb.getConversationMessages(conversationId);
    
    // 解析消息内容
    return messages.map(message => {
      try {
        const parsedContent = JSON.parse(message.content);
        return {
          ...message,
          content: parsedContent
        };
      } catch (error) {
        logger.warn(`[ConversationService] 解析消息内容失败: ${error.message}`);
        return message;
      }
    });
  }

  /**
   * @description 更新消息内容（用于流式输出更新）
   * @param {string} messageId 消息ID
   * @param {string} newContent 新的消息内容
   * @returns {Promise<boolean>} 更新是否成功
   * @throws {Error} 权限不足或消息不存在时抛出错误
   */
  async updateMessage(messageId, newContent) {
    // 获取原消息
    const originalMessage = await this.getMessage(messageId);
    if (!originalMessage) {
      throw new Error(`消息不存在或无权限访问: ${messageId}`);
    }
    
    // 更新消息内容，保持原有的角色
    const updatedContent = JSON.stringify({
      role: originalMessage.content.role,
      content: newContent
    });
    
    return this.workflowDb.updateMessage(messageId, updatedContent);
  }

  /**
   * @description 删除特定消息
   * @param {string} messageId 消息ID
   * @returns {Promise<boolean>} 删除是否成功
   * @throws {Error} 权限不足或消息不存在时抛出错误
   */
  async deleteMessage(messageId) {
    // 获取消息
    const message = await this.workflowDb.getMessage(messageId);
    if (!message) {
      return false;
    }
    
    // 获取对话轮次
    const conversation = await this.workflowDb.getConversation(message.conversation_id);
    if (!conversation) {
      logger.warn(`[ConversationService] 消息 ${messageId} 关联的对话轮次不存在`);
      return false;
    }
    
    // 检查权限
    const hasPermission = await this._checkWorkflowOwnership(conversation.workflow_id);
    if (!hasPermission) {
      throw new Error(`无权限删除消息 ${messageId}`);
    }
    
    return this.workflowDb.deleteMessage(messageId);
  }

  // ===== 对话上下文管理 =====

  /**
   * @description 获取最近N轮对话内容（用于构建上下文）
   * @param {string} conversationId 对话轮次ID
   * @param {number} [limit=10] 获取最近的消息数量
   * @returns {Promise<Array<Object>>} 格式化的消息列表，适用于发送给LLM的格式
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async getRecentMessages(conversationId, limit = 10) {
    // 获取所有消息
    const allMessages = await this.getConversationMessages(conversationId);
    
    // 取最近的N条消息
    const recentMessages = allMessages.slice(-limit);
    
    // 返回格式化的消息列表，只包含role和content字段
    return recentMessages.map(message => ({
      role: message.content.role,
      content: message.content.content
    }));
  }

  /**
   * @description 获取完整对话历史（用于导出或显示）
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<Array<Object>>} 完整的对话历史，包含时间戳和格式化内容
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async getFormattedConversationHistory(conversationId) {
    // 获取对话轮次信息
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`对话轮次不存在或无权限访问: ${conversationId}`);
    }
    
    // 获取所有消息
    const messages = await this.getConversationMessages(conversationId);
    
    // 返回完整的对话历史
    return {
      conversation: {
        id: conversation.id,
        workflow_id: conversation.workflow_id,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at
      },
      messages: messages.map(message => ({
        id: message.id,
        role: message.content.role,
        content: message.content.content,
        created_at: message.created_at
      }))
    };
  }

  /**
   * @description 导出对话历史为JSON格式
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<string>} JSON格式的对话历史
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async exportConversationAsJson(conversationId) {
    const history = await this.getFormattedConversationHistory(conversationId);
    return JSON.stringify(history, null, 2);
  }

  /**
   * @description 获取对话统计信息
   * @param {string} conversationId 对话轮次ID
   * @returns {Promise<Object>} 统计信息对象
   * @throws {Error} 权限不足或对话轮次不存在时抛出错误
   */
  async getConversationStats(conversationId) {
    // 获取所有消息
    const messages = await this.getConversationMessages(conversationId);
    
    // 计算统计信息
    const userMessages = messages.filter(m => m.content.role === 'user');
    const aiMessages = messages.filter(m => m.content.role === 'assistant');
    const systemMessages = messages.filter(m => m.content.role === 'system');
    
    // 计算平均长度
    const avgUserLength = userMessages.length > 0 ? 
      userMessages.reduce((sum, m) => sum + m.content.content.length, 0) / userMessages.length : 0;
    
    const avgAiLength = aiMessages.length > 0 ? 
      aiMessages.reduce((sum, m) => sum + m.content.content.length, 0) / aiMessages.length : 0;
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      systemMessages: systemMessages.length,
      avgUserMessageLength: Math.round(avgUserLength),
      avgAiMessageLength: Math.round(avgAiLength),
      firstMessageTime: messages.length > 0 ? messages[0].created_at : null,
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].created_at : null
    };
  }
}

// 单例实例
let instance = null;

/**
 * 获取工作流对话服务的单例
 * @returns {ConversationService} 工作流对话服务实例
 */
function getConversationService() {
  if (!instance) {
    instance = new ConversationService();
  }
  return instance;
}

// 导出类和便捷的单例获取方法
module.exports = {
  ConversationService,
  getConversationService
}; 