/**
 * @file BaseService.js
 * @description 基础服务类，定义服务层的职责边界和通用方法
 */
const { logger } = require('ee-core/log');
const { BusinessError, UnauthorizedError, ForbiddenError, NotFoundError } = require('./Validator');

/**
 * 基础服务类
 * 所有业务服务都应该继承此类
 * 
 * 职责边界：
 * - 只处理业务逻辑，不关心响应格式
 * - 只抛出业务异常，不构造响应对象
 * - 专注于数据处理和业务规则验证
 */
class BaseService {
  constructor() {
    this.logger = logger;
  }

  /**
   * 断言条件为真，否则抛出业务错误
   * @param {boolean} condition - 条件表达式
   * @param {string} message - 错误消息
   * @param {string} [code] - 错误代码
   * @throws {BusinessError} 条件为假时抛出
   */
  assert(condition, message, code = 'BUSINESS_ERROR') {
    if (!condition) {
      throw new BusinessError(message, code);
    }
  }

  /**
   * 断言资源存在，否则抛出未找到错误
   * @param {*} resource - 资源对象
   * @param {string} [message] - 自定义错误消息
   * @throws {NotFoundError} 资源不存在时抛出
   */
  assertExists(resource, message = '资源不存在') {
    if (!resource) {
      throw new NotFoundError(message);
    }
  }

  /**
   * 断言用户已登录，否则抛出未授权错误
   * @param {*} user - 用户对象
   * @param {string} [message] - 自定义错误消息
   * @throws {UnauthorizedError} 用户未登录时抛出
   */
  assertAuthenticated(user, message = '用户未登录') {
    if (!user) {
      throw new UnauthorizedError(message);
    }
  }

  /**
   * 断言用户有权限，否则抛出禁止访问错误
   * @param {boolean} hasPermission - 权限检查结果
   * @param {string} [message] - 自定义错误消息
   * @throws {ForbiddenError} 无权限时抛出
   */
  assertAuthorized(hasPermission, message = '无权限访问') {
    if (!hasPermission) {
      throw new ForbiddenError(message);
    }
  }

  /**
   * 安全地获取属性值，避免null/undefined错误
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径，如 'user.profile.name'
   * @param {*} [defaultValue] - 默认值
   * @returns {*} 属性值或默认值
   */
  safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }

    return result;
  }

  /**
   * 过滤对象属性，只保留指定的字段
   * @param {Object} obj - 源对象
   * @param {Array<string>} fields - 要保留的字段列表
   * @returns {Object} 过滤后的对象
   */
  pickFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const result = {};
    for (const field of fields) {
      if (field in obj) {
        result[field] = obj[field];
      }
    }

    return result;
  }

  /**
   * 排除对象的指定属性
   * @param {Object} obj - 源对象
   * @param {Array<string>} fields - 要排除的字段列表
   * @returns {Object} 处理后的对象
   */
  omitFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const result = { ...obj };
    for (const field of fields) {
      delete result[field];
    }

    return result;
  }

  /**
   * 记录业务操作日志
   * @param {string} action - 操作名称
   * @param {Object} [details] - 操作详情
   * @param {*} [userId] - 用户ID
   */
  logAction(action, details = {}, userId = null) {
    const logData = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.logger.info(`业务操作: ${action}`, logData);
  }

  /**
   * 记录业务错误日志
   * @param {string} action - 操作名称
   * @param {Error} error - 错误对象
   * @param {Object} [context] - 错误上下文
   */
  logError(action, error, context = {}) {
    const logData = {
      action,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...context
    };

    this.logger.error(`业务错误: ${action}`, logData);
  }

  /**
   * 验证业务规则
   * @param {Array<Function>} rules - 规则函数数组，每个函数应该抛出异常或返回布尔值
   * @param {Object} [context] - 验证上下文
   */
  async validateBusinessRules(rules, context = {}) {
    for (const rule of rules) {
      if (typeof rule === 'function') {
        const result = await rule(context);
        // 如果规则函数返回false，抛出业务错误
        if (result === false) {
          throw new BusinessError('业务规则验证失败');
        }
      }
    }
  }
}

module.exports = BaseService; 