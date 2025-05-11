/**
 * @module workflow
 * @description 工作流模型与执行引擎，提供基于节点的工作流定义与执行能力
 */
const Step = require('./Step');
const Workflow = require('./Workflow');
const Engine = require('./Engine');
const { WorkflowConfig, getWorkflowConfig } = require('./WorkflowConfig');

module.exports = {
  Step,
  Workflow,
  Engine,
  WorkflowConfig,
  getWorkflowConfig
}; 