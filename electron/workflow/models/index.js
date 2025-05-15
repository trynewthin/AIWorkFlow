/**
 * @file electron/core/workflow/models/index.js
 * @description 工作流模型和服务的统一导出
 */

const Workflow = require('./Workflow');
const { WorkflowManager, getWorkflowManager } = require('./WorkflowManager');
const { WorkflowExecutor, getWorkflowExecutor } = require('./WorkflowExecutor');

module.exports = {
  Workflow,
  WorkflowManager,
  getWorkflowManager,
  WorkflowExecutor,
  getWorkflowExecutor,
}; 