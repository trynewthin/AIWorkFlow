/**
 * @file config.js
 * @description 配置控制器，提供配置相关的接口
 */

const { logger } = require('ee-core/log');
const configService = require('../services/config/configService');

/**
 * 配置控制器
 * @class
 */
class ConfigController {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 获取所有可用节点的类型名称列表
   * @returns {Object} 包含节点类型名称列表的响应对象
   */
  async getNodeTypes() {
    try {
      const nodeTypeNames = configService.getNodeTypeNames();
      return { code: 200, data: nodeTypeNames, success: true };
    } catch (error) {
      logger.error(`[ConfigController] 获取节点类型列表失败: ${error.message}`);
      return { code: 500, message: `获取节点类型列表失败: ${error.message}`, success: false };
    }
  }
  
  /**
   * 根据节点类型名称获取其静态配置
   * @param {object} params - 前端传递的参数对象，包含 nodeType
   * @returns {Object} 包含节点配置的响应对象或错误信息
   */
  async getNodeConfigByType(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      const config = configService.getNodeConfigByType(nodeType);
      
      if (!config) {
        return { code: 404, message: `未找到类型为 '${nodeType}' 的节点配置`, success: false };
      }
      
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[ConfigController] 获取节点配置失败: ${error.message}`);
      return { code: 500, message: `获取节点配置失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取所有可用节点的配置列表 (保留，如果需要获取完整配置)
   * @returns {Object} 包含节点配置列表的响应对象
   */
  async getNodeConfigs() {
    try {
      const nodeConfigs = configService.getNodeConfigs();
      return { code: 200, data: nodeConfigs, success: true };
    } catch (error) {
      logger.error(`[ConfigController] 获取节点配置列表失败: ${error.message}`);
      return { code: 500, message: `获取节点配置列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 根据节点类型名称获取其默认流程配置
   * @param {object} params - 前端传递的参数对象，包含 nodeType
   * @returns {Object} 包含默认流程配置的响应对象或错误信息
   */
  async getDefaultFlowConfig(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      // 注意：服务层返回的是配置的副本，可以直接使用
      const config = configService.getDefaultFlowConfig(nodeType);
      
      // 即使没找到特定类型的默认配置，服务层也会返回空对象 {}，这通常是有效响应
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[ConfigController] 获取默认流程配置失败: ${error.message}`);
      return { code: 500, message: `获取默认流程配置失败: ${error.message}`, success: false };
    }
  }

  /**
   * 根据节点类型名称获取其默认运行时配置
   * @param {object} params - 前端传递的参数对象，包含 nodeType
   * @returns {Object} 包含默认运行时配置的响应对象或错误信息
   */
  async getDefaultWorkConfig(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      const config = configService.getDefaultWorkConfig(nodeType);
      
      // 同上，服务层返回空对象 {} 是有效响应
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[ConfigController] 获取默认运行时配置失败: ${error.message}`);
      return { code: 500, message: `获取默认运行时配置失败: ${error.message}`, success: false };
    }
  }
}

module.exports = ConfigController; 