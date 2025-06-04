/**
 * @file electron/core/configs/models/pipelineTypes.js
 * @description 定义管道数据类型 (DataType) 和管道语义类型 (PipelineType) 的数据模型
 */

/**
 * @description 管道中传输的数据类型枚举
 * @exports DataType
 * @enum {string}
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
  CHUNK: 'chunk'
  // … 如有更多类型可继续添加
};

/**
 * @description 语义化管道类型枚举
 * @exports PipelineType
 * @enum {string}
 */
const PipelineType = {
  /** 所有类型的管道都支持*/
  ALL: 'all',
  /** 聊天管道（处理 chat 场景） */
  CHAT: 'chat',
  /** 提示词处理管道（prompt → text） */
  PROMPT: 'prompt',
  /** 检索管道（query → documents） */
  RETRIEVAL: 'retrieval',
  /** 向量处理管道（documents → embeddings） */
  EMBEDDING: 'embedding',
  /** 自定义管道 */
  CUSTOM: 'custom',
  /** 文本块类型管道，包含分块后的文本段落 */
  CHUNK: 'chunk',
  /** 错误类型管道 */
  ERROR: 'error',
  /** 未知类型 */
  UNKNOWN: 'unknown',
  // … 如果有更多业务管道类型可在此添加
  /** 搜索结果管道 */
  SEARCH: 'search',
  /** 用户消息管道 */
  USER_MESSAGE: 'user_message',
  /** 文本管道 */
  TEXT: 'text'
};

module.exports = {
  DataType,
  PipelineType
}; 