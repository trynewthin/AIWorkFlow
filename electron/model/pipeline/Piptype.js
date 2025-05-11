// TODO: 定义管道类型枚举及辅助方法
const PipelineType = {
  TEXT_PROCESSING: 'text_processing',        // 文本处理类管道
  VECTOR_PROCESSING: 'vector_processing',    // 向量处理类管道
  DOCUMENT_PROCESSING: 'document_processing', // 文档处理类管道
  KNOWLEDGE_PROCESSING: 'knowledge_processing', // 知识库处理类管道

  CHAT: 'chat',                             // 聊天类管道
  PROMPT: 'prompt',                         // 提示词处理管道

  RETRIEVAL: 'retrieval',                   // 检索类管道
  SEARCH: 'search',                         // 搜索类管道

  LLM: 'llm',                               // 大语言模型管道
  RAG: 'rag',                               // 检索增强生成管道

  FILE: 'file',                             // 文件处理管道
  DATA: 'data',                             // 数据处理管道

  CUSTOM: 'custom'                          // 自定义管道类型
};

function isValidPipelineType(type) {
  return Object.values(PipelineType).includes(type);
}

function getAllPipelineTypes() {
  return Object.values(PipelineType);
}

function getRecommendedPipelineTypes(nodeType) {
  switch (nodeType) {
    case 'chat':
      return [PipelineType.CHAT, PipelineType.LLM];
    case 'embedding':
      return [PipelineType.VECTOR_PROCESSING];
    case 'chunk':
      return [PipelineType.DOCUMENT_PROCESSING];
    case 'search':
      return [PipelineType.SEARCH, PipelineType.RETRIEVAL];
    case 'prompt':
      return [PipelineType.PROMPT, PipelineType.TEXT_PROCESSING];
    default:
      return [PipelineType.CUSTOM];
  }
}

module.exports = {
  PipelineType,
  isValidPipelineType,
  getAllPipelineTypes,
  getRecommendedPipelineTypes
};
