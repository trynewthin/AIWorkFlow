/**
 * @class PromptNode
 * @description 文本提示词优化节点，使用大模型对用户输入的提示词进行清晰、有条理的优化
 */
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

class PromptNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {string} [config.model] - LLM 模型名称
   * @param {string} [config.systemPrompt] - 系统提示词
   * @param {number} [config.temperature] - LLM 温度参数
   */
  constructor(config = {}) {
    super(config);
    // LLM 调用配置
    this.chatConfig = {
      model: config.model || PromptNode.aiConfig.defaultModel, // 聊天模型
      systemPrompt: config.systemPrompt || PromptNode.aiConfig.defaultSystemPrompt // 系统提示
    };
    // 创建 LangChain LLM 实例
    this.llm = new ChatOpenAI({
      modelName: this.chatConfig.model,
      temperature: config.temperature != null ? config.temperature : PromptNode.defaultConfig.temperature
    });

    // 注册支持的管道类型处理器
    this.registerHandler(PipelineType.PROMPT, this._handlePromptOptimization.bind(this));
    this.registerHandler(PipelineType.TEXT_PROCESSING, this._handlePromptOptimization.bind(this));
    this.registerHandler(PipelineType.LLM, this._handlePromptOptimization.bind(this));
    // 注册默认的未支持类型处理器
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @private
   * @description 执行优化：使用大模型优化提示词，基于 Pipeline 流
   * @param {Pipeline} pipeline - 管道流实例
   * @returns {Promise<Pipeline>} 优化后的管道流实例
   */
  async _handlePromptOptimization(pipeline) {
    this.setStatus(PromptNode.Status.RUNNING);
    try {
      // 获取文本数据
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法优化提示词');
      }
      // 处理每条文本，添加优化结果
      for (const item of textItems) {
        const optimized = await this.llm.call([
          { role: 'system', content: this.chatConfig.systemPrompt },
          { role: 'user', content: item.data }
        ]);
        pipeline.add(DataType.TEXT, optimized);
      }
      this.setStatus(PromptNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(PromptNode.Status.FAILED);
      throw error;
    }
  }

  /**
   * @private
   * @description 处理不支持的管道类型，默认抛出错误。
   * @param {Pipeline} pipeline - 输入的管道实例。
   * @throws {Error} 当接收到不支持的管道类型时抛出。
   * @returns {Promise<Pipeline>}
   */
  async _defaultUnsupportedHandler(pipeline) {
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持处理 ${pipelineType} 类型的管道。`);
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      model: this.chatConfig.model,
      systemPrompt: this.chatConfig.systemPrompt,
      temperature: this.llm.temperature
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.model) this.chatConfig.model = config.model;
    if (config.systemPrompt) this.chatConfig.systemPrompt = config.systemPrompt;
    if (config.temperature != null) this.llm.temperature = config.temperature;
  }
}

// 默认配置
PromptNode.defaultConfig = {
  temperature: 0.7 // 默认温度
};

// 节点元数据
PromptNode.nodeConfig = {
  type: 'model',
  tag: 'prompt',
  name: 'prompt-organizer-lc',
  description: '组织用户提示词字符串，进行格式化处理',
  // 支持的输入管道类型
  supportedInputPipelines: [
    PipelineType.PROMPT,
    PipelineType.TEXT_PROCESSING,
    PipelineType.LLM
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PipelineType.PROMPT,
    PipelineType.TEXT_PROCESSING,
    PipelineType.LLM
  ],
  version: '1.0.0'
};

// AI 调用配置
PromptNode.aiConfig = {
  defaultModel: 'qwen-plus', // 默认聊天模型
  defaultSystemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。'
};

module.exports = PromptNode; 