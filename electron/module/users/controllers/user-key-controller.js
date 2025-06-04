'use strict';

const { getUserKeyService, getUserService } = require('../services');
const { logger } = require('ee-core/log');

/**
 * 用户密钥控制器类
 */
class UserKeyController {
  constructor() {
    this.userKeyService = getUserKeyService();
    this.userService = getUserService();
  }

  /**
   * 登录用户通过密钥登录
   * @param {Object} args 参数对象
   * @param {string} args.keyValue 密钥值
   * @returns {Promise<Object>} 登录结果
   */
  async loginByKey(args) {
    try {
      const { keyValue } = args;
      
      // 验证参数
      if (!keyValue) {
        return { success: false, message: '密钥不能为空' };
      }
      
      // 调用服务层
      return await this.userService.loginByKey(keyValue);
    } catch (error) {
      logger.error('密钥登录控制器错误:', error);
      return { success: false, message: `密钥登录失败: ${error.message}` };
    }
  }

  /**
   * 为用户生成新密钥
   * @param {Object} args 参数对象
   * @param {number} args.userId 用户ID
   * @returns {Promise<Object>} 生成结果
   */
  async generateKey(args) {
    try {
      const { userId } = args;
      
      // 验证参数
      if (!userId) {
        return { success: false, message: '用户ID不能为空' };
      }
      
      // 调用服务层
      return await this.userKeyService.generateKey(userId);
    } catch (error) {
      logger.error('生成密钥控制器错误:', error);
      return { success: false, message: `生成密钥失败: ${error.message}` };
    }
  }

  /**
   * 为当前登录用户生成新密钥
   * @returns {Promise<Object>} 生成结果
   */
  async generateKeyForCurrentUser() {
    try {
      // 获取当前登录用户
      const { success, user, message } = await this.userService.getCurrentUser();
      if (!success) {
        return { success: false, message };
      }
      
      // 调用服务层
      return await this.userKeyService.generateKey(user.id);
    } catch (error) {
      logger.error('为当前用户生成密钥控制器错误:', error);
      return { success: false, message: `生成密钥失败: ${error.message}` };
    }
  }

  /**
   * 获取用户的所有密钥
   * @param {Object} args 参数对象
   * @param {number} args.userId 用户ID
   * @returns {Promise<Object>} 密钥列表
   */
  async getUserKeys(args) {
    try {
      const { userId } = args;
      
      // 验证参数
      if (!userId) {
        return { success: false, message: '用户ID不能为空' };
      }
      
      // 调用服务层
      return await this.userKeyService.getUserKeys(userId);
    } catch (error) {
      logger.error('获取用户密钥控制器错误:', error);
      return { success: false, message: `获取密钥列表失败: ${error.message}` };
    }
  }

  /**
   * 获取当前登录用户的所有密钥
   * @returns {Promise<Object>} 密钥列表
   */
  async getCurrentUserKeys() {
    try {
      // 获取当前登录用户
      const { success, user, message } = await this.userService.getCurrentUser();
      if (!success) {
        return { success: false, message };
      }
      
      // 调用服务层
      return await this.userKeyService.getUserKeys(user.id);
    } catch (error) {
      logger.error('获取当前用户密钥控制器错误:', error);
      return { success: false, message: `获取密钥列表失败: ${error.message}` };
    }
  }

  /**
   * 更新密钥
   * @param {Object} args 参数对象
   * @param {number} args.keyId 密钥ID
   * @returns {Promise<Object>} 更新结果
   */
  async updateKey(args) {
    try {
      const { keyId } = args;
      
      // 验证参数
      if (!keyId) {
        return { success: false, message: '密钥ID不能为空' };
      }
      
      // 调用服务层
      return await this.userKeyService.updateKey(keyId);
    } catch (error) {
      logger.error('更新密钥控制器错误:', error);
      return { success: false, message: `更新密钥失败: ${error.message}` };
    }
  }

  /**
   * 删除密钥
   * @param {Object} args 参数对象
   * @param {number} args.keyId 密钥ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteKey(args) {
    try {
      const { keyId } = args;
      
      // 验证参数
      if (!keyId) {
        return { success: false, message: '密钥ID不能为空' };
      }
      
      // 调用服务层
      return await this.userKeyService.deleteKey(keyId);
    } catch (error) {
      logger.error('删除密钥控制器错误:', error);
      return { success: false, message: `删除密钥失败: ${error.message}` };
    }
  }

  /**
   * 验证密钥
   * @param {Object} args 参数对象
   * @param {string} args.keyValue 密钥值
   * @returns {Promise<Object>} 验证结果
   */
  async verifyKey(args) {
    try {
      const { keyValue } = args;
      
      // 验证参数
      if (!keyValue) {
        return { success: false, message: '密钥不能为空' };
      }
      
      // 调用服务层
      return await this.userKeyService.verifyKey(keyValue);
    } catch (error) {
      logger.error('验证密钥控制器错误:', error);
      return { success: false, message: `验证密钥失败: ${error.message}` };
    }
  }
}

module.exports = UserKeyController; 