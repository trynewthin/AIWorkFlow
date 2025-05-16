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
const { RetrievalPipeTools } = require('../../pipeline/tools');

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
    // 注册检索管道处理器
    this.registerHandler(PipelineType.RETRIEVAL, this._handleRetrievalPipeline.bind(this));
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

  /**
   * @method _handleRetrievalPipeline
   * @description 处理检索管道，提取查询文本作为用户输入，检索文档作为系统提示词的补充。
   * @param {Pipeline} pipeline - 检索管道实例。
   * @returns {Promise<Pipeline>} 处理后的输出管道实例。
   */
  async _handleRetrievalPipeline(pipeline) {
    try {
      // 获取基础配置
      const { systemPrompt = '' } = this.getWorkConfig();
      
      // 从检索管道中提取用户查询文本
      const queryText = RetrievalPipeTools.readText(pipeline);
      if (!queryText) {
        throw new Error('ChatNode: 检索管道中未找到查询文本');
      }
      
      // 从检索管道中提取检索文档
      const retrievalDocs = RetrievalPipeTools.read(pipeline);
      
      // 如果存在检索文档，将其格式化为上下文
      let contextText = '';
      if (retrievalDocs && retrievalDocs.length > 0) {
        contextText = this._formatRetrievalDocsAsContext(retrievalDocs);
        console.log(`ChatNode: 成功提取 ${retrievalDocs.length} 个检索文档作为上下文`);
      } else {
        console.log('ChatNode: 检索管道中没有找到相关文档');
      }
      
      // 组合系统提示词和检索上下文
      const enhancedSystemPrompt = this._buildEnhancedSystemPrompt(systemPrompt, contextText);
      
      // 创建新的输出管道
      const outputPipeline = new Pipeline(PipelineType.TEXT);
      
      // 调用LLM生成回复
      const response = await this.llm.invoke([
        new SystemMessage(enhancedSystemPrompt),
        new HumanMessage(queryText)
      ]);
      
      // 将回复添加到输出管道
      outputPipeline.add(DataType.TEXT, response.content);
      
      return outputPipeline;
    } catch (error) {
      throw new Error(`ChatNode 处理检索管道失败: ${error.message}`);
    }
  }
  
  /**
   * @private
   * @method _formatRetrievalDocsAsContext
   * @description 将检索文档格式化为上下文字符串
   * @param {Array} docs - 检索文档数组
   * @returns {string} 格式化后的上下文字符串
   */
  _formatRetrievalDocsAsContext(docs) {
    let context = '以下是与查询相关的参考文档：\n\n';
    
    docs.forEach((doc, index) => {
      // 检查文档是否包含pageContent属性
      const content = doc.pageContent || (doc.document ? doc.document.pageContent : '');
      if (content) {
        context += `文档 ${index + 1}：\n${content}\n\n`;
      }
    });
    
    return context;
  }
  
  /**
   * @private
   * @method _buildEnhancedSystemPrompt
   * @description 构建增强的系统提示词，结合原始提示词和检索上下文
   * @param {string} originalPrompt - 原始系统提示词
   * @param {string} contextText - 检索上下文
   * @returns {string} 增强后的系统提示词
   */
  _buildEnhancedSystemPrompt(originalPrompt, contextText) {
    if (!contextText) {
      return originalPrompt;
    }
    
    // 如果原始提示词存在，添加分隔符
    const separator = originalPrompt ? '\n\n' : '';
    
    // 添加使用说明
    const instruction = '请基于以上参考文档回答用户的问题。如果参考文档中没有相关信息，请基于你自己的知识回答，但需明确告知用户哪些内容来自参考文档，哪些是你自己的知识。';
    
    return originalPrompt + separator + contextText + '\n\n' + instruction;
  }

}

module.exports = ChatNode; 