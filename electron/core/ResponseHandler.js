/**
 * @file ResponseHandler.js
 * @description 统一响应处理器，提供标准化的API响应格式
 */
const { logger } = require('ee-core/log');

/**
 * 统一响应格式
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码 (200: 成功, 400: 参数错误, 401: 未授权, 403: 禁止访问, 404: 不存在, 500: 服务器错误)
 * @property {boolean} success - 请求是否成功
 * @property {string} [message] - 响应消息
 * @property {*} [data] - 响应数据
 * @property {Array} [errors] - 错误详情数组（仅在失败时存在）
 */

/**
 * 响应处理器类
 */
class ResponseHandler {
  /**
   * 成功响应
   * @param {*} data - 响应数据
   * @param {string} [message] - 成功消息
   * @returns {ApiResponse} 标准化响应
   */
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      success: true,
      message,
      data
    };
  }

  /**
   * 参数错误响应
   * @param {string} message - 错误消息
   * @param {Array} [errors] - 详细错误信息
   * @returns {ApiResponse} 标准化响应
   */
  static badRequest(message = '参数错误', errors = null) {
    const response = {
      code: 400,
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return response;
  }

  /**
   * 未授权响应
   * @param {string} [message] - 错误消息
   * @returns {ApiResponse} 标准化响应
   */
  static unauthorized(message = '用户未登录') {
    return {
      code: 401,
      success: false,
      message
    };
  }

  /**
   * 禁止访问响应
   * @param {string} [message] - 错误消息
   * @returns {ApiResponse} 标准化响应
   */
  static forbidden(message = '无权限访问') {
    return {
      code: 403,
      success: false,
      message
    };
  }

  /**
   * 资源不存在响应
   * @param {string} [message] - 错误消息
   * @returns {ApiResponse} 标准化响应
   */
  static notFound(message = '资源不存在') {
    return {
      code: 404,
      success: false,
      message
    };
  }

  /**
   * 服务器错误响应
   * @param {string|Error} error - 错误信息或错误对象
   * @param {string} [message] - 自定义错误消息
   * @returns {ApiResponse} 标准化响应
   */
  static serverError(error, message = '服务器内部错误') {
    // 记录详细错误日志
    if (error instanceof Error) {
      logger.error('服务器错误:', error);
      message = `${message}: ${error.message}`;
    } else if (typeof error === 'string') {
      logger.error('服务器错误:', error);
      message = `${message}: ${error}`;
    } else {
      logger.error('服务器错误:', error);
    }

    return {
      code: 500,
      success: false,
      message
    };
  }

  /**
   * 通用错误处理方法
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文描述
   * @returns {ApiResponse} 标准化响应
   */
  static handleError(error, context = '操作') {
    if (error.name === 'ValidationError') {
      return this.badRequest(`${context}参数验证失败`, error.errors);
    }
    
    if (error.name === 'UnauthorizedError') {
      return this.unauthorized(error.message);
    }
    
    if (error.name === 'ForbiddenError') {
      return this.forbidden(error.message);
    }
    
    if (error.name === 'NotFoundError') {
      return this.notFound(error.message);
    }
    
    return this.serverError(error, `${context}失败`);
  }
}

module.exports = ResponseHandler; 