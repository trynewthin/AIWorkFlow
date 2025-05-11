/**
 * @file electron/model/nodes/endNode.js
 * @class EndNode
 * @description 结束节点：负责将特定类型的管道数据转换为最终输出格式。
 */
const BaseNode = require('./baseNode');
const Pipeline = require('../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../config/pipeline');

class EndNode extends BaseNode {
  /**
   * @constructor
   * @description 构造结束节点实例。
   *              配置将由BaseNode通过ConfigService加载。
   */
  constructor() {
    super(); // BaseNode的构造函数会处理配置加载
    // 处理器注册可以放在 onInit 中，如果依赖于异步加载的配置，
    // 但对于 EndNode 这种固定转换逻辑，直接在构造函数或 onInit 中注册均可。
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   */
  async onInit() {
    // 注册CHAT管道类型的处理器
    this.registerHandler(PipelineType.CHAT, this._handleChatToText.bind(this));
    // 可以根据需要注册更多输入管道类型的处理器
    // 例如: this.registerHandler(PipelineType.PROMPT, this._handlePromptToText.bind(this));
  }

  /**
   * @private
   * @method _handleChatToText
   * @description 将 CHAT 管道中的文本数据合并为单一文本输出。
   * @param {Pipeline} inputPipeline - 输入的 CHAT 管道实例。
   * @returns {Promise<Pipeline>} 输出管道，类型为 CUSTOM，数据为合并后的 TEXT。
   * @throws {Error} 如果输入管道不符合要求。
   */
  async _handleChatToText(inputPipeline) {
    if (inputPipeline.getPipelineType() !== PipelineType.CHAT) {
      throw new Error(`EndNode: _handleChatToText 方法期望处理 ${PipelineType.CHAT} 类型的管道，但收到了 ${inputPipeline.getPipelineType()}`);
    }

    const textItems = inputPipeline.getByType(DataType.TEXT);
    
    if (textItems.length === 0) {
      // 如果没有文本内容，可以选择返回空文本或抛出错误，这里返回空文本的管道
      console.warn('EndNode: 输入的CHAT管道中没有找到DataType.TEXT类型的数据。');
      return Pipeline.of(PipelineType.CUSTOM, DataType.TEXT, '');
    }

    // 将所有文本内容合并，假设 item.data 就是文本字符串
    const combinedText = textItems.map(item => item.data).join('\n'); // 使用换行符分隔

    // 创建新的输出管道
    // 输出管道类型可以定义为更具体的，如 PipelineType.TEXT_OUTPUT，或通用 PipelineType.CUSTOM
    const outputPipeline = Pipeline.of(PipelineType.CUSTOM, DataType.TEXT, combinedText);
    
    return outputPipeline;
  }
  
  // 未来可以添加更多类似 _handleSomePipelineTypeToSomeOutput 的方法
}

module.exports = EndNode;
