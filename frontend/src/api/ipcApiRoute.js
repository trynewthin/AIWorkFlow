/**
 * IPC通信路由
 */
const ipcApiRoute = {
  checkConnection: 'controller/connection/check',
  // 知识库相关接口
  listBases: 'controller/knowledge/listBases',
  // 新建知识库
  createBase: 'controller/knowledge/createBase',
  listDocuments: 'controller/knowledge/listDocuments',
  getDocumentChunks: 'controller/knowledge/getDocumentChunks',
  ingestDocument: 'controller/knowledge/ingestDocument',
  deleteDocument: 'controller/knowledge/deleteDocument',
  deleteBase: 'controller/knowledge/deleteBase'
};

export default ipcApiRoute; 