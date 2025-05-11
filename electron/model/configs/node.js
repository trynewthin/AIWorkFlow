/**
 * @module 节点配置
 * @description 提供所有节点的元数据、类和配置项，用于服务层调用
 */
const StartNode = require('../nodes/startNode');
const EndNode = require('../nodes/endNode');
const ChunkNode = require('../nodes/chunk');
const EmbeddingNode = require('../nodes/embedding');
const SearchNode = require('../nodes/search');
const MergeNode = require('../nodes/mergeNode');
const PromptNode = require('../nodes/prompt');
const ChatNode = require('../nodes/chat');
const DataType = require('../pipeline/Datatype');
const { PipelineType } = require('../pipeline/Piptype');

/**
 * @description 所有节点的配置列表
 * @type {Array<Object>}
 */
const nodeConfigs = [
  {
    // 开始节点
    tag: StartNode.nodeConfig.tag,
    name: StartNode.nodeConfig.name,
    type: StartNode.nodeConfig.type,
    description: StartNode.nodeConfig.description,
    version: StartNode.nodeConfig.version,
    supportedInputPipelines: StartNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: StartNode.nodeConfig.supportedOutputPipelines,
    nodeClass: StartNode,
    configSchema: [
      {
        key: 'pipelineType',
        type: 'string',
        description: '生成的管道类型'
      },
      {
        key: 'dataType',
        type: 'string',
        description: '初始数据的数据类型'
      }
    ]
  },
  {
    // 结束节点
    tag: EndNode.nodeConfig.tag,
    name: EndNode.nodeConfig.name,
    type: EndNode.nodeConfig.type,
    description: EndNode.nodeConfig.description,
    version: EndNode.nodeConfig.version,
    supportedInputPipelines: EndNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: EndNode.nodeConfig.supportedOutputPipelines,
    nodeClass: EndNode,
    configSchema: [
      {
        key: 'dataType',
        type: 'string',
        description: '要提取的数据类型'
      }
    ]
  },
  {
    // 分块节点
    tag: ChunkNode.nodeConfig.tag,
    name: ChunkNode.nodeConfig.name,
    type: ChunkNode.nodeConfig.type,
    description: ChunkNode.nodeConfig.description,
    version: ChunkNode.nodeConfig.version,
    supportedInputPipelines: ChunkNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: ChunkNode.nodeConfig.supportedOutputPipelines,
    nodeClass: ChunkNode,
    configSchema: [
      {
        key: 'chunkSize',
        type: 'number',
        description: '分块大小'
      },
      {
        key: 'chunkOverlap',
        type: 'number',
        description: '分块重叠大小'
      }
    ]
  },
  {
    // 嵌入节点
    tag: EmbeddingNode.nodeConfig.tag,
    name: EmbeddingNode.nodeConfig.name,
    type: EmbeddingNode.nodeConfig.type,
    description: EmbeddingNode.nodeConfig.description,
    version: EmbeddingNode.nodeConfig.version,
    supportedInputPipelines: EmbeddingNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: EmbeddingNode.nodeConfig.supportedOutputPipelines,
    nodeClass: EmbeddingNode,
    configSchema: [
      {
        key: 'modelName',
        type: 'string',
        description: '嵌入模型名称'
      },
      {
        key: 'modelOptions',
        type: 'object',
        description: '嵌入模型选项'
      }
    ]
  },
  {
    // 检索节点
    tag: SearchNode.nodeConfig.tag,
    name: SearchNode.nodeConfig.name,
    type: SearchNode.nodeConfig.type,
    description: SearchNode.nodeConfig.description,
    version: SearchNode.nodeConfig.version,
    supportedInputPipelines: SearchNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: SearchNode.nodeConfig.supportedOutputPipelines,
    nodeClass: SearchNode,
    configSchema: [
      {
        key: 'topK',
        type: 'number',
        description: '返回的结果数量'
      },
      {
        key: 'knowledgeBaseId',
        type: 'string',
        description: '知识库 ID'
      },
      {
        key: 'modelName',
        type: 'string',
        description: '嵌入模型名称'
      },
      {
        key: 'modelOptions',
        type: 'object',
        description: '嵌入模型选项'
      }
    ]
  },
  {
    // 合并节点
    tag: MergeNode.nodeConfig.tag,
    name: MergeNode.nodeConfig.name,
    type: MergeNode.nodeConfig.type,
    description: MergeNode.nodeConfig.description,
    version: MergeNode.nodeConfig.version,
    supportedInputPipelines: MergeNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: MergeNode.nodeConfig.supportedOutputPipelines,
    nodeClass: MergeNode,
    configSchema: [
      {
        key: 'outputType',
        type: 'string',
        description: '合并后管道类型'
      },
      {
        key: 'mergeCount',
        type: 'number',
        description: '合并所需管道数量阈值'
      },
      {
        key: 'immediateMerge',
        type: 'boolean',
        description: '是否立即合并'
      }
    ]
  },
  {
    // 提示词优化节点
    tag: PromptNode.nodeConfig.tag,
    name: PromptNode.nodeConfig.name,
    type: PromptNode.nodeConfig.type,
    description: PromptNode.nodeConfig.description,
    version: PromptNode.nodeConfig.version,
    supportedInputPipelines: PromptNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: PromptNode.nodeConfig.supportedOutputPipelines,
    nodeClass: PromptNode,
    configSchema: [
      {
        key: 'model',
        type: 'string',
        description: 'LLM 模型名称'
      },
      {
        key: 'systemPrompt',
        type: 'string',
        description: '系统提示词'
      },
      {
        key: 'temperature',
        type: 'number',
        description: 'LLM 温度参数'
      }
    ]
  },
  {
    // 聊天节点
    tag: ChatNode.nodeConfig.tag,
    name: ChatNode.nodeConfig.name,
    type: ChatNode.nodeConfig.type,
    description: ChatNode.nodeConfig.description,
    version: ChatNode.nodeConfig.version,
    supportedInputPipelines: ChatNode.nodeConfig.supportedInputPipelines,
    supportedOutputPipelines: ChatNode.nodeConfig.supportedOutputPipelines,
    nodeClass: ChatNode,
    configSchema: [
      {
        key: 'model',
        type: 'string',
        description: '聊天模型名称'
      },
      {
        key: 'systemPrompt',
        type: 'string',
        description: '系统提示词'
      },
      {
        key: 'temperature',
        type: 'number',
        description: '聊天温度参数'
      }
    ]
  }
];

/**
 * @description 获取所有节点配置
 * @returns {Array<Object>}
 */
function getAllNodeConfigs() {
  return nodeConfigs;
}

/**
 * @description 根据 tag 获取节点配置
 * @param {string} tag - 节点标签
 * @returns {Object|undefined}
 */
function getNodeConfigByTag(tag) {
  return nodeConfigs.find(cfg => cfg.tag === tag);
}

module.exports = {
  getAllNodeConfigs,
  getNodeConfigByTag
};
