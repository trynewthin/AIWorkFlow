/**
 * @file electron/configs/nodes/defaultFlowConfigs.js
 * @description 各节点类型的默认流程级配置
 * 包含：nodeId (通常在实例化时生成唯一的)、nodeName、status
 */
const { Status } = require('./nodeConfigs');

module.exports = {
  TextNode: {
    // nodeId: '' // nodeId 通常在运行时动态生成，此处可省略或留空
    nodeName: '文本节点', // 默认节点实例名
    status: Status.IDLE
  },
  ImageNode: {
    nodeName: '图片节点',
    status: Status.IDLE
  },
  StartNode: {
    nodeName: '开始节点',
    status: Status.IDLE
  },
  ChatNode: {
    nodeName: 'Chat Completion Node', // 默认节点实例名
    status: Status.IDLE
  },
  EndNode: {
    nodeName: '结束处理节点',
    status: Status.IDLE
  },
  // 在此添加更多其他节点类型的默认流程配置
  // ExampleNode: {
  //   nodeName: '示例节点',
  //   status: Status.IDLE
  // }
  ChunkNode: {
    nodeName: '文本分块节点',
    status: Status.IDLE
  },
  EmbeddingNode: {
    nodeName: '向量嵌入节点',
    status: Status.IDLE
  },
  SearchNode: {
    nodeName: '检索引擎节点',
    status: Status.IDLE
  },
  MergeNode: {
    nodeName: '合并节点',
    status: Status.IDLE
  },
  PromptNode: {
    nodeName: '提示词优化节点',
    status: Status.IDLE
  }
}; 