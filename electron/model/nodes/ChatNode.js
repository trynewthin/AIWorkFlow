/**
 * @file electron/model/nodes/chat.js
 * @description 聊天节点（基于 LangChain JS）
 */
const { DataType, PipelineType } = require('../../config/pipeline');
const { ChatOpenAI } = require('@langchain/openai');
// 导入 LangChain 消息类
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');

/**
 * @class ChatNode
 * @description 聊天节点（基于 LangChain JS）
 */
class ChatNode extends BaseNode {
  /**
   * @constructor
   * @description 构造聊天节点实例，初始化LLM和处理器。
   *              运行时配置（如model, systemPrompt, temperature）将由BaseNode通过ConfigService加载。
   */
  constructor() {
    super(); // BaseNode的构造函数会处理配置加载
    // 初始化LLM实例将在 onInit 钩子中进行，以确保 _workConfig 可用
    this.llm = null;
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   *              在此处初始化LLM实例，因为它依赖于 _workConfig。
   */
  async onInit() {
    // 从 _workConfig 获取配置，这些配置由 ConfigService 提供
    const workConfig = this.getWorkConfig(); 

    try {
      // 确保有默认配置
      const modelName = workConfig.model || 'deepseek-v3';
      const systemPrompt = workConfig.systemPrompt || ""; 
      const temperature = typeof workConfig.temperature === 'number' ? workConfig.temperature : 0.7;
      
      this.llm = new ChatOpenAI({
        modelName: modelName,
        systemPrompt: systemPrompt,
        temperature: temperature,
        verbose: true // 启用详细日志
      });
    } catch (error) {
      throw error;
    }

    // 注册管道类型处理器
    this.registerHandler(PipelineType.CHAT, this._handleChat.bind(this));
    this.registerHandler(PipelineType.USER_MESSAGE, this._handleUserMessage.bind(this));
  }

  /**
   * @private
   * @method _handleChat
   * @description 执行聊天逻辑的核心处理方法。
   * @param {Pipeline} pipeline - 输入管道实例。
   * @returns {Promise<Pipeline>} 处理后的输出管道实例。
   * @throws {Error} 如果输入数据不符合要求。
   */
  async _handleChat(pipeline) {
    // this.setStatus(BaseNode.Status.RUNNING); // 状态管理由外部或BaseNode.process处理
    try {
      // 从 _workConfig 获取 systemPrompt
      const workConfig = this.getWorkConfig();
      const systemPrompt = workConfig.systemPrompt || ""; // 为 systemPrompt 提供默认值

      // 获取文本和搜索结果数据
      const textItems = pipeline.getByType(DataType.TEXT);
      console.log('ChatNode: 文本项目', JSON.stringify(textItems));
      
      // 防御性地处理检索项，确保 item.data 和 item.data.pageContent 存在
      const searchItems = pipeline.getByType(DataType.RETRIEVAL)
        .filter(item => item && item.data && item.data.pageContent)
        .map(item => ({ data: item.data.pageContent }));
      console.log('ChatNode: 搜索项目', JSON.stringify(searchItems));

      const items = [...textItems, ...searchItems];
      if (items.length === 0) {
        throw new Error('ChatNode: 未找到可处理的文本或搜索结果，无法执行聊天');
      }

      // 创建新的输出管道，而不是修改输入管道
      const outputPipeline = new Pipeline(pipeline.getPipelineType());

      for (const item of items) {
        const text = item.data;
        
        // 确保文本不是 undefined 或 null
        if (text === undefined || text === null) {
          console.warn('ChatNode: 跳过处理，因为项目数据为空');
          continue;
        }
        
        // 确保文本是字符串
        const textContent = typeof text === 'string' ? text : String(text);
        
        // 使用 invoke 方法传入 LangChain 消息实例数组
        const response = await this.llm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(textContent)
        ]);
        // 在LangChain JS中，ChatOpenAI.invoke 返回包含 content 属性的 AIMessage 对象
        outputPipeline.add(DataType.TEXT, response.content);
      }
      // this.setStatus(BaseNode.Status.COMPLETED);
      return outputPipeline;
    } catch (error) {
      // this.setStatus(BaseNode.Status.FAILED);
      // 建议向上抛出错误，让调用者处理
      console.error('ChatNode _handleChat error:', error);
      throw new Error(`ChatNode 处理失败: ${error.message}`);
    }
  }

  /**
   * @method _handleUserMessage
   * @description 处理用户消息管道。
   * @param {Pipeline} pipeline - 输入管道实例。
   * @returns {Promise<Pipeline>} 处理后的输出管道实例。
   */
  async _handleUserMessage(pipeline) {  
    try {
      // 从配置获取系统提示词
      const workConfig = this.getWorkConfig();
      const systemPrompt = workConfig.systemPrompt || "";

      // 获取用户消息文本
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('ChatNode: 用户消息管道中未找到文本数据');
      }

      // 创建新的输出管道，类型为CHAT
      const outputPipeline = new Pipeline(PipelineType.CHAT);

      // 处理所有文本项
      for (const item of textItems) {
        const userMessage = item.data;
        
        // 跳过空消息
        if (userMessage === undefined || userMessage === null) {
          console.warn('ChatNode: 跳过处理，因为用户消息为空');
          continue;
        }
        
        // 规范化消息内容为字符串
        const messageContent = typeof userMessage === 'string' ? userMessage : String(userMessage);
        
        console.log(`ChatNode: 处理用户消息: "${messageContent}"`);
        
        // 使用LangChain JS生成回复
        const response = await this.llm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(messageContent)
        ]);
        
        // 将回复添加到输出管道
        outputPipeline.add(DataType.TEXT, response.content);
        
        console.log(`ChatNode: 生成回复: "${response.content}"`);
      }
      
      return outputPipeline;
    } catch (error) {
      console.error('ChatNode _handleUserMessage error:', error);
      throw new Error(`ChatNode 处理用户消息失败: ${error.message}`);
    }
  }


}

module.exports = ChatNode; 