/**
 * @file electron/config/pipeline/PipelineType.js
 * @description 语义化管道类型枚举及常用辅助方法
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
};

/**
 * @description 判断是否为合法管道类型
 * @param {string} type 
 * @returns {boolean}
 */
function isValidPipelineType(type) {
  return Object.values(PipelineType).includes(type);
}

/**
 * @description 获取所有管道类型数组
 * @returns {string[]}
 */
function getAllPipelineTypes() {
  return Object.values(PipelineType);
}

/**
 * @description 根据节点类型推荐常用的管道类型
 * @param {string} nodeType 
 * @returns {string[]}
 */
function getRecommendedPipelineTypes(nodeType) {
  switch (nodeType) {
    case 'chat':   return [PipelineType.CHAT];
    case 'prompt': return [PipelineType.PROMPT];
    case 'search': return [PipelineType.RETRIEVAL];
    case 'chunk':  return [PipelineType.CHUNK]; 
    case 'embedding': return [PipelineType.EMBEDDING];
    // … 可根据业务继续补充
    default:       return [PipelineType.CUSTOM];
  }
}

module.exports = {
  PipelineType,
  isValidPipelineType,
  getAllPipelineTypes,
  getRecommendedPipelineTypes
}; 