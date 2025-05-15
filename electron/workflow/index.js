/**
 * @file electron/core/workflow/index.js
 * @description 工作流模块统一导出入口
 */

const {
  Workflow,
  WorkflowManager,
  getWorkflowManager,
  WorkflowExecutor,
  getWorkflowExecutor
} = require('./models');

const { WorkflowService, getWorkflowService } = require('./services/WorkflowService');
const WorkflowController = require('./controllers/workflow');

module.exports = {
  Workflow,
  WorkflowManager,
  getWorkflowManager,
  WorkflowExecutor,
  getWorkflowExecutor,
  WorkflowService,
  getWorkflowService,
  WorkflowController
}; 