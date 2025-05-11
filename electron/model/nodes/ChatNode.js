/**
 * @file electron/model/nodes/chat.js
 * @description 聊天节点（基于 LangChain JS）
 */
const { DataType, PipelineType } = require('../../config/pipeline');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

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

    this.llm = new ChatOpenAI({
      model: workConfig.model,
      temperature: workConfig.temperature
    });

    // 注册管道类型处理器
    this.registerHandler(PipelineType.CHAT, this._handleChat.bind(this));
    this.registerHandler(PipelineType.PROMPT, this._handleChat.bind(this));
    this.registerHandler(PipelineType.RETRIEVAL, this._handleChat.bind(this));
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
      const systemPrompt = workConfig.systemPrompt;

      // 获取文本和搜索结果数据
      const textItems = pipeline.getByType(DataType.TEXT);
      const searchItems = pipeline.getByType(DataType.RETRIEVAL)
        .map(item => ({ data: item.data.pageContent })); // 假设 RETRIEVAL 类型的数据有 pageContent

      const items = [...textItems, ...searchItems];
      if (items.length === 0) {
        throw new Error('ChatNode: 未找到可处理的文本或搜索结果，无法执行聊天');
      }

      // 创建新的输出管道，而不是修改输入管道
      const outputPipeline = new Pipeline(pipeline.getPipelineType());

      for (const item of items) {
        const text = item.data;
        const response = await this.llm.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ]);
        // 在LangChain JS中，ChatOpenAI的invoke直接返回AIMessage对象或字符串，取决于配置和模型
        // 我们假设它返回一个包含 content 属性的对象 (AIMessage)
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
}

module.exports = ChatNode; 