/**
 * @file electron/configs/nodes/defaultWorkConfigs.js
 * @description 各节点类型的默认运行时（工作）配置
 * 包含：模型名称、temperature、系统提示词等，具体字段因节点类型而异
 */
const { PipelineType } = require('../pipeline'); // 添加导入
const { DataType } = require('../pipeline'); // 添加导入

module.exports = {
  ChatNode: {
    model: 'qwen-plus', 
    systemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。', 
    temperature: 0.7 
  },
  ChunkNode: {
    chunkSize: 1000,
    chunkOverlap: 200
  },
  EmbeddingNode: {
    model: 'text-embedding-v3', // 更新模型名称并添加新字段
    dimensions: 1024,             // 默认不指定，例如 text-embedding-3-small 是 1536
    batchSize: 512,
    stripNewLines: true,
    timeout: null                 // 默认不设置超时
  },
  SearchNode: {
    topK: 5,
    knowledgeBaseId: null, // 默不指定特定知识库
    hnswDimension: 1536 
  },
  MergeNode: {
    outputType: PipelineType.CUSTOM, // 默认合并后为自定义类型，可由用户指定
    mergeCount: 2, // 默认至少需要两个输入才合并
    immediateMerge: true // 默认立即合并
  },
  PromptNode: {
    model: 'qwen-plus', // 假设使用通义千问进行优化
    systemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。',
    temperature: 0.7
  },
  StartNode: {
    pipelineType: PipelineType.USER_MESSAGE, // 转换为的管道类型
    dataType: DataType.TEXT // 默认数据类型
  }
}; 