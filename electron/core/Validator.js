/**
 * @file Validator.js
 * @description 通用参数验证器，提供常用的验证规则和自定义验证功能
 */

/**
 * 验证错误类
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * 业务错误类
 */
class BusinessError extends Error {
  constructor(message, code = 'BUSINESS_ERROR') {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
  }
}

/**
 * 未授权错误类
 */
class UnauthorizedError extends Error {
  constructor(message = '用户未登录') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 禁止访问错误类
 */
class ForbiddenError extends Error {
  constructor(message = '无权限访问') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 资源不存在错误类
 */
class NotFoundError extends Error {
  constructor(message = '资源不存在') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * 验证器类
 */
class Validator {
  /**
   * 验证必填参数
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @throws {ValidationError} 验证失败时抛出
   */
  static required(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName}不能为空`);
    }
  }

  /**
   * 验证字符串类型和长度
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @param {Object} [options] - 选项
   * @param {number} [options.minLength] - 最小长度
   * @param {number} [options.maxLength] - 最大长度
   * @throws {ValidationError} 验证失败时抛出
   */
  static string(value, fieldName, options = {}) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName}必须是字符串类型`);
      }
      
      if (options.minLength !== undefined && value.length < options.minLength) {
        throw new ValidationError(`${fieldName}长度不能少于${options.minLength}个字符`);
      }
      
      if (options.maxLength !== undefined && value.length > options.maxLength) {
        throw new ValidationError(`${fieldName}长度不能超过${options.maxLength}个字符`);
      }
    }
  }

  /**
   * 验证数字类型和范围
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @param {Object} [options] - 选项
   * @param {number} [options.min] - 最小值
   * @param {number} [options.max] - 最大值
   * @param {boolean} [options.integer] - 是否必须是整数
   * @throws {ValidationError} 验证失败时抛出
   */
  static number(value, fieldName, options = {}) {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        throw new ValidationError(`${fieldName}必须是有效的数字`);
      }
      
      if (options.integer && !Number.isInteger(num)) {
        throw new ValidationError(`${fieldName}必须是整数`);
      }
      
      if (options.min !== undefined && num < options.min) {
        throw new ValidationError(`${fieldName}不能小于${options.min}`);
      }
      
      if (options.max !== undefined && num > options.max) {
        throw new ValidationError(`${fieldName}不能大于${options.max}`);
      }
    }
  }

  /**
   * 验证数组类型和长度
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @param {Object} [options] - 选项
   * @param {number} [options.minLength] - 最小长度
   * @param {number} [options.maxLength] - 最大长度
   * @throws {ValidationError} 验证失败时抛出
   */
  static array(value, fieldName, options = {}) {
    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        throw new ValidationError(`${fieldName}必须是数组类型`);
      }
      
      if (options.minLength !== undefined && value.length < options.minLength) {
        throw new ValidationError(`${fieldName}至少需要${options.minLength}个元素`);
      }
      
      if (options.maxLength !== undefined && value.length > options.maxLength) {
        throw new ValidationError(`${fieldName}最多允许${options.maxLength}个元素`);
      }
    }
  }

  /**
   * 验证ID格式（可以是数字或UUID字符串）
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @throws {ValidationError} 验证失败时抛出
   */
  static id(value, fieldName) {
    if (value !== undefined && value !== null && value !== '') {
      // 检查是否是正整数
      if (Number.isInteger(Number(value)) && Number(value) > 0) {
        return;
      }
      
      // 检查是否是UUID格式
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (typeof value === 'string' && uuidRegex.test(value)) {
        return;
      }
      
      throw new ValidationError(`${fieldName}格式无效`);
    }
  }

  /**
   * 验证邮箱格式
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @throws {ValidationError} 验证失败时抛出
   */
  static email(value, fieldName) {
    if (value !== undefined && value !== null && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new ValidationError(`${fieldName}格式无效`);
      }
    }
  }

  /**
   * 验证参数对象
   * @param {Object} params - 参数对象
   * @param {Object} rules - 验证规则
   * @throws {ValidationError} 验证失败时抛出
   * 
   * @example
   * Validator.validate(params, {
   *   id: { required: true, type: 'id' },
   *   name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
   *   age: { type: 'number', min: 0, max: 120, integer: true },
   *   email: { type: 'email' }
   * });
   */
  static validate(params, rules) {
    const errors = [];
    
    for (const [fieldName, rule] of Object.entries(rules)) {
      try {
        const value = params[fieldName];
        
        // 检查必填项
        if (rule.required) {
          this.required(value, fieldName);
        }
        
        // 如果值存在，进行类型和格式验证
        if (value !== undefined && value !== null && value !== '') {
          switch (rule.type) {
            case 'string':
              this.string(value, fieldName, rule);
              break;
            case 'number':
              this.number(value, fieldName, rule);
              break;
            case 'array':
              this.array(value, fieldName, rule);
              break;
            case 'id':
              this.id(value, fieldName);
              break;
            case 'email':
              this.email(value, fieldName);
              break;
          }
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push({
            field: fieldName,
            message: error.message
          });
        } else {
          throw error;
        }
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError('参数验证失败', errors);
    }
  }
}

module.exports = {
  Validator,
  ValidationError,
  BusinessError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
}; 