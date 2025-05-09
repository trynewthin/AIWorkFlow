/**
 * 主进程与渲染进程通信频道定义
 * Definition of communication channels between main process and rendering process
 */
const ipcApiRoute = {
  // 测试API
  test: 'controller/example/test',
  
  // 知识库管理相关API
  knowledgeBase: {
    create: 'controller/knowledgeBase/createKnowledgeBase',            // 创建知识库
    list: 'controller/knowledgeBase/listKnowledgeBases',               // 知识库列表
    detail: 'controller/knowledgeBase/getKnowledgeBaseDetail',         // 知识库详情
    update: 'controller/knowledgeBase/updateKnowledgeBase',            // 更新知识库
    delete: 'controller/knowledgeBase/deleteKnowledgeBase',            // 删除知识库
    clear: 'controller/knowledgeBase/clearKnowledgeBase',              // 清空知识库
    addDocument: 'controller/knowledgeBase/addDocument',               // 添加文档
    addDocuments: 'controller/knowledgeBase/addDocuments',             // 批量添加文档
    cancelProgress: 'controller/knowledgeBase/cancelProgressCallback'  // 取消进度回调
  }
}

export {
  ipcApiRoute
}

