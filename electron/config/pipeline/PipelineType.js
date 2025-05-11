/**
 * @file electron/config/pipeline/PipelineType.js
 * @description 语义化管道类型枚举及常用辅助方法
 */
const PipelineType = {
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
  // … 如果有更多业务管道类型可在此添加
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
    // … 可根据业务继续补充
    default:       return [PipelineType.CUSTOM];
  }
}

export default {
  PipelineType,
  isValidPipelineType,
  getAllPipelineTypes,
  getRecommendedPipelineTypes
}; 