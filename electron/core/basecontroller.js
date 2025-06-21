/**
 * @file BaseController.js
 * @description 基础控制器类，提供统一的错误处理和响应格式
 */
const ResponseHandler = require('./ResponseHandler');
const { Validator } = require('./Validator');

/**
 * 基础控制器类
 * 所有业务控制器都应该继承此类
 */
class BaseController {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 安全执行方法，统一处理错误和响应格式
   * @param {Function} handler - 业务处理函数
   * @param {string} [context] - 错误上下文描述
   * @returns {Promise<ApiResponse>} 标准化响应
   */
  async safeExecute(handler, context = '操作') {
    try {
      const result = await handler();
      
      // 如果返回结果已经是标准格式，直接返回
      if (result && typeof result === 'object' && 'success' in result && 'code' in result) {
        return result;
      }
      
      // 否则包装为成功响应
      return ResponseHandler.success(result);
    } catch (error) {
      return ResponseHandler.handleError(error, context);
    }
  }

  /**
   * 验证参数并安全执行
   * @param {Object} params - 参数对象
   * @param {Object} rules - 验证规则
   * @param {Function} handler - 业务处理函数
   * @param {string} [context] - 错误上下文描述
   * @returns {Promise<ApiResponse>} 标准化响应
   */
  async validateAndExecute(params, rules, handler, context = '操作') {
    return this.safeExecute(async () => {
      // 先进行参数验证
      Validator.validate(params, rules);
      
      // 验证通过后执行业务逻辑
      return await handler();
    }, context);
  }

  /**
   * 获取分页参数
   * @param {Object} params - 原始参数
   * @returns {Object} 分页参数 { page, limit, offset }
   */
  getPaginationParams(params) {
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
  }

  /**
   * 格式化分页响应
   * @param {Array} data - 数据列表
   * @param {number} total - 总数
   * @param {Object} pagination - 分页参数
   * @returns {Object} 分页响应数据
   */
  formatPaginationResponse(data, total, pagination) {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    return {
      items: data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = BaseController; 