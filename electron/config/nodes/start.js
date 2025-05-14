/**
 * @file electron/config/nodes/start.js
 * @description StartNode 类型相关的静态、流程和运行时配置
 */
const { PipelineType, DataType } = require('../pipeline');

/**
 * @description 静态配置
 * @type {object}
 */
const classConfig = {
  id: 'start',
  name: '开始节点',
  type: 'utility',
  tag: 'start',
  description: '将原始输入封装为初始管道',
  version: '1.0',
  supportedInputPipelines: [PipelineType.ALL],
  supportedOutputPipelines: [PipelineType.ALL]
};

/**
 * @description 默认流程级配置
 * @type {object}
 */
const defaultFlowConfig = {
  nodeName: '开始节点',
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
  pipelineType: PipelineType.USER_MESSAGE,
  dataType: DataType.TEXT
};

module.exports = { classConfig, defaultFlowConfig, defaultWorkConfig }; 