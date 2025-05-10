/**
 * @class PromptNode
 * @description 文本提示词优化节点，使用大模型对用户输入的提示词进行清晰、有条理的优化
 */
const IOConfigs = require('../configs/IOconfigs');
const { ChatOpenAI } = require('@langchain/openai');
const BaseNode = require('./baseNode');

class PromptNode extends BaseNode {
  constructor(externalConfig = {}) {
    super(externalConfig);
    // LLM 调用配置
    this.chatConfig = {
      model: externalConfig.model || PromptNode.aiConfig.defaultModel, // 聊天模型
      systemPrompt: externalConfig.systemPrompt || PromptNode.aiConfig.defaultSystemPrompt // 系统提示
    };
    // 创建 LangChain LLM 实例
    this.llm = new ChatOpenAI({
      modelName: this.chatConfig.model,
      temperature: externalConfig.temperature || PromptNode.defaultConfig.temperature
    });
  }

  /**
   * 执行优化：使用大模型优化提示词
   * @param {string} text - 用户输入提示词
   * @returns {string} 优化后的提示词
   */
  async execute(text) {
    this.setStatus(PromptNode.Status.RUNNING);
    try {
      // 使用 LangChain LLM 调用
      const optimizedPrompt = await this.llm.call([
        { role: 'system', content: this.chatConfig.systemPrompt },
        { role: 'user', content: text }
      ]);
      this.setStatus(PromptNode.Status.COMPLETED);
      return optimizedPrompt;
    } catch (error) {
      this.setStatus(PromptNode.Status.FAILED);
      throw error;
    }
  }

  // 输入/输出类型及状态相关方法已提取至基类 BaseNode
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
  input: IOConfigs.DataType.TEXT,
  output: IOConfigs.DataType.TEXT,
  version: '1.0.0'
};

// AI 调用配置
PromptNode.aiConfig = {
  defaultModel: 'qwen-plus', // 默认聊天模型
  defaultSystemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。'
};

module.exports = PromptNode; 