/**
 * @file electron/services/configService.js
 * @class ConfigService
 * @description 统一管理并提供节点各类配置的访问接口
 */
class ConfigService {
  constructor() {
    const nodeConfigsBundle = require('../../config/nodes'); // 导入统一导出的配置包

    /** @type {Object.<string, Object>} 节点静态配置 */
    this.classConfigs = nodeConfigsBundle.classConfigs;

    /** @type {Object.<string, Object>} 节点默认流程级配置 */
    this.defaultFlowConfigs = nodeConfigsBundle.defaultFlowConfigs;

    /** @type {Object.<string, Object>} 节点默认运行时配置 */
    this.defaultWorkConfigs = nodeConfigsBundle.defaultWorkConfigs;

    /** @type {Object} 状态枚举 */
    this.Status = nodeConfigsBundle.Status;
  }

  /**
   * @description 获取指定节点类型的静态配置 (classConfig)
   * @param {string} nodeType - 节点类型名称 (例如 'TextNode')
   * @returns {Object} 对应的 classConfig，如果未找到则返回空对象
   */
  getClassConfig(nodeType) {
    return this.classConfigs[nodeType] || {};
  }

  /**
   * @description 获取指定节点类型的默认流程级配置 (flowConfig)
   * @param {string} nodeType - 节点类型名称
   * @returns {Object} 复制的默认 flowConfig，如果未找到则返回空对象
   */
  getDefaultFlowConfig(nodeType) {
    // 返回配置的副本以避免意外修改原始默认配置
    return { ...(this.defaultFlowConfigs[nodeType] || {}) };
  }

  /**
   * @description 获取指定节点类型的默认运行时配置 (workConfig)
   * @param {string} nodeType - 节点类型名称
   * @returns {Object} 复制的默认 workConfig，如果未找到则返回空对象
   */
  getDefaultWorkConfig(nodeType) {
    // 返回配置的副本
    return { ...(this.defaultWorkConfigs[nodeType] || {}) };
  }
  
  /**
   * @description 获取所有可用节点的配置列表
   * @returns {Array<Object>} 所有节点配置的数组
   */
  getNodeConfigs() {
    // 返回所有节点的完整配置信息
    return Object.values(this.classConfigs);
  }

  /**
   * @description 获取所有可用节点的类型名称列表
   * @returns {Array<string>} 所有节点类型名称 (例如 'StartNode', 'ChatNode') 的数组
   */
  getNodeTypeNames() {
    // 返回 classConfigs 对象的所有键名
    return Object.keys(this.classConfigs);
  }

  /**
   * @description 根据节点类型名称获取其静态配置 (classConfig)
   * @param {string} nodeType - 节点类型名称 (例如 'StartNode')
   * @returns {Object | null} 对应的 classConfig，如果未找到则返回 null
   */
  getNodeConfigByType(nodeType) {
    return this.classConfigs[nodeType] || null;
  }
}

// 导出 ConfigService 的单例
module.exports = new ConfigService(); 