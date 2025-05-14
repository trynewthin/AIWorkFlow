/**
 * @file 测试 ChatNode，使用 ESModule 语法
 * @description 演示如何在 ES 模块环境下初始化并调用 ChatNode
 */
import ChatNode from '../electron/core/node/models/ChatNode.js';
import Pipeline from '../electron/core/pipeline/Pipeline.js';
import { PipelineType, DataType } from '../electron/core/configs/models/pipelineTypes.js';

(async () => {
  /**
   * @description 获取并初始化 ChatNode 实例
   */
  const chatNode = new ChatNode();
  await chatNode.init();

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


