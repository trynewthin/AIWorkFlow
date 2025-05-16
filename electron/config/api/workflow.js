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
  },
  // 新增用户相关的工作流接口
  'controller/workflow/getCurrentUserWorkflows': {
    controller: 'workflow',
    action: 'getCurrentUserWorkflows',
    desc: '获取当前登录用户的工作流列表'
  },
  'controller/workflow/checkWorkflowOwnership': {
    controller: 'workflow',
    action: 'checkWorkflowOwnership',
    desc: '检查当前用户是否为工作流所有者'
  },
  'controller/workflow/transferWorkflowOwnership': {
    controller: 'workflow',
    action: 'transferWorkflowOwnership',
    desc: '转移工作流所有权到其他用户'
  },
  'controller/workflow/getWorkflowOwner': {
    controller: 'workflow',
    action: 'getWorkflowOwner',
    desc: '获取工作流所有者信息'
  }
}; 