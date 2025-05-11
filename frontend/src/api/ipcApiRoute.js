/**
 * IPC通信路由
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
  workflowList: 'controller/workflow/getWorkflowList',
  workflowDetail: 'controller/workflow/getWorkflowConfig',
  workflowSave: 'controller/workflow/createWorkflow',
  workflowUpdate: 'controller/workflow/updateWorkflow',
  workflowDelete: 'controller/workflow/deleteWorkflow',
  workflowRun: 'controller/workflow/executeWorkflow',
  workflowStatus: 'controller/workflow/getWorkflowStatus',
  workflowControl: 'controller/workflow/controlWorkflow'
};

export default ipcApiRoute; 