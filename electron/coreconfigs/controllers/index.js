/**
 * @file electron/core/configs/controllers/index.js
 * @description 核心配置控制器，提供管道类型和节点配置查询接口
 */

'use strict';

// 引入配置服务和枚举，避免循环依赖
const services = require('../services');
const { NodeKey } = require('../models');
const { logger } = require('ee-core/log'); // 新增: 引入日志模块

/**
 * 核心配置控制器
 */
class ConfigsController {
  /**
   * 获取所有节点枚举的键名 (旧称 getNodeTypes)
   * @returns {Promise<Object>} 包含节点类型名称列表的响应对象
   */
  async getNodeTypes() {
    try {
      // 获取系统定义的节点类型名称列表（CamelCase 格式）
      const nodeTypeNames = Object.values(NodeKey);
      return { code: 200, data: nodeTypeNames, success: true };
    } catch (error) {
      logger.error(`[CoreConfigsController] 获取节点类型列表失败: ${error.message}`);
      return { code: 500, message: `获取节点类型列表失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取指定节点的类配置 (旧称 getNodeConfigByType)
   * @param {object} params - 参数对象，包含 nodeType (即 nodeKey)
   * @returns {Promise<Object>} 节点类配置或错误信息
   */
  async getNodeConfigByType(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      // 首先尝试从服务获取配置
      let config = await services.getClassConfig(nodeType);
      
      // 节点类型日志记录
      logger.info(`[CoreConfigsController] 获取节点类配置: ${nodeType}`);
      
      // 如果配置不存在且节点类型是SEARCH，提供一个默认配置
      if (config === undefined && nodeType === 'SearchNode') {
        config = {
          id: 'search',
          name: 'search-node',
          type: 'processor',
          tag: 'search',
          description: '搜索节点：用于在知识库中搜索相关内容',
          version: '1.0.0',
          supportedInputPipelines: ['PROMPT', 'CHAT'],
          supportedOutputPipelines: ['PROMPT', 'CHAT']
        };
        logger.info(`[CoreConfigsController] 为SearchNode节点提供默认类配置`);
      }
      
      // 如果配置仍然不存在，返回空对象而不是404，保持向后兼容性
      if (config === undefined) {
        logger.warn(`[CoreConfigsController] 未找到类型为 '${nodeType}' 的节点类配置，返回空对象`);
        config = {};
      }
      
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[CoreConfigsController] 获取节点类配置失败 (nodeType: ${params && params.nodeType}): ${error.message}`);
      return { code: 500, message: `获取节点类配置失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取指定节点的默认流程配置
   * @param {object} params - 参数对象，包含 nodeType (即 nodeKey)
   * @returns {Promise<Object>} 默认流程配置或错误信息
   */
  async getDefaultFlowConfig(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      // 首先尝试从服务获取配置
      let config = await services.getDefaultFlowConfig(nodeType);
      
      // 节点类型日志记录
      logger.info(`[CoreConfigsController] 获取节点默认流程配置: ${nodeType}`);
      
      // 如果配置不存在且节点类型是SearchNode，提供一个默认配置
      if (config === undefined && nodeType === 'SearchNode') {
        config = {
          nodeName: 'Search Node',
          status: 'IDLE'
        };
        logger.info(`[CoreConfigsController] 为SearchNode节点提供默认流程配置`);
      }
      
      // 如果配置仍然不存在，返回空对象而不是404
      if (config === undefined) {
        logger.warn(`[CoreConfigsController] 未找到类型为 '${nodeType}' 的默认流程配置，返回空对象`);
        config = {};
      }
      
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[CoreConfigsController] 获取默认流程配置失败 (nodeType: ${params && params.nodeType}): ${error.message}`);
      return { code: 500, message: `获取默认流程配置失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取指定节点的默认运行时配置
   * @param {object} params - 参数对象，包含 nodeType (即 nodeKey)
   * @returns {Promise<Object>} 默认运行时配置或错误信息
   */
  async getDefaultWorkConfig(params) {
    try {
      const { nodeType } = params;
      if (!nodeType) {
        return { code: 400, message: '节点类型名称 (nodeType) 不能为空', success: false };
      }
      
      // 首先尝试从服务获取配置
      let config = await services.getDefaultWorkConfig(nodeType);
      
      // 节点类型日志记录
      logger.info(`[CoreConfigsController] 获取节点默认运行时配置: ${nodeType}`);
      
      // 如果配置不存在且节点类型是SearchNode，提供一个默认配置
      if (config === undefined && nodeType === 'SearchNode') {
        config = {
          query: '',
          topK: 5,
          baseId: null,
          filterMetadata: {}
        };
        logger.info(`[CoreConfigsController] 为SearchNode节点提供默认运行时配置`);
      }
      
      // 如果配置仍然不存在，返回空对象而不是404
      if (config === undefined) {
        logger.warn(`[CoreConfigsController] 未找到类型为 '${nodeType}' 的默认运行时配置，返回空对象`);
        config = {};
      }
      
      return { code: 200, data: config, success: true };
    } catch (error) {
      logger.error(`[CoreConfigsController] 获取默认运行时配置失败 (nodeType: ${params && params.nodeType}): ${error.message}`);
      return { code: 500, message: `获取默认运行时配置失败: ${error.message}`, success: false };
    }
  }

  /**
   * 获取所有管道类型
   * @returns {Promise<Object>} 管道类型数组或错误信息
   */
  async getAllPipelineTypes() {
    try {
      const pipelineTypes = await services.getAllPipelineTypes();
      return { code: 200, data: pipelineTypes, success: true };
    } catch (error) {
      logger.error(`[CoreConfigsController] 获取管道类型列表失败: ${error.message}`);
      return { code: 500, message: `获取管道类型列表失败: ${error.message}`, success: false };
    }
  }
}

// 支持示例模式
ConfigsController.toString = () => '[class CoreConfigsController]'; // 修改类名以反映其核心角色

module.exports = ConfigsController; 