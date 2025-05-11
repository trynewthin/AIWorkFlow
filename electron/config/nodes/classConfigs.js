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
    supportedInputPipelines: [],
    supportedOutputPipelines: [PipelineType.PROMPT]
  },
  ChatNode: {
    id: 'chat',
    name: 'chat-completion-lc',
    type: 'model',
    tag: 'chat',
    description: '使用 LangChain JS 进行对话生成',
    version: '1.0.0',
    supportedInputPipelines: [
      PipelineType.CHAT,
      PipelineType.PROMPT,
      PipelineType.RETRIEVAL
    ],
    supportedOutputPipelines: [
      PipelineType.CHAT,
      PipelineType.PROMPT
    ]
  },
  EndNode: {
    id: 'end',
    name: '结束节点',
    type: 'utility',
    tag: 'end',
    description: '将CHAT管道转换为文本输出',
    version: '1.0.0',
    supportedInputPipelines: [PipelineType.CHAT],
    supportedOutputPipelines: [PipelineType.CUSTOM]
  },
  // 在此添加更多其他节点类型的静态配置
  // ExampleNode: {
  //   id: 'example',
  //   name: '示例节点',
  //   version: '1.0',
  //   supportedInputPipelines: [PipelineType.CUSTOM],
  //   supportedOutputPipelines: [PipelineType.CUSTOM]
  // }
}; 