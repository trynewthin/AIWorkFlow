/**
 * @file electron/config/nodes/chat.js
 * @description ChatNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'chat',
  name: 'llm对话节点',
  type: 'model',
  tag: 'chat',
  description: '使用 LangChain JS 进行对话生成',
  version: '1.0.0',
  supportedInputPipelines: [PipelineType.USER_MESSAGE],
  supportedOutputPipelines: [PipelineType.CHAT]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: 'Chat Completion Node',
  status: 'idle',
  position: {
    x: 0,
    y: 0
  }
};

/**
 * @description 默认运行时配置
 * @type {object}
 */
const defaultWorkConfig = {
  model: 'qwen-plus',
  systemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。',
  temperature: 0.7
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 