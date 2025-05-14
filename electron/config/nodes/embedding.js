/**
 * @file electron/config/nodes/embedding.js
 * @description EmbeddingNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'embedding',
  name: 'text-to-embedding-lc',
  type: 'model',
  tag: 'embedding',
  description: '使用LangChain JS生成文本嵌入向量',
  version: '1.0.0',
  supportedInputPipelines: [
    PipelineType.EMBEDDING,
    PipelineType.CHUNK,
    PipelineType.PROMPT,
    PipelineType.USER_MESSAGE
  ],
  supportedOutputPipelines: [PipelineType.EMBEDDING]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '向量嵌入节点',
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
  model: 'text-embedding-v3',
  dimensions: 1024,
  batchSize: 512,
  stripNewLines: true,
  timeout: null
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 