/**
 * @file electron/config/nodes/prompt.js
 * @description PromptNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'prompt_optimizer',
  name: 'prompt-organizer-lc',
  type: 'processor',
  tag: 'prompt',
  description: '组织用户提示词字符串，进行格式化处理或优化',
  version: '1.0.0',
  supportedInputPipelines: [PipelineType.USER_MESSAGE],
  supportedOutputPipelines: [PipelineType.USER_MESSAGE]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '提示词优化节点',
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
  systemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。',
  temperature: 0.7
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 