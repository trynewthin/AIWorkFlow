/**
 * @module 节点服务
 * @description 提供节点列表、创建节点实例、更新节点配置、获取节点配置项等功能
 */
const { getAllNodeConfigs } = require('../../model/configs/node');
const { getNodeConfigDb } = require('../../database');

/**
 * @class NodeService
 * @description 节点服务类，封装节点相关业务逻辑
 */
class NodeService {
  /**
   * @description 获取所有节点配置列表
   * @returns {Array<Object>} 节点配置列表
   */
  getNodeList() {
    return getAllNodeConfigs();
  }

  /**
   * @description 根据节点标签获取节点配置列表（tag 可能对应多个配置）
   * @param {string} tag - 节点标签
   * @returns {Array<Object>} 节点配置对象数组
   */
  getNodeConfig(tag) {
    return this.getNodeList().filter(cfg => cfg.tag === tag);
  }

  /**
   * @description 创建并初始化指定名称的节点实例
   * @param {string} name - 节点名称
   * @param {Object} config - 节点自定义配置
   * @returns {Object} 节点实例
   * @throws {Error} 未找到对应节点或实例化失败时抛出
   */
  createNodeInstance(name, config = {}) {
    const nodeCfg = this.getNodeConfigByName(name);
    if (!nodeCfg) {
      throw new Error(`未找到名称为 ${name} 的节点配置`);
    }
    const NodeClass = nodeCfg.nodeClass;

    // 尝试从数据库加载已保存的配置
    const nodeConfigDb = getNodeConfigDb();
    const persistedConfig = nodeConfigDb.getNodeConfig(name);

    // 合并配置：传入的 config 优先级 > 数据库中的 persistedConfig > 节点类默认配置 (由NodeClass构造函数处理)
    const mergedConfig = { ...(persistedConfig || {}), ...config };

    const instance = new NodeClass(mergedConfig); // 使用合并后的配置实例化
    // 如果节点实例有 setCustomConfig 方法，确保将最终生效的配置设置回去，
    // 以便 getCustomConfig 能获取完整配置，即使部分来自数据库。
    if (typeof instance.setCustomConfig === 'function') {
      // 此处传递 mergedConfig 可能包含 nodeId, nodeName 等不属于 customConfig 的内容
      // BaseNode 的 setCustomConfig 需要能正确处理或忽略这些
      // 或者，更严谨的做法是，只传递 customConfig 部分
      // 但由于 NodeClass 构造函数已接收全量 mergedConfig，其内部自定义属性应已正确设置
      // 若 setCustomConfig 仅用于外部更新，此处可考虑不调用或只传 config
    }

    return instance;
  }

  /**
   * @description 修改节点实例的自定义配置，并持久化
   * @param {Object} nodeInstance - 节点实例
   * @param {Object} config - 新的自定义配置
   * @returns {Object} 修改后的节点实例
   * @throws {Error} 如果节点实例不支持自定义配置时抛出
   */
  updateNodeConfig(nodeInstance, config) {
    if (typeof nodeInstance.setCustomConfig !== 'function' || typeof nodeInstance.getCustomConfig !== 'function') {
      throw new Error('该节点实例不支持自定义配置的获取或设置');
    }
    nodeInstance.setCustomConfig(config); // 更新内存中的实例配置

    // 持久化配置
    const nodeConfigDb = getNodeConfigDb();
    const nodeName = nodeInstance.nodeInfo.nodeName; // 从实例获取节点名
    const customConfigToSave = nodeInstance.getCustomConfig(); // 获取当前完整的自定义配置用于保存
    
    nodeConfigDb.saveNodeConfig(nodeName, customConfigToSave);
    
    return nodeInstance;
  }

  /**
   * @description 获取指定节点的配置项列表
   * @param {string} tag - 节点标签
   * @returns {Array<Array<Object>>|undefined} 配置项列表数组
   */
  getNodeConfigSchema(tag) {
    const nodeCfgs = this.getNodeConfig(tag);
    return nodeCfgs.length > 0 ? nodeCfgs.map(cfg => cfg.configSchema) : undefined;
  }

  /**
   * @description 获取所有节点的名称列表
   * @returns {Array<string>} 节点名称列表
   */
  getNodeNames() {
    return this.getNodeList().map(cfg => cfg.name);
  }

  /**
   * @description 根据节点名称获取节点配置
   * @param {string} name - 节点名称
   * @returns {Object|undefined} 节点配置对象
   */
  getNodeConfigByName(name) {
    return this.getNodeList().find(cfg => cfg.name === name);
  }
}

module.exports = new NodeService(); 