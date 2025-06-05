/**
 * @file electron/core/baseservice.js
 * @description 服务层基类，提供统一的业务逻辑处理和服务状态管理功能
 */

'use strict';

const { logger } = require('ee-core/log');

/**
 * 服务层基类
 * 专注于服务层的核心职责：
 * - 统一的业务逻辑处理包装器
 * - 服务状态管理和初始化
 * - 标准化的业务响应格式
 */
class BaseService {
  constructor(serviceName = 'BaseService') {
    this.serviceName = serviceName;
    this.logger = logger;
    this.initialized = false;
    this.status = 'idle';
  }

  /**
   * 服务初始化方法（子类应重写此方法）
   * @returns {Promise<void>}
   */
  async initService() {
    this.logger.info(`[${this.serviceName}] 正在初始化服务...`);
    this.initialized = true;
    this.status = 'ready';
    this.logger.info(`[${this.serviceName}] 服务初始化完成`);
  }

  /**
   * 检查服务是否已初始化
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态信息
   */
  getStatus() {
    return {
      serviceName: this.serviceName,
      initialized: this.initialized,
      status: this.status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.logger.info(`[${this.serviceName}] 正在重置服务...`);
    this.initialized = false;
    this.status = 'idle';
    this.logger.info(`[${this.serviceName}] 服务已重置`);
  }

  /**
   * 统一的业务处理包装器
   * 提供自动的错误处理和日志记录
   * @param {Function} handler 业务处理函数
   * @param {string} methodName 方法名称
   * @param {Object} params 参数（用于日志）
   * @param {Object} options 选项 { skipValidation: boolean }
   * @returns {Promise<any>} 处理结果
   */
  async handleBusinessLogic(handler, methodName = 'unknown', params = {}, options = {}) {
    const { skipValidation = false } = options;
    const startTime = Date.now();
    
    this.logger.info(`[${this.serviceName}] 开始执行 ${methodName}`, {
      params: this._sanitizeParams(params),
      timestamp: new Date().toISOString()
    });

    try {
      // 检查服务是否已初始化
      if (!skipValidation && !this.isInitialized()) {
        throw new Error(`${this.serviceName} 尚未初始化`);
      }

      // 执行业务逻辑
      const result = await handler(params);
      
      const duration = Date.now() - startTime;
      this.logger.info(`[${this.serviceName}] ${methodName} 执行成功`, {
        duration: `${duration}ms`,
        hasResult: !!result
      });

      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`[${this.serviceName}] ${methodName} 执行失败`, {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
        params: this._sanitizeParams(params)
      });
      throw error;
    }
  }

  /**
   * 返回成功结果的标准格式
   * @param {any} data 数据
   * @param {string} message 消息
   * @returns {Object} 成功结果
   */
  success(data = null, message = '操作成功') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 返回失败结果的标准格式
   * @param {string} message 错误消息
   * @param {any} error 错误详情
   * @returns {Object} 失败结果
   */
  failure(message = '操作失败', error = null) {
    return {
      success: false,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理敏感参数用于日志记录
   * @protected
   * @param {Object} params 参数对象
   * @returns {Object} 清理后的参数对象
   */
  _sanitizeParams(params) {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authCode', 'auth_code', 'accessToken'];
    const sanitized = { ...params };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    }
    
    return sanitized;
  }
}

module.exports = BaseService; 