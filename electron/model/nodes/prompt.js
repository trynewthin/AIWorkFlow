/**
 * @class PromptNode
 * @description 文本提示词优化节点，使用大模型对用户输入的提示词进行清晰、有条理的优化
 */
const IOConfigs = require('../configs/IOconfigs');
const PIPconfigs = require('../configs/PIPconfigs');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

class PromptNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // LLM 调用配置
    this.chatConfig = {
      model: config.model || PromptNode.aiConfig.defaultModel, // 聊天模型
      systemPrompt: config.systemPrompt || PromptNode.aiConfig.defaultSystemPrompt // 系统提示
    };
    // TODO: 创建 LangChain LLM 实例
    this.llm = new ChatOpenAI({
      modelName: this.chatConfig.model,
      temperature: config.temperature != null ? config.temperature : PromptNode.defaultConfig.temperature
    });
  }

  /**
   * 执行优化：使用大模型优化提示词，基于 Pipeline 流
   * @param {Pipeline} pipeline - 管道流实例
   * @returns {Pipeline} 优化后的管道流实例
   */
  async execute(pipeline) {
    this.setStatus(PromptNode.Status.RUNNING);
    try {
      // 获取文本数据
      const textItems = pipeline.getByType(IOConfigs.DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法优化提示词');
      }
      // 处理每条文本，添加优化结果
      for (const item of textItems) {
        const optimized = await this.llm.call([
          { role: 'system', content: this.chatConfig.systemPrompt },
          { role: 'user', content: item.data }
        ]);
        pipeline.add(IOConfigs.DataType.TEXT, optimized);
      }
      this.setStatus(PromptNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(PromptNode.Status.FAILED);
      throw error;
    }
  }


  // TODO: 返回自定义配置，用于序列化
  getCustomConfig() {
    return {
      model: this.chatConfig.model,
      systemPrompt: this.chatConfig.systemPrompt,
      temperature: this.llm.temperature
    };
  }

  // TODO: 设置自定义配置，用于反序列化
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
    PIPconfigs.PipelineType.PROMPT,
    PIPconfigs.PipelineType.TEXT_PROCESSING,
    PIPconfigs.PipelineType.LLM
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.PROMPT,
    PIPconfigs.PipelineType.TEXT_PROCESSING,
    PIPconfigs.PipelineType.LLM
  ],
  version: '1.0.0'
};

// AI 调用配置
PromptNode.aiConfig = {
  defaultModel: 'qwen-plus', // 默认聊天模型
  defaultSystemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。'
};

module.exports = PromptNode; 