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
      supportedInputPipelines: [PipelineType.TEXT,PipelineType.RETRIEVAL],
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
      description: '结束节点，目标是将管道中的数据透传。',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.ALL],
      supportedOutputPipelines: []
    },
    defaultFlowConfig: {
      nodeName: '结束处理节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      pipelineType: PipelineType.TEXT,
    }
  },
  [NodeKey.MEMORY]: {
    classConfig: {
      id: 'memory',
      name: '对话记忆节点',
      type: 'processor',
      tag: 'memory',
      description: '加载指定轮次历史消息并与当前消息拼接，使用LLM生成回复',
      version: '1.0.0',
      supportedInputPipelines: [PipelineType.TEXT],
      supportedOutputPipelines: [PipelineType.TEXT]
    },
    defaultFlowConfig: {
      nodeName: '对话记忆节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 },
      dialogueId: 'default',     // 对话ID，用于区分不同对话
      historyRounds: 5           // 历史消息轮次，从工作配置移到流配置
    },
    defaultWorkConfig: {
      // 消息格式配置
      messageFormat: 'standard',  // 消息格式化方式
      roleMappings: {             // 角色映射配置
        user: '用户',
        assistant: '助手',
        system: '系统'
      },
      
      // 聊天模型配置
      model: 'deepseek-v3',      // 默认使用的LLM模型
      systemPrompt: '你是一个友好的助手，请基于历史对话记忆回答用户问题。', // 系统提示词
      temperature: 0.7           // 温度参数
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
      supportedOutputPipelines: [PipelineType.RETRIEVAL]
    },
    defaultFlowConfig: {
      nodeName: '检索引擎节点',
      status: Status.IDLE,
      position: { x: 0, y: 0 }
    },
    defaultWorkConfig: {
      topK: 5,
      knowledgeBaseId: null,
      hnswDimension: 1024,
      minScore: 0.6, //值越高要求越严格
      maxDistance: 0.5, //值越小要求越严格
      strictFiltering: false //true为严格模式，需要同时满足两个条件，false为宽松模式，满足任一条件即可
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