// TODO: 定义管道数据类型枚举
const DataType = {
  DATA: 'data',               // 通用数据类型
  PATH: 'path',               // 文件或目录路径
  TEXT: 'text',               // 文本字符串，包含查询、回答等
  TEXT_ARRAY: 'text[]',       // 文本字符串数组
  DOCUMENT_ARRAY: 'Document[]', // 文档对象数组，包含 pageContent 和 metadata
  EMBEDDING: 'embedding',      // 单个嵌入向量
  EMBEDDING_ARRAY: 'number[][]', // 嵌入向量数组
  INDEX: 'HNSWIndex',          // HNSW 索引实例
  SEARCH_RESULTS: 'search_results', // 检索结果数组，包含文本、metadata、score

};

module.exports = DataType;
