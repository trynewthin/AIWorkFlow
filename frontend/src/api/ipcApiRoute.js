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
  deleteBase: 'controller/knowledge/deleteBase'
};

export default ipcApiRoute; 