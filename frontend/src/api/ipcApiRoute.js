/**
 * IPC 通信路由
 */
const ipcApiRoute = {
  checkConnection: 'controller/connection/check',
  // 上传文件相关接口
  uploadFile: 'controller/upload/uploadFile',
  listFiles: 'controller/upload/listFiles',
  getFileInfo: 'controller/upload/getFileInfo',
  deleteFile: 'controller/upload/deleteFile',
  getFilePath: 'controller/upload/getFilePath',
  // 知识库相关接口
  listBases: 'controller/knowledge/listBases',
  createBase: 'controller/knowledge/createBase',
  listDocuments: 'controller/knowledge/listDocuments',
  getDocumentChunks: 'controller/knowledge/getDocumentChunks',
  ingestFromPath: 'controller/knowledge/ingestFromPath',
  getRetriever: 'controller/knowledge/getRetriever',
  deleteDocument: 'controller/knowledge/deleteDocument',
  deleteBase: 'controller/knowledge/deleteBase',
  // 工作流相关接口
  createWorkflow: 'controller/workflow/createWorkflow',
  getWorkflow: 'controller/workflow/getWorkflow',
  listWorkflows: 'controller/workflow/listWorkflows',
  updateWorkflow: 'controller/workflow/updateWorkflow',
  deleteWorkflow: 'controller/workflow/deleteWorkflow',
  addNode: 'controller/workflow/addNode',
  updateNode: 'controller/workflow/updateNode',
  deleteNode: 'controller/workflow/deleteNode',
  moveNode: 'controller/workflow/moveNode',
  getNodeTypes: 'controller/workflow/getNodeTypes',
  executeWorkflow: 'controller/workflow/executeWorkflow',
  // 工作流用户相关接口
  getCurrentUserWorkflows: 'controller/workflow/getCurrentUserWorkflows',
  checkWorkflowOwnership: 'controller/workflow/checkWorkflowOwnership',
  transferWorkflowOwnership: 'controller/workflow/transferWorkflowOwnership',
  getWorkflowOwner: 'controller/workflow/getWorkflowOwner',
  // 工作流对话相关接口
  createWorkflowConversation: 'controller/workflow/createWorkflowConversation',
  getWorkflowCurrentConversation: 'controller/workflow/getWorkflowCurrentConversation',
  getWorkflowConversations: 'controller/workflow/getWorkflowConversations',
  getConversationMessages: 'controller/workflow/getConversationMessages',
  addUserMessage: 'controller/workflow/addUserMessage',
  addAIMessage: 'controller/workflow/addAIMessage',
  deleteConversation: 'controller/workflow/deleteConversation',
  getConversationStats: 'controller/workflow/getConversationStats',
  exportConversationAsJson: 'controller/workflow/exportConversationAsJson',
  executeWorkflowWithConversation: 'controller/workflow/executeWorkflowWithConversation',
  // 配置相关接口
  getConfigNodeTypes: 'controller/config/getNodeTypes',
  getNodeConfigByType: 'controller/config/getNodeConfigByType',
  getDefaultFlowConfig: 'controller/config/getDefaultFlowConfig',
  getDefaultWorkConfig: 'controller/config/getDefaultWorkConfig',
  // 用户相关接口
  userRegister: 'controller/user/register',
  userLogin: 'controller/user/login',
  userLoginByKey: 'controller/user/loginByKey',
  userLogout: 'controller/user/logout',
  userGetCurrentUser: 'controller/user/getCurrentUser',
  userGetAllUsers: 'controller/user/getAllUsers',
  userUpdateUser: 'controller/user/updateUser',
  userDeleteUser: 'controller/user/deleteUser',
  userGenerateKey: 'controller/user/generateKey',
  userGenerateKeyForCurrentUser: 'controller/user/generateKeyForCurrentUser',
  userGetUserKeys: 'controller/user/getUserKeys',
  userGetCurrentUserKeys: 'controller/user/getCurrentUserKeys',
  userUpdateKey: 'controller/user/updateKey',
  userDeleteKey: 'controller/user/deleteKey',
  userVerifyKey: 'controller/user/verifyKey'
};

export default ipcApiRoute; 