/**
 * IPC 通信路由
 * 定义所有IPC通信的路由字符串
 */
interface IPCApiRoutes {
  // 连接检查
  checkConnection: string;
  
  // 上传文件相关接口
  uploadFile: string;
  listFiles: string;
  getFileInfo: string;
  deleteFile: string;
  getFilePath: string;
  
  // 知识库相关接口
  listBases: string;
  createBase: string;
  listDocuments: string;
  getDocumentChunks: string;
  ingestFromPath: string;
  getRetriever: string;
  deleteDocument: string;
  deleteBase: string;
  
  // 工作流相关接口
  createWorkflow: string;
  getWorkflow: string;
  listWorkflows: string;
  updateWorkflow: string;
  deleteWorkflow: string;
  addNode: string;
  updateNode: string;
  deleteNode: string;
  moveNode: string;
  getNodeTypes: string;
  executeWorkflow: string;
  
  // 工作流用户相关接口
  getCurrentUserWorkflows: string;
  checkWorkflowOwnership: string;
  transferWorkflowOwnership: string;
  getWorkflowOwner: string;
  
  // 配置相关接口
  getConfigNodeTypes: string;
  getNodeConfigByType: string;
  getDefaultFlowConfig: string;
  getDefaultWorkConfig: string;
  getAllPipelineTypes: string;
  
  // 用户相关接口
  userRegister: string;
  userLogin: string;
  userLoginByKey: string;
  userLogout: string;
  userGetCurrentUser: string;
  userGetAllUsers: string;
  userUpdateUser: string;
  userDeleteUser: string;
  userGenerateKey: string;
  userGenerateKeyForCurrentUser: string;
  userGetUserKeys: string;
  userGetCurrentUserKeys: string;
  userUpdateKey: string;
  userDeleteKey: string;
  userVerifyKey: string;
}

const ipcApiRoute: IPCApiRoutes = {
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
  // 配置相关接口
  getConfigNodeTypes: 'controller/config/getNodeTypes',
  getNodeConfigByType: 'controller/config/getNodeConfigByType',
  getDefaultFlowConfig: 'controller/config/getDefaultFlowConfig',
  getDefaultWorkConfig: 'controller/config/getDefaultWorkConfig',
  getAllPipelineTypes: 'controller/config/getAllPipelineTypes',
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