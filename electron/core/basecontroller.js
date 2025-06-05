/**
 * @file electron/core/basecontroller.js
 * @description 控制器基类，提供统一的错误处理、响应格式和参数验证功能
 */

'use strict';

const { logger } = require('ee-core/log');

/**
 * 控制器基类
 * 专注于控制器层的核心职责：
 * - 统一的请求处理和错误处理
 * - 标准化的响应格式
 * - 基本的参数验证框架
 * - 详细的日志记录
 */
class BaseController {
  constructor(moduleName = 'BaseController') {
    this.moduleName = moduleName;
    this.logger = logger;
  }

  /**
   * 统一的请求处理包装器
   * 提供自动的错误处理、日志记录和响应格式化
   * @param {Function} handler 业务处理函数
   * @param {Object} params 请求参数
   * @param {string} methodName 方法名称（用于日志）
   * @param {Object} validationSchema 参数验证Schema（可选）
   * @returns {Promise<Object>} 标准化响应对象
   */
  async handleRequest(handler, params = {}, methodName = 'unknown', validationSchema = null) {
    const startTime = Date.now();
    this.logger.info(`[${this.moduleName}] 开始执行 ${methodName}`, { 
      params: this._sanitizeParams(params),
      timestamp: new Date().toISOString()
    });

    try {
      // 参数验证
      if (validationSchema) {
        params = this.validateParams(params, validationSchema, methodName);
      }

      // 执行业务逻辑
      const result = await handler(params);
      
      const duration = Date.now() - startTime;
      this.logger.info(`[${this.moduleName}] ${methodName} 执行成功`, { 
        duration: `${duration}ms`,
        hasData: !!result
      });

      return this.success(result, '操作成功');
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`[${this.moduleName}] ${methodName} 执行失败`, {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
        params: this._sanitizeParams(params)
      });

      return this.error(error.message, this._getErrorCode(error));
    }
  }

  /**
   * 成功响应
   * @param {any} data 响应数据
   * @param {string} message 响应消息
   * @param {number} code 响应代码
   * @returns {Object} 标准化成功响应
   */
  success(data = null, message = '操作成功', code = 200) {
    return {
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 错误响应
   * @param {string} message 错误消息
   * @param {number} code 错误代码
   * @param {string} error 详细错误信息
   * @returns {Object} 标准化错误响应
   */
  error(message = '操作失败', code = 500, error = null) {
    return {
      success: false,
      code,
      message,
      error: error || message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 参数验证错误响应
   * @param {string} message 验证错误消息
   * @returns {Object} 参数验证错误响应
   */
  validationError(message) {
    return this.error(`参数验证失败: ${message}`, 400, message);
  }

  /**
   * 资源不存在错误响应
   * @param {string} resource 资源名称
   * @returns {Object} 404错误响应
   */
  notFound(resource = '资源') {
    return this.error(`${resource}不存在`, 404);
  }

  /**
   * 权限不足错误响应
   * @param {string} action 操作名称
   * @returns {Object} 403错误响应
   */
  forbidden(action = '执行此操作') {
    return this.error(`没有权限${action}`, 403);
  }

  /**
   * 参数验证
   * @param {Object} params 参数对象
   * @param {Object} schema 验证Schema
   * @param {string} methodName 方法名称
   * @returns {Object} 验证后的参数
   * @throws {Error} 验证失败时抛出错误
   */
  validateParams(params, schema, methodName = 'unknown') {
    try {
      // 必填参数检查
      if (schema.required) {
        for (const field of schema.required) {
          if (params[field] === undefined || params[field] === null || params[field] === '') {
            throw new Error(`${field} 不能为空`);
          }
        }
      }

      // 类型检查
      if (schema.types) {
        for (const [field, expectedType] of Object.entries(schema.types)) {
          if (params[field] !== undefined) {
            const actualType = typeof params[field];
            if (actualType !== expectedType) {
              throw new Error(`${field} 类型错误，期望 ${expectedType}，实际 ${actualType}`);
            }
          }
        }
      }

      // 自定义验证规则
      if (schema.validators) {
        for (const [field, validator] of Object.entries(schema.validators)) {
          if (params[field] !== undefined) {
            const isValid = validator(params[field]);
            if (!isValid) {
              throw new Error(`${field} 格式不正确`);
            }
          }
        }
      }

      // 数值范围检查
      if (schema.ranges) {
        for (const [field, range] of Object.entries(schema.ranges)) {
          if (params[field] !== undefined) {
            const value = params[field];
            if (range.min !== undefined && value < range.min) {
              throw new Error(`${field} 不能小于 ${range.min}`);
            }
            if (range.max !== undefined && value > range.max) {
              throw new Error(`${field} 不能大于 ${range.max}`);
            }
          }
        }
      }

      return params;
    } catch (error) {
      this.logger.warn(`[${this.moduleName}] ${methodName} 参数验证失败`, {
        error: error.message,
        params: this._sanitizeParams(params)
      });
      throw error;
    }
  }

  /**
   * 获取错误代码
   * @param {Error} error 错误对象
   * @returns {number} 错误代码
   * @private
   */
  _getErrorCode(error) {
    if (error.message.includes('不能为空') || error.message.includes('参数验证失败')) {
      return 400;
    }
    if (error.message.includes('不存在') || error.message.includes('未找到')) {
      return 404;
    }
    if (error.message.includes('权限') || error.message.includes('unauthorized')) {
      return 403;
    }
    if (error.message.includes('已存在') || error.message.includes('重复')) {
      return 409;
    }
    return 500;
  }

  /**
   * 清理敏感参数用于日志记录
   * @param {Object} params 参数对象
   * @returns {Object} 清理后的参数对象
   * @private
   */
  _sanitizeParams(params) {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authCode', 'auth_code'];
    const sanitized = { ...params };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    }
    
    return sanitized;
  }
}

module.exports = BaseController;
