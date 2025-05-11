/**
 * @file NodeFactory.js
 * @description 节点工厂类，负责创建各种类型的节点实例
 */

const { logger } = require('ee-core/log');

/**
 * @class NodeFactory
 * @description 节点工厂，负责创建节点实例
 */
class NodeFactory {
  /**
   * @constructor
   */
  constructor() {
    /** @type {Map<string, Function>} 节点类型映射表 */
    this.nodeTypes = new Map();
    this._registerBuiltinNodes();
  }

  /**
   * @method registerNodeType
   * @description 注册节点类型
   * @param {string} typeName - 节点类型名称
   * @param {class} nodeClass - 节点类
   */
  registerNodeType(typeName, nodeClass) {
    if (!typeName || typeof nodeClass !== 'function') {
      throw new Error('注册节点类型需要有效的类型名和节点类');
    }
    this.nodeTypes.set(typeName, nodeClass);
    logger.info(`[NodeFactory] 注册节点类型: ${typeName}`);
  }

  /**
   * @method createNode
   * @description 创建指定类型的节点实例
   * @param {string} typeName - 节点类型名称
   * @param {Object} [flowConfig={}] - 流程级配置
   * @param {Object} [workConfig={}] - 运行时配置
   * @returns {Promise<BaseNode>} 初始化的节点实例
   * @throws {Error} 如果节点类型未注册
   */
  async createNode(typeName, flowConfig = {}, workConfig = {}) {
    const NodeClass = this.nodeTypes.get(typeName);
    if (!NodeClass) {
      throw new Error(`未知节点类型: ${typeName}`);
    }

    try {
      const node = new NodeClass();
      await node.init(flowConfig, workConfig);
      return node;
    } catch (error) {
      logger.error(`[NodeFactory] 创建节点实例失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method hasNodeType
   * @description 检查是否已注册指定的节点类型
   * @param {string} typeName - 节点类型名称
   * @returns {boolean} 是否已注册
   */
  hasNodeType(typeName) {
    return this.nodeTypes.has(typeName);
  }
  
  /**
   * @method getRegisteredTypes
   * @description 获取所有已注册的节点类型名称
   * @returns {Array<string>} 节点类型名称列表
   */
  getRegisteredTypes() {
    return Array.from(this.nodeTypes.keys());
  }

  /**
   * @private
   * @method _registerBuiltinNodes
   * @description 注册内置节点类型
   */
  _registerBuiltinNodes() {
    try {
      // 导入内置节点类
      const StartNode = require('../nodes/StartNode');
      const ChatNode = require('../nodes/ChatNode');
      const EndNode = require('../nodes/EndNode');
      const ChunkNode = require('../nodes/ChunkNode');
      const EmbeddingNode = require('../nodes/EmbeddingNode');
      const PromptNode = require('../nodes/PromptNode');
      const SearchNode = require('../nodes/SearchNode');

      // 注册内置节点类型
      this.registerNodeType('StartNode', StartNode);
      this.registerNodeType('ChatNode', ChatNode);
      this.registerNodeType('EndNode', EndNode);
      this.registerNodeType('ChunkNode', ChunkNode);
      this.registerNodeType('EmbeddingNode', EmbeddingNode);
      this.registerNodeType('PromptNode', PromptNode);
      this.registerNodeType('SearchNode', SearchNode);
      
      logger.info('[NodeFactory] 内置节点类型注册完成');
    } catch (error) {
      logger.error(`[NodeFactory] 注册内置节点类型失败: ${error.message}`);
    }
  }
}

// 导出 NodeFactory 类和一个获取单例的函数
let instance = null;

/**
 * 获取 NodeFactory 单例
 * @returns {NodeFactory} NodeFactory 单例
 */
function getNodeFactory() {
  if (!instance) {
    instance = new NodeFactory();
  }
  return instance;
}

module.exports = {
  NodeFactory,
  getNodeFactory
};