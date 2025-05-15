/**
 * @file electron/core/configs/models/nodeConfigs.js
 * @description Defines configurations for all node types, organized by node using NodeKey enum.
 */

const { PipelineType, DataType } = require('./pipelineTypes');
const { Status, NodeKey } = require('./enums');

const nodeConfigurations = {
  [NodeKey.CHAT]: {
    classConfig: {
      id: 'chat',
      name: 'llm对话节点',
      type: 'model',
      tag: 'chat',
      description: '使用 LangChain JS 进行对话生成',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.TEXT],
      supportedOutputPipelines: [PipelineType.TEXT]
    },
    defaultFlowConfig: {
      nodeName: 'Chat Completion Node',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      model: 'qwen-plus',
      systemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。',
      temperature: 0.7
    }
  },
  [NodeKey.CHUNK]: {
    classConfig: {
      id: 'chunk',
      name: 'text-to-chunks-lc',
      type: 'processor',
      tag: 'split',
      description: '使用LangChain JS加载器和分块策略将文本或文件分割为多个块',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.PROMPT, PipelineType.CUSTOM],
      supportedOutputPipelines: [PipelineType.CHUNK]
    },
    defaultFlowConfig: {
      nodeName: '文本分块节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      chunkSize: 1000,
      chunkOverlap: 200
    }
  },
  [NodeKey.EMBEDDING]: {
    classConfig: {
      id: 'embedding',
      name: 'text-to-embedding-lc',
      type: 'model',
      tag: 'embedding',
      description: '使用LangChain JS生成文本嵌入向量',
      version: '1.0.0',
      supportedInputPipelines: [
        PipelineType.EMBEDDING,
        PipelineType.CHUNK,
        PipelineType.PROMPT,
        PipelineType.USER_MESSAGE,
        PipelineType.TEXT
      ],
      
      supportedOutputPipelines: [PipelineType.EMBEDDING]
    },
    defaultFlowConfig: {
      nodeName: '向量嵌入节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      model: 'text-embedding-v3',
      dimensions: 1024,
      batchSize: 512,
      stripNewLines: true,
      timeout: null
    }
  },
  [NodeKey.END]: {
    classConfig: {
      id: 'end',
      name: '结束节点',
      type: 'utility',
      tag: 'end',
      description: '将管道转换为具体输出',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.CHAT],
      supportedOutputPipelines: [PipelineType.CUSTOM]
    },
    defaultFlowConfig: {
      nodeName: '结束处理节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      pipelineType: PipelineType.ALL,
      dataType: DataType.TEXT
    }
  },
  [NodeKey.MERGE]: {
    classConfig: {
      id: 'merge',
      name: 'pipeline-merge-node',
      type: 'utility',
      tag: 'merge',
      description: '合并多个 Pipeline，并设置合并后管道类型',
      version: '1.0.0',
      supportedInputPipelines: [], 
      supportedOutputPipelines: [] 
    },
    defaultFlowConfig: {
      nodeName: '合并节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      outputType: PipelineType.CUSTOM,
      mergeCount: 2,
      immediateMerge: true
    }
  },
  [NodeKey.PROMPT]: { 
    classConfig: {
      id: 'prompt_optimizer',
      name: 'prompt-organizer-lc',
      type: 'processor',
      tag: 'prompt',
      description: '组织用户提示词字符串，进行格式化处理或优化',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.USER_MESSAGE],
      supportedOutputPipelines: [PipelineType.USER_MESSAGE]
    },
    defaultFlowConfig: {
      nodeName: '提示词优化节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      model: 'qwen-plus',
      systemPrompt: '请对用户提供的提示词进行优化，确保清晰、准确、有条理，适合用于大模型生成。',
      temperature: 0.7
    }
  },
  [NodeKey.SEARCH]: {
    classConfig: {
      id: 'search',
      name: 'text-to-retrieve-hnsw',
      type: 'retriever',
      tag: 'retrieve',
      description: '将文本向量化并使用 HNSW 索引检索相关文档',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.TEXT],
      supportedOutputPipelines: [PipelineType.SEARCH]
    },
    defaultFlowConfig: {
      nodeName: '检索引擎节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      topK: 5,
      knowledgeBaseId: null,
      hnswDimension: 1536
    }
  },
  [NodeKey.START]: {
    classConfig: {
      id: 'start',
      name: '开始节点',
      type: 'utility',
      tag: 'start',
      description: '将原始输入封装为初始管道',
      version: '1.0',
      supportedInputPipelines: [PipelineType.ALL],
      supportedOutputPipelines: [PipelineType.ALL]
    },
    defaultFlowConfig: {
      nodeName: '开始节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      pipelineType: PipelineType.TEXT,
      dataType: DataType.TEXT
    }
  }
};

module.exports = {
  nodeConfigurations
};