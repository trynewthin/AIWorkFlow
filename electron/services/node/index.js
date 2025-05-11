/**
 * @module 节点服务
 * @description 提供节点列表、创建节点实例、更新节点配置、获取节点配置项等功能
 */
const { getAllNodeConfigs } = require('../../model/configs/node');

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
    const instance = new NodeClass({ ...config });
    return instance;
  }

  /**
   * @description 修改节点实例的自定义配置
   * @param {Object} nodeInstance - 节点实例
   * @param {Object} config - 新的自定义配置
   * @returns {Object} 修改后的节点实例
   * @throws {Error} 如果节点实例不支持自定义配置时抛出
   */
  updateNodeConfig(nodeInstance, config) {
    if (typeof nodeInstance.setCustomConfig !== 'function') {
      throw new Error('该节点实例不支持自定义配置');
    }
    nodeInstance.setCustomConfig(config);
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