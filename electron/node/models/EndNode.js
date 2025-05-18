/**
 * @file electron/model/nodes/endNode.js
 * @class EndNode
 * @description 结束节点：负责将接收到的管道数据原封不动地传出去。
 */
const BaseNode = require('./baseNode');
const Pipeline = require('../../pipeline/Pipeline');
const { PipelineType } = require('../../coreconfigs/models/pipelineTypes');

class EndNode extends BaseNode {
  /**
   * @constructor
   * @description 构造结束节点实例。
   *              配置将由BaseNode通过ConfigService加载。
   */
  constructor() {
    super(); // BaseNode的构造函数会处理配置加载
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   */
  async onInit() {
    // 注册通用处理器，接受所有类型的管道
    this.registerHandler('*', this._handlePassthrough.bind(this));
  }

  /**
   * @private
   * @method _handlePassthrough
   * @description 将接收到的管道原封不动地传出去
   * @param {Pipeline} inputPipeline - 输入的管道实例
   * @returns {Promise<Pipeline>} 原样返回输入的管道实例
   */
  async _handlePassthrough(inputPipeline) {
    console.log(`EndNode: 接收到 ${inputPipeline.getPipelineType()} 类型的管道，原样传出`);
    
    // 直接返回输入的管道，不做任何修改
    return inputPipeline;
  }
}

module.exports = EndNode;
