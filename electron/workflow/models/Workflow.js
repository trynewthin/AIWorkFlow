/**
 * @file Workflow.js
 * @description 工作流数据模型
 */

/**
 * @class Workflow
 * @description 工作流类，表示工作流的数据结构
 */
class Workflow {
  /**
   * @constructor
   * @param {Object} options - 工作流配置选项
   * @param {string} options.id - 工作流ID
   * @param {string} options.name - 工作流名称
   * @param {string} [options.description=''] - 工作流描述
   * @param {Array<Object>} [options.nodes=[]] - 工作流节点列表
   * @param {Object} [options.config={}] - 工作流级别配置
   * @param {string} [options.entryNodeId] - (多向流预留) 入口节点ID
   * @param {Date} [options.createdAt] - 创建时间
   * @param {Date} [options.updatedAt] - 更新时间
   */
  constructor(options = {}) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description || '';
    this.nodes = options.nodes || [];
    this.config = options.config || {};
    // 预留：多向工作流入口节点ID
    this.entryNodeId = options.entryNodeId;
    
    this.createdAt = options.createdAt ? new Date(options.createdAt) : new Date();
    this.updatedAt = options.updatedAt ? new Date(options.updatedAt) : new Date();
  }

  /**
   * @method addNode
   * @description 添加一个节点到工作流
   * @param {Object} node - 节点数据
   */
  addNode(node) {
    this.nodes.push(node);
  }

  /**
   * @method removeNode
   * @description 根据ID移除节点
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否成功移除
   */
  removeNode(nodeId) {
    const initialLength = this.nodes.length;
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    return this.nodes.length < initialLength;
  }

  /**
   * @method getNodeById
   * @description 根据ID获取节点
   * @param {string} nodeId - 节点ID
   * @returns {Object|null} 节点对象，未找到则返回null
   */
  getNodeById(nodeId) {
    return this.nodes.find(node => node.id === nodeId) || null;
  }

  /**
   * @method getSortedNodes
   * @description 获取按顺序排序的节点列表
   * @returns {Array<Object>} 排序后的节点列表
   */
  getSortedNodes() {
    return [...this.nodes].sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * @method toJSON
   * @description 将工作流对象转换为JSON表示
   * @returns {Object} 工作流的JSON表示
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      nodes: this.nodes,
      config: this.config,
      entryNodeId: this.entryNodeId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * @static
   * @method fromDatabase
   * @description 从数据库记录创建工作流实例
   * @param {Object} dbRecord - 数据库记录
   * @param {Array<Object>} nodes - 工作流的节点列表
   * @returns {Workflow} 工作流实例
   */
  static fromDatabase(dbRecord, nodes = []) {
    return new Workflow({
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      nodes: nodes,
      config: dbRecord.config,
      entryNodeId: dbRecord.entry_node_id,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    });
  }
}

module.exports = Workflow; 