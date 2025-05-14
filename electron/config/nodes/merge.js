/**
 * @file electron/config/nodes/merge.js
 * @description MergeNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'merge',
  name: 'pipeline-merge-node',
  type: 'utility',
  tag: 'merge',
  description: '合并多个 Pipeline，并设置合并后管道类型',
  version: '1.0.0',
  supportedInputPipelines: [],
  supportedOutputPipelines: []
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '合并节点',
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
  outputType: PipelineType.CUSTOM,
  mergeCount: 2,
  immediateMerge: true
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 