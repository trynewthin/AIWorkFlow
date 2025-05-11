// 管道类型配置
const PIPconfigs = {
  // 管道类型枚举
  PipelineType: {
    // 基础处理类型
    TEXT_PROCESSING: 'text_processing',     // 文本处理类管道
    VECTOR_PROCESSING: 'vector_processing', // 向量处理类管道
    DOCUMENT_PROCESSING: 'document_processing', // 文档处理类管道
    KNOWLEDGE_PROCESSING: 'knowledge_processing', // 知识库处理类管道

    // 交互式类型
    CHAT: 'chat',                 // 聊天类管道
    PROMPT: 'prompt',             // 提示词处理管道  
    
    // 搜索检索类型
    RETRIEVAL: 'retrieval',       // 检索类管道
    SEARCH: 'search',             // 搜索类管道

    // 学习与推理类型
    LLM: 'llm',                   // 大语言模型管道
    RAG: 'rag',                   // 检索增强生成管道

    // 文件与数据类型
    FILE: 'file',                 // 文件处理管道
    DATA: 'data',                 // 数据处理管道
    
    // 自定义或扩展类型
    CUSTOM: 'custom',             // 自定义管道类型
  },
  
  // 验证管道类型是否有效
  isValidPipelineType(type) {
    return Object.values(this.PipelineType).includes(type);
  },
  
  // 获取所有管道类型
  getAllPipelineTypes() {
    return Object.values(this.PipelineType);
  },
  
  // 根据节点类型获取推荐的管道类型
  getRecommendedPipelineTypes(nodeType) {
    switch (nodeType) {
      case 'chat':
        return [this.PipelineType.CHAT, this.PipelineType.LLM];
      case 'embedding':
        return [this.PipelineType.VECTOR_PROCESSING];
      case 'chunk':
        return [this.PipelineType.DOCUMENT_PROCESSING];
      case 'search':
        return [this.PipelineType.SEARCH, this.PipelineType.RETRIEVAL];
      case 'prompt':
        return [this.PipelineType.PROMPT, this.PipelineType.TEXT_PROCESSING];
      default:
        return [this.PipelineType.CUSTOM];
    }
  }
};

module.exports = PIPconfigs;
