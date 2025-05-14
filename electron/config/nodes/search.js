/**
 * @file electron/config/nodes/search.js
 * @description SearchNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'search',
  name: 'text-to-retrieve-hnsw',
  type: 'retriever',
  tag: 'retrieve',
  description: '将文本向量化并使用 HNSW 索引检索相关文档',
  version: '1.0.0',
  supportedInputPipelines: [PipelineType.CHAT, PipelineType.EMBEDDING],
  supportedOutputPipelines: [PipelineType.SEARCH]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '检索引擎节点',
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
  topK: 5,
  knowledgeBaseId: null,
  hnswDimension: 1536
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 