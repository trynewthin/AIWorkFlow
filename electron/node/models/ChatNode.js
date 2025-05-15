/**
 * @file electron/model/nodes/chat.js
 * @description 聊天节点（基于 LangChain JS）
 */
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { ChatOpenAI } = require('@langchain/openai');
// 导入 LangChain 消息类
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline/Pipeline');

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
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   *              在此处初始化LLM实例，因为它依赖于 _workConfig。
   */
  async onInit() {
    // 初始化LLM实例
    const { model: modelName = 'deepseek-v3', temperature = 0.7 } = this.getWorkConfig();
    this.llm = new ChatOpenAI({
      modelName,
      temperature,
      verbose: true
    });

    // 注册管道类型处理器
    this.registerHandler(PipelineType.TEXT, this._handleUserMessage.bind(this));
  }

  /**
   * @method _handleUserMessage
   * @description 处理用户消息管道。
   * @param {Pipeline} pipeline - 输入管道实例。
   * @returns {Promise<Pipeline>} 处理后的输出管道实例。
   */
  async _handleUserMessage(pipeline) {  
    try {
      const { systemPrompt = '' } = this.getWorkConfig();
      const textData = pipeline.getByType(DataType.TEXT);
      // 确保存在文本数据，规范化为字符串
      if (textData === undefined || textData === null) {
        throw new Error('ChatNode: 用户消息管道中未找到文本数据');
      }
      const messageContent = typeof textData === 'string' ? textData : String(textData);

      // 创建新的输出管道，类型为CHAT
      const outputPipeline = new Pipeline(PipelineType.TEXT);

      // 使用LangChain JS生成回复
      const response = await this.llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(messageContent)
      ]);

      // 将回复添加到输出管道
      outputPipeline.add(DataType.TEXT, response.content);
        
      // 返回处理后的输出管道
      return outputPipeline;

    } catch (error) {
      throw new Error(`ChatNode 处理用户消息失败: ${error.message}`);
    }
  }

}

module.exports = ChatNode; 