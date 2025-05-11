/**
 * @module NodeController
 * @description 节点控制器，提供节点管理和配置接口
 */
const nodeService = require('../services/node');

/**
 * @class NodeController
 */
class NodeController {
  /**
   * @description 获取所有节点配置列表
   * @returns {Array<Object>} 节点配置列表
   */
  getNodeList() {
    try {
      const list = nodeService.getNodeList();
      return {
        code: 0,
        message: '获取节点列表成功',
        data: list
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取节点列表失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 根据节点标签获取节点配置
   * @param {string} tag - 节点标签
   * @returns {Array<Object>} 节点配置对象数组
   */
  getNodeConfig(tag) {
    try {
      const configs = nodeService.getNodeConfig(tag);
      return {
        code: 0,
        message: '获取节点配置成功',
        data: configs
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取节点配置失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 获取指定节点名称的配置 Schema
   * @param {string} name - 节点名称
   * @returns {Array<Object>} 节点配置项列表
   */
  getNodeConfigSchema(name) {
    try {
      const schema = nodeService.getNodeConfigSchema(name);
      return {
        code: 0,
        message: '获取节点配置项成功',
        data: schema
      };
    } catch (error) {
      return {
        code: -1,
        message: `获取节点配置项失败: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * @description 更新节点实例自定义配置
   * @param {string} name - 节点名称
   * @param {Object} config - 自定义配置项
   * @returns {Object} 操作结果
   */
  updateNodeConfig(name, config) {
    try {
      const instance = nodeService.createNodeInstance(name);
      nodeService.updateNodeConfig(instance, config);
      return {
        code: 0,
        message: '更新节点配置成功',
        data: instance.getCustomConfig()
      };
    } catch (error) {
      return {
        code: -1,
        message: `更新节点配置失败: ${error.message}`,
        data: null
      };
    }
  }
}

module.exports = NodeController; 