/**
 * @file electron/config/nodes/chunk.js
 * @description ChunkNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'chunk',
  name: 'text-to-chunks-lc',
  type: 'processor',
  tag: 'split',
  description: '使用LangChain JS加载器和分块策略将文本或文件分割为多个块',
  version: '1.0.0',
  supportedInputPipelines: [PipelineType.PROMPT, PipelineType.CUSTOM],
  supportedOutputPipelines: [PipelineType.CHUNK]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '文本分块节点',
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
  chunkSize: 1000,
  chunkOverlap: 200
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 