/**
 * @file electron/config/pipeline/DataType.js
 * @description 管道中传输的数据类型枚举
 */
const DataType = {
  /** 通用任意数据 */
  ANY: 'any',
  /** 文本字符串 */
  TEXT: 'text',
  /** 文本字符串数组 */
  TEXTS: 'texts',
  /** 文档对象，包含 pageContent 和 metadata */
  DOCUMENT: 'document',
  /** 嵌入向量 */
  EMBEDDING: 'embedding',
  /** 检索结果，含 score */
  RETRIEVAL: 'retrieval',
  /** 文本块，包含文本内容和元数据 */
  CHUNK: 'chunk',
  // … 如有更多类型可继续添加

  
  
};

module.exports = DataType; 