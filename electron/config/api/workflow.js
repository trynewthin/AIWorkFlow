/**
 * @file electron/config/api/workflow.js
 * @description IPC 路由：工作流相关接口
 */
module.exports = {
  'controller/workflow/createWorkflow': {
    controller: 'workflow',
    action: 'createWorkflow'
  },
  'controller/workflow/getWorkflow': {
    controller: 'workflow',
    action: 'getWorkflow'
  },
  'controller/workflow/listWorkflows': {
    controller: 'workflow',
    action: 'listWorkflows'
  },
  'controller/workflow/updateWorkflow': {
    controller: 'workflow',
    action: 'updateWorkflow'
  },
  'controller/workflow/deleteWorkflow': {
    controller: 'workflow',
    action: 'deleteWorkflow'
  },
  'controller/workflow/addNode': {
    controller: 'workflow',
    action: 'addNode'
  },
  'controller/workflow/updateNode': {
    controller: 'workflow',
    action: 'updateNode'
  },
  'controller/workflow/deleteNode': {
    controller: 'workflow',
    action: 'deleteNode'
  },
  'controller/workflow/moveNode': {
    controller: 'workflow',
    action: 'moveNode'
  },
  'controller/workflow/getNodeTypes': {
    controller: 'workflow',
    action: 'getNodeTypes'
  },
  'controller/workflow/executeWorkflow': {
    controller: 'workflow',
    action: 'executeWorkflow'
  }
}; 