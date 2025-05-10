// 聊天节点（基于 LangChain JS）
const IOConfigs = require('../configs/IOconfigs');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

class ChatNode extends BaseNode {
  constructor(externalConfig = {}) {
    super(externalConfig);
    // TODO: 聊天配置，包括模型和系统提示
    this.chatConfig = {
      model: externalConfig.model || ChatNode.aiConfig.defaultModel,
      systemPrompt: externalConfig.systemPrompt || ChatNode.aiConfig.defaultSystemPrompt
    };
    // TODO: 创建 LangChain ChatOpenAI 实例
    this.llm = new ChatOpenAI({
      modelName: this.chatConfig.model,
      temperature: externalConfig.temperature || ChatNode.defaultConfig.temperature
    });
  }

  // TODO: 执行聊天，根据用户输入返回模型回复
  async execute(text) {
    this.setStatus(ChatNode.Status.RUNNING);
    try {
      const response = await this.llm.call([
        { role: 'system', content: this.chatConfig.systemPrompt },
        { role: 'user', content: text }
      ]);
      this.setStatus(ChatNode.Status.COMPLETED);
      return response;
    } catch (error) {
      this.setStatus(ChatNode.Status.FAILED);
      throw error;
    }
  }

  // TODO: 设置温度
  setTemperature(temp) {
    this.llm.temperature = temp;
  }

  // TODO: 获取温度
  getTemperature() {
    return this.llm.temperature;
  }

  // TODO: 设置系统提示词
  setSystemPrompt(prompt) {
    this.chatConfig.systemPrompt = prompt;
  }

  // TODO: 获取系统提示词
  getSystemPrompt() {
    return this.chatConfig.systemPrompt;
  }
}

// TODO: 默认配置
ChatNode.defaultConfig = {
  temperature: 0.7
};

// TODO: AI 调用配置
ChatNode.aiConfig = {
  defaultModel: 'qwen-plus',
  defaultSystemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。'
};

// TODO: 节点元数据
ChatNode.nodeConfig = {
  type: 'model',
  tag: 'chat',
  name: 'chat-completion-lc',
  description: '使用 LangChain JS 进行对话生成',
  input: IOConfigs.DataType.TEXT,
  output: IOConfigs.DataType.TEXT,
  version: '1.0.0'
};

module.exports = ChatNode; 