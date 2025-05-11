// 聊天节点（基于 LangChain JS）
const IOConfigs = require('../configs/IOconfigs');
const PIPconfigs = require('../configs/PIPconfigs');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

class ChatNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // 聊天配置，包括模型和系统提示
    this.chatConfig = {
      model: config.model || ChatNode.aiConfig.defaultModel,
      systemPrompt: config.systemPrompt || ChatNode.aiConfig.defaultSystemPrompt
    };
    // TODO: 创建 LangChain ChatOpenAI 实例
    this.llm = new ChatOpenAI({
      modelName: this.chatConfig.model,
      temperature: config.temperature != null ? config.temperature : ChatNode.defaultConfig.temperature
    });
  }

  // 执行聊天，根据用户输入返回模型回复
  async execute(pipeline) {
    this.setStatus(ChatNode.Status.RUNNING);
    try {
      // 获取文本和搜索结果数据
      const textItems = pipeline.getByType(IOConfigs.DataType.TEXT);
      const searchItems = pipeline.getByType(IOConfigs.DataType.SEARCH_RESULTS)
        .map(item => ({ data: item.data.pageContent }));
      const items = [...textItems, ...searchItems];
      // 如果没有任何可处理的文本，抛出错误
      if (items.length === 0) {
        throw new Error('未找到可处理的文本或搜索结果，无法执行聊天');
      }
      
      // 处理每一条文本数据或搜索结果
      for (const item of items) {
        const text = item.data;
        
        const response = await this.llm.call([
          { role: 'system', content: this.chatConfig.systemPrompt },
          { role: 'user', content: text }
        ]);
        
        // 将结果添加到管道
        pipeline.add(IOConfigs.DataType.TEXT, response);
      }
      
      this.setStatus(ChatNode.Status.COMPLETED);
      return pipeline;
    } catch (error) {
      this.setStatus(ChatNode.Status.FAILED);
      throw error;
    }
  }

  // 设置温度
  setTemperature(temp) {
    this.llm.temperature = temp;
  }

  // 获取温度
  getTemperature() {
    return this.llm.temperature;
  }

  // 设置系统提示词
  setSystemPrompt(prompt) {
    this.chatConfig.systemPrompt = prompt;
  }

  // 获取系统提示词
  getSystemPrompt() {
    return this.chatConfig.systemPrompt;
  }

  // TODO: 返回自定义配置，用于序列化
  getCustomConfig() {
    return {
      model: this.chatConfig.model,
      systemPrompt: this.chatConfig.systemPrompt,
      temperature: this.getTemperature()
    };
  }

  // TODO: 设置自定义配置，用于反序列化
  setCustomConfig(config) {
    if (config.model) this.chatConfig.model = config.model;
    if (config.systemPrompt) this.chatConfig.systemPrompt = config.systemPrompt;
    if (config.temperature != null) this.setTemperature(config.temperature);
  }
}

// 默认配置
ChatNode.defaultConfig = {
  temperature: 0.7
};

// AI 调用配置
ChatNode.aiConfig = {
  defaultModel: 'qwen-plus',
  defaultSystemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。'
};

// 节点元数据
ChatNode.nodeConfig = {
  type: 'model',
  tag: 'chat',
  name: 'chat-completion-lc',
  description: '使用 LangChain JS 进行对话生成',
  supportedInputPipelines: [
    PIPconfigs.PipelineType.CHAT,
    PIPconfigs.PipelineType.LLM,
    PIPconfigs.PipelineType.TEXT_PROCESSING,
    PIPconfigs.PipelineType.SEARCH
  ],
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.CHAT,
    PIPconfigs.PipelineType.LLM,
    PIPconfigs.PipelineType.TEXT_PROCESSING
  ],
  version: '1.0.0'
};

module.exports = ChatNode; 