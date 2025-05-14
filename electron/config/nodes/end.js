/**
 * @file electron/config/nodes/end.js
 * @description EndNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'end',
  name: '结束节点',
  type: 'utility',
  tag: 'end',
  description: '将管道转换为具体输出',
  version: '1.0.0',
  supportedInputPipelines: [PipelineType.CHAT],
  supportedOutputPipelines: [PipelineType.CUSTOM]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '结束处理节点',
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
const defaultWorkConfig = {};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 