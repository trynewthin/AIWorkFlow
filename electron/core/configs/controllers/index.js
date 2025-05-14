/**
 * @file electron/core/configs/controllers/index.js
 * @description 核心配置控制器，提供管道类型和节点配置查询接口
 */

'use strict';

// 引入配置服务和枚举，避免循环依赖
const services = require('../services');
const { NodeKey } = require('../models');

/**
 * 核心配置控制器
 */
class ConfigsController {
  /**
   * 获取所有管道类型
   * @returns {string[]} 管道类型数组
   */
  async getAllPipelineTypes() {
    return services.getAllPipelineTypes();
  }

  /**
   * 获取所有节点枚举
   * @returns {object} 节点枚举对象
   */
  async getAllNodeEnums() {
    return NodeKey;
  }

  /**
   * 获取指定节点的类配置
   * @param {string} nodeKey 节点枚举键名
   * @returns {object|undefined} 节点类配置或 undefined
   */
  async getClassConfig(nodeKey) {
    return services.getClassConfig(nodeKey);
  }

  /**
   * 获取指定节点的默认流程配置
   * @param {string} nodeKey 节点枚举键名
   * @returns {object|undefined} 默认流程配置对象
   */
  async getDefaultFlowConfig(nodeKey) {
    return services.getDefaultFlowConfig(nodeKey);
  }

  /**
   * 获取指定节点的默认运行时配置
   * @param {string} nodeKey 节点枚举键名
   * @returns {object|undefined} 默认运行时配置对象
   */
  async getDefaultWorkConfig(nodeKey) {
    return services.getDefaultWorkConfig(nodeKey);
  }
}

// 支持示例模式
ConfigsController.toString = () => '[class ConfigsController]';

module.exports = ConfigsController; 