/**
 * @file 测试 NodeFactory，使用 CommonJS 语法
 * @description 演示如何使用 NodeFactory 创建并调用节点
 */
const { getNodeFactory } = require('../electron/core/node/services/NodeFactory.js');
const Pipeline = require('../electron/core/pipeline/Pipeline.js');
const { PipelineType, DataType } = require('../electron/core/configs/models/pipelineTypes.js');

(async () => {
  /**
   * @description 获取并初始化 ChatNode 实例
   */
  const factory = getNodeFactory();
  const chatNode = await factory.createNode('ChatNode');

  /**
   * @description 创建管道并添加文本数据
   */
  const pipeline = new Pipeline(PipelineType.CHAT);
  pipeline.add(DataType.TEXT, "你好");

  /**
   * @description 执行节点处理并获取结果
   */

  console.log(await chatNode.getWorkConfig());
})();


