'use strict';

const { getUserService } = require('../services');
const { logger } = require('ee-core/log');

/**
 * 用户控制器类
 */
class UserController {
  constructor() {
    this.userService = getUserService();
  }

  /**
   * 用户注册
   * @param {Object} args 参数对象
   * @param {string} args.username 用户名
   * @param {string} args.password 密码
   * @returns {Promise<Object>} 注册结果
   */
  async register(args) {
    try {
      const { username, password } = args;
      
      // 验证参数
      if (!username || !password) {
        return { success: false, message: '用户名和密码不能为空' };
      }
      
      // 调用服务层
      return await this.userService.register(username, password);
    } catch (error) {
      logger.error('用户注册控制器错误:', error);
      return { success: false, message: `注册处理失败: ${error.message}` };
    }
  }

  /**
   * 用户登录
   * @param {Object} args 参数对象
   * @param {string} args.username 用户名
   * @param {string} args.password 密码
   * @returns {Promise<Object>} 登录结果
   */
  async login(args) {
    try {
      const { username, password } = args;
      
      // 验证参数
      if (!username || !password) {
        return { success: false, message: '用户名和密码不能为空' };
      }
      
      // 调用服务层
      return await this.userService.login(username, password);
    } catch (error) {
      logger.error('用户登录控制器错误:', error);
      return { success: false, message: `登录处理失败: ${error.message}` };
    }
  }

  /**
   * 获取当前登录用户
   * @returns {Promise<Object>} 当前用户信息
   */
  async getCurrentUser() {
    try {
      return await this.userService.getCurrentUser();
    } catch (error) {
      logger.error('获取当前用户控制器错误:', error);
      return { success: false, message: `获取当前用户失败: ${error.message}` };
    }
  }

  /**
   * 用户登出
   * @returns {Promise<Object>} 登出结果
   */
  async logout() {
    try {
      return await this.userService.logout();
    } catch (error) {
      logger.error('用户登出控制器错误:', error);
      return { success: false, message: `登出处理失败: ${error.message}` };
    }
  }

  /**
   * 更新用户信息
   * @param {Object} args 参数对象
   * @param {number} args.userId 用户ID
   * @param {Object} args.userData 用户数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUser(args) {
    try {
      const { userId, userData } = args;
      
      // 验证参数
      if (!userId || !userData) {
        return { success: false, message: '用户ID和更新数据不能为空' };
      }
      
      // 调用服务层
      return await this.userService.updateUser(userId, userData);
    } catch (error) {
      logger.error('更新用户控制器错误:', error);
      return { success: false, message: `更新用户失败: ${error.message}` };
    }
  }

  /**
   * 删除用户
   * @param {Object} args 参数对象
   * @param {number} args.userId 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(args) {
    try {
      const { userId } = args;
      
      // 验证参数
      if (!userId) {
        return { success: false, message: '用户ID不能为空' };
      }
      
      // 调用服务层
      return await this.userService.deleteUser(userId);
    } catch (error) {
      logger.error('删除用户控制器错误:', error);
      return { success: false, message: `删除用户失败: ${error.message}` };
    }
  }

  /**
   * 获取所有用户
   * @returns {Promise<Object>} 用户列表
   */
  async getAllUsers() {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      logger.error('获取所有用户控制器错误:', error);
      return { success: false, message: `获取用户列表失败: ${error.message}` };
    }
  }
}

module.exports = UserController; 