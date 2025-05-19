/**
 * @file electron/node/models/memoryNode.js
 * @description 对话记忆节点，用于获取历史消息并与新消息拼接后进行对话生成
 */

const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage, AIMessage } = require('@langchain/core/messages');
const fs = require('fs');
const path = require('path');
const { logger } = require('ee-core/log');

/**
 * @class MemoryNode
 * @description 对话记忆节点，从工作流获取对话ID，加载历史消息并与新消息组合，然后使用LLM生成回复
 * @extends BaseNode
 */
class MemoryNode extends BaseNode {
  constructor() {
    super();
    this.historyMessages = [];
    this.llm = null;
    this.dataDir = path.join(process.cwd(), 'data', 'dialogues');
    this.conversationService = null;
  }

  /**
   * @description 初始化节点，注册处理器
   */
  async onInit() {
    // 初始化LLM实例
    const { model: modelName = 'deepseek-v3', temperature = 0.7 } = this.getWorkConfig();
    
    // 初始化LLM
    this.llm = new ChatOpenAI({
      modelName,
      temperature,
      verbose: false
    });
    
    // 创建历史记录存储目录（如果不存在）
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // 初始化对话服务
    try {
      this.conversationService = require('../../workflow/services/ConversationService').getConversationService();
    } catch (error) {
      logger.warn(`MemoryNode: 无法加载ConversationService: ${error.message}`);
    }
    
    // 注册管道处理器
    this.registerHandler(PipelineType.TEXT, this._handleText.bind(this));
    this.registerHandler('*', this._handleUnsupported.bind(this));
  }

  /**
   * @description 处理文本类型管道
   * @param {Pipeline} pipeline 输入管道
   * @returns {Pipeline} 输出管道
   * @private
   */
  async _handleText(pipeline) {
    try {
      // 从getByType方法获取TEXT类型的数据，从管道的第一个数据项获取内容
      const inputText = pipeline.getByType(DataType.TEXT);
      
      // 从工作流配置中获取对话ID
      const { dialogueId } = this.getFlowConfig();
      
      if (!dialogueId) {
        logger.warn('MemoryNode: 工作流未提供对话ID，将使用默认对话');
      }
      
      // 加载对话历史 (如果有对话ID)
      if (dialogueId) {
        await this.loadHistoryMessages(dialogueId);
      }
      
      // 获取系统提示词
      const { systemPrompt = '你是一个友好的AI助手，根据对话历史回答用户问题。' } = this.getWorkConfig();
      
      // 准备完整的消息列表，包括系统消息、历史消息和当前用户消息
      const messages = [new SystemMessage(systemPrompt)];
      
      // 添加历史消息
      for (const msg of this.historyMessages) {
        // 根据消息来源选择不同的处理方式
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        } else if (msg.role === 'system') {
          messages.push(new SystemMessage(msg.content));
        }
      }
      
      // 添加当前用户消息
      messages.push(new HumanMessage(inputText));
      
      // 日志记录
      logger.info(`MemoryNode: 使用 ${messages.length} 条消息进行对话生成，包含系统消息 1 条，历史消息 ${this.historyMessages.length} 条，当前消息 1 条`);
      
      // 使用LLM生成回复
      const response = await this.llm.invoke(messages);
      const aiResponse = response.content;
      
      // 创建输出管道
      return Pipeline.of(PipelineType.TEXT, DataType.TEXT, aiResponse);
    } catch (error) {
      console.error('MemoryNode _handleText error:', error);
      throw new Error(`MemoryNode处理失败: ${error.message}`);
    }
  }

  /**
   * @description 加载指定对话ID的历史消息
   * @param {string} dialogueId 对话ID
   * @returns {Promise<boolean>} 加载是否成功
   */
  async loadHistoryMessages(dialogueId) {
    if (!dialogueId) {
      this.historyMessages = [];
      return false;
    }
    
    // 首先尝试使用 ConversationService 从数据库加载
    if (this.conversationService) {
      try {
        logger.info(`MemoryNode: 正在从数据库加载对话 ${dialogueId} 的历史`);
        
        // 获取流配置中的历史轮次设置
        const { historyRounds = 5 } = this.getFlowConfig();
        
        // 计算需要加载的消息数量（一轮对话包括用户和AI各一条消息）
        const messagesCount = historyRounds * 2;
        
        // 使用 getRecentMessages 方法获取历史消息，这个方法直接返回格式化好的消息数组
        const messages = await this.conversationService.getRecentMessages(dialogueId, messagesCount);
        
        if (messages && Array.isArray(messages) && messages.length > 0) {
          this.historyMessages = messages;
          logger.info(`MemoryNode: 成功从数据库加载对话 ${dialogueId} 的历史消息，共 ${this.historyMessages.length} 条`);
          return true;
        } else {
          logger.info(`MemoryNode: 对话 ${dialogueId} 在数据库中没有历史消息或格式无效`);
        }
      } catch (error) {
        logger.error(`MemoryNode: 从数据库加载对话 ${dialogueId} 的历史消息失败: ${error.message}`);
      }
    } else {
      logger.warn(`MemoryNode: ConversationService 未初始化，无法从数据库加载对话历史`);
    }
    
    // 如果数据库加载失败，尝试从文件系统加载 (作为备份方案)
    try {
      const historyFilePath = path.join(this.dataDir, `${dialogueId}.json`);
      
      if (!fs.existsSync(historyFilePath)) {
        logger.info(`MemoryNode: 对话历史文件不存在 (${dialogueId})`);
        this.historyMessages = [];
        return false;
      }
      
      // 读取历史记录文件
      const fileContent = fs.readFileSync(historyFilePath, 'utf8');
      const historyData = JSON.parse(fileContent);
      
      // 获取流配置中的历史轮次设置
      const { historyRounds = 5 } = this.getFlowConfig();
      
      if (historyData && historyData.chat_history && Array.isArray(historyData.chat_history)) {
        // 只加载指定轮次的历史消息（一轮包含用户和AI各一条消息）
        const messagesCount = historyRounds * 2;
        if (historyData.chat_history.length > messagesCount) {
          this.historyMessages = historyData.chat_history.slice(-messagesCount);
        } else {
          this.historyMessages = historyData.chat_history;
        }
        
        logger.info(`MemoryNode: 成功从文件加载对话 ${dialogueId} 的历史消息`);
        return true;
      } else {
        logger.warn(`MemoryNode: 文件中的对话历史数据格式无效 (${dialogueId})`);
        this.historyMessages = [];
        return false;
      }
    } catch (error) {
      logger.error(`MemoryNode: 从文件加载对话 ${dialogueId} 的历史消息失败: ${error.message}`);
      this.historyMessages = [];
      return false;
    }
  }

  /**
   * @description 处理不支持的管道类型
   * @param {Pipeline} pipeline 输入管道
   * @private
   */
  async _handleUnsupported(pipeline) {
    throw new Error(`MemoryNode不支持处理${pipeline.getPipelineType()}类型的管道`);
  }
}

module.exports = MemoryNode; 