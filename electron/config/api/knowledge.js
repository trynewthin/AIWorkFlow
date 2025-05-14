/**
 * @file electron/config/api/knowledge.js
 * @description IPC 路由：知识库相关接口
 */
module.exports = {
  'controller/knowledge/listBases': {
    controller: 'knowledge',
    action: 'listBases'
  },
  'controller/knowledge/createBase': {
    controller: 'knowledge',
    action: 'createBase'
  },
  'controller/knowledge/listDocuments': {
    controller: 'knowledge',
    action: 'listDocuments'
  },
  'controller/knowledge/getDocumentChunks': {
    controller: 'knowledge',
    action: 'getDocumentChunks'
  },
  'controller/knowledge/ingestFromPath': {
    controller: 'knowledge',
    action: 'ingestFromPath'
  },
  'controller/knowledge/getRetriever': {
    controller: 'knowledge',
    action: 'getRetriever'
  },
  'controller/knowledge/deleteDocument': {
    controller: 'knowledge',
    action: 'deleteDocument'
  },
  'controller/knowledge/deleteBase': {
    controller: 'knowledge',
    action: 'deleteBase'
  }
}; 