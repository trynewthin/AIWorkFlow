/**
 * @file electron/configs/nodes/classConfigs.js
 * @description 各节点类型的静态配置
 * 包含：类型ID、类型名称、版本、支持的输入/输出管道类型等
 */
const { PipelineType } = require('../pipeline');

module.exports = {
  StartNode: {
    id: 'start',
    name: '开始节点',
    type: 'utility',
    tag: 'start',
    description: '将原始输入封装为初始管道',
    version: '1.0',
    supportedInputPipelines: [PipelineType.ALL],
    supportedOutputPipelines: [PipelineType.ALL]
  },
  ChatNode: {
    id: 'chat',
    name: 'llm对话节点',
    type: 'model',
    tag: 'chat',
    description: '使用 LangChain JS 进行对话生成',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.USER_MESSAGE
    ],
    supportedOutputPipelines: [
      PipelineType.CHAT
    ]
  },
  EndNode: {
    id: 'end',
    name: '结束节点',
    type: 'utility',
    tag: 'end',
    description: '将管道转换为具体输出',
    version: '1.0.0',
    supportedInputPipelines: [PipelineType.CHAT],
    supportedOutputPipelines: [PipelineType.CUSTOM]
  },
  ChunkNode: {
    id: 'chunk',
    name: 'text-to-chunks-lc',
    type: 'processor',
    tag: 'split',
    description: '使用LangChain JS加载器和分块策略将文本或文件分割为多个块',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.PROMPT, // 假设输入可以是待处理的文本路径或内容
      PipelineType.CUSTOM // 允许更灵活的输入
    ],
    supportedOutputPipelines: [
      PipelineType.CHUNK // 输出文本块，供后续节点处理
    ]
  },
  EmbeddingNode: {
    id: 'embedding',
    name: 'text-to-embedding-lc',
    type: 'model',
    tag: 'embedding',
    description: '使用LangChain JS生成文本嵌入向量',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.EMBEDDING,
      PipelineType.CHUNK, // 添加对文本块输入的支持
      PipelineType.PROMPT, // 支持文本提示词输入
      PipelineType.USER_MESSAGE, // 支持用户消息输入
    ],
    supportedOutputPipelines: [
      PipelineType.EMBEDDING // 输出向量嵌入数据
    ]
  },
  SearchNode: {
    id: 'search',
    name: 'text-to-retrieve-hnsw',
    type: 'retriever',
    tag: 'retrieve',
    description: '将文本向量化并使用 HNSW 索引检索相关文档',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.CHAT,
      PipelineType.EMBEDDING,
    ],
    supportedOutputPipelines: [
      PipelineType.SEARCH
    ]
  },
  MergeNode: {
    id: 'merge',
    name: 'pipeline-merge-node',
    type: 'utility',
    tag: 'merge',
    description: '合并多个 Pipeline，并设置合并后管道类型',
    version: '1.0.0',
    supportedInputPipelines: [], // 支持任意输入
    supportedOutputPipelines: [] // 输出类型由配置决定
  },
  PromptNode: {
    id: 'prompt_optimizer',
    name: 'prompt-organizer-lc',
    type: 'processor',
    tag: 'prompt',
    description: '组织用户提示词字符串，进行格式化处理或优化',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.USER_MESSAGE
    ],
    supportedOutputPipelines: [
      PipelineType.USER_MESSAGE // 输出优化后的提示词
    ]
  }
}; 