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
  },
  // 新增对话相关接口
  'controller/workflow/createWorkflowConversation': {
    controller: 'workflow',
    action: 'createWorkflowConversation',
    desc: '创建工作流对话轮次'
  },
  'controller/workflow/getWorkflowCurrentConversation': {
    controller: 'workflow',
    action: 'getWorkflowCurrentConversation',
    desc: '获取工作流当前关联的对话轮次'
  },
  'controller/workflow/getWorkflowConversations': {
    controller: 'workflow',
    action: 'getWorkflowConversations',
    desc: '获取工作流的所有对话轮次'
  },
  'controller/workflow/getConversationMessages': {
    controller: 'workflow',
    action: 'getConversationMessages',
    desc: '获取对话消息历史'
  },
  'controller/workflow/addUserMessage': {
    controller: 'workflow',
    action: 'addUserMessage',
    desc: '添加用户消息到对话'
  },
  'controller/workflow/addAIMessage': {
    controller: 'workflow',
    action: 'addAIMessage',
    desc: '添加AI消息到对话'
  },
  'controller/workflow/deleteConversation': {
    controller: 'workflow',
    action: 'deleteConversation',
    desc: '删除对话轮次'
  },
  'controller/workflow/getConversationStats': {
    controller: 'workflow',
    action: 'getConversationStats',
    desc: '获取对话统计信息'
  },
  'controller/workflow/exportConversationAsJson': {
    controller: 'workflow',
    action: 'exportConversationAsJson',
    desc: '导出对话历史为JSON'
  },
  'controller/workflow/executeWorkflowWithConversation': {
    controller: 'workflow',
    action: 'executeWorkflowWithConversation',
    desc: '执行工作流并记录对话（便捷方法）'
  }
}; 