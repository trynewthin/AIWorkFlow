/**
 * @file electron/node/models/memoryNode.js
 * @description 对话记忆节点，用于保存历史消息并与新消息拼接后进行对话生成
 */

const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const fs = require('fs');
const path = require('path');

/**
 * @class MemoryNode
 * @description 对话记忆节点，加载历史消息并与新消息组合，然后使用LLM生成回复
 * @extends BaseNode
 */
class MemoryNode extends BaseNode {
  constructor() {
    super();
    this.historyMessages = [];
    this.llm = null;
    this.dataDir = path.join(process.cwd(), 'data', 'dialogues');
  }

  /**
   * @description 初始化节点，注册处理器
   */
  async onInit() {
    // 初始化LLM实例
    const { model: modelName = 'deepseek-v3', temperature = 0.7 } = this.getWorkConfig();
    const { dialogueId = 'default', historyRounds = 5 } = this.getFlowConfig();
    
    this.llm = new ChatOpenAI({
      modelName,
      temperature,
      verbose: true
    });
    
    // 创建历史记录存储目录（如果不存在）
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // 加载历史消息
    this.loadHistoryMessages(dialogueId, historyRounds);
    
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
      const inputText = pipeline.getData();
      
      // 获取工作配置和流配置
      const workConfig = this.getWorkConfig();
      const flowConfig = this.getFlowConfig();
      const { systemPrompt = '' } = workConfig;
      const { dialogueId = 'default' } = flowConfig;
      
      // 拼接历史消息和新消息
      const combinedText = this._combineMessages(inputText);
      
      // 使用LLM生成回复
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(combinedText)
      ]);
      
      // 保存当前对话到历史记录
      this._saveMessageToHistory(dialogueId, inputText, response.content);
      
      // 创建输出管道
      return Pipeline.of(PipelineType.TEXT, DataType.TEXT, response.content);
    } catch (error) {
      console.error('MemoryNode _handleText error:', error);
      throw new Error(`MemoryNode处理失败: ${error.message}`);
    }
  }

  /**
   * @description 将历史消息与输入消息组合
   * @param {string} inputText 输入文本
   * @returns {string} 组合后的文本
   * @private
   */
  _combineMessages(inputText) {
    // 获取配置
    const { roleMappings = {} } = this.getWorkConfig();
    const { user = '用户', assistant = '助手' } = roleMappings;
    
    let result = '';
    const separatorToken = '\n'; // 默认分隔符
    
    // 添加历史消息
    if (this.historyMessages.length > 0) {
      this.historyMessages.forEach(msg => {
        const role = msg.role === 'user' ? user : assistant;
        result += `${role}: ${msg.content}${separatorToken}`;
      });
    }
    
    // 添加当前消息
    result += `${user}: ${inputText}`;
    
    return result;
  }

  /**
   * @description 保存消息到历史记录
   * @param {string} dialogueId 对话ID
   * @param {string} userInput 用户输入
   * @param {string} aiResponse AI回复
   * @private
   */
  _saveMessageToHistory(dialogueId, userInput, aiResponse) {
    // 创建用户消息
    this.historyMessages.push({
      id: this.historyMessages.length + 1,
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    });
    
    // 创建AI消息
    this.historyMessages.push({
      id: this.historyMessages.length + 1,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    // 将历史消息写入文件
    try {
      const historyFilePath = path.join(this.dataDir, `${dialogueId}.json`);
      const historyData = {
        dialogue_id: dialogueId,
        chat_history: this.historyMessages
      };
      fs.writeFileSync(historyFilePath, JSON.stringify(historyData, null, 2), 'utf8');
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
    
    // 获取配置中的历史轮次
    const { historyRounds = 5 } = this.getFlowConfig();
    
    // 如果历史消息太多，只保留最新的历史轮次
    if (this.historyMessages.length > historyRounds * 2) {
      this.historyMessages = this.historyMessages.slice(-historyRounds * 2);
    }
  }

  /**
   * @description 加载指定对话ID的历史消息
   * @param {string} dialogueId 对话ID
   * @param {number} rounds 需要加载的历史消息轮次
   */
  loadHistoryMessages(dialogueId, rounds) {
    try {
      const historyFilePath = path.join(this.dataDir, `${dialogueId}.json`);
      
      if (!fs.existsSync(historyFilePath)) {
        // 如果历史文件不存在，则创建空的历史记录
        this.historyMessages = [];
        return;
      }
      
      // 读取历史记录文件
      const historyData = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
      
      if (historyData && historyData.chat_history && Array.isArray(historyData.chat_history)) {
        // 只加载指定轮次的历史消息（一轮包含用户和AI各一条消息）
        const messagesCount = rounds * 2;
        if (historyData.chat_history.length > messagesCount) {
          this.historyMessages = historyData.chat_history.slice(-messagesCount);
        } else {
          this.historyMessages = historyData.chat_history;
        }
        
        console.log(`成功加载对话 ${dialogueId} 的 ${this.historyMessages.length / 2} 轮历史消息`);
      } else {
        this.historyMessages = [];
      }
    } catch (error) {
      console.error(`加载对话 ${dialogueId} 的历史消息失败:`, error);
      this.historyMessages = [];
    }
  }

  /**
   * @description 处理不支持的管道类型
   * @param {Pipeline} pipeline 输入管道
   * @private
   */
  async _handleUnsupported(pipeline) {
    throw new Error(`MemoryNode不支持处理${pipeline.getType()}类型的管道`);
  }
}

module.exports = MemoryNode; 