'use strict';

const crypto = require('crypto');
const { getUserDb } = require('../../database');
const { logger } = require('ee-core/log');

/**
 * 用户服务类，提供用户相关的业务逻辑
 */
class UserService {
  constructor() {
    this.userDb = getUserDb();
  }

  /**
   * 用户注册
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {Promise<{success: boolean, userId: number, message: string}>}
   */
  async register(username, password) {
    try {
      // 检查用户是否已存在
      const existingUser = await this.userDb.getUserByUsername(username);
      if (existingUser) {
        return { success: false, message: '用户名已存在' };
      }
      
      // 加密密码
      const hashedPassword = this._hashPassword(password);
      
      // 创建用户
      const userId = await this.userDb.addUser({
        username,
        password: hashedPassword
      });
      
      return { success: true, userId, message: '注册成功' };
    } catch (error) {
      logger.error('用户注册失败:', error);
      return { success: false, message: `注册失败: ${error.message}` };
    }
  }

  /**
   * 用户登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {Promise<{success: boolean, user: Object, message: string}>}
   */
  async login(username, password) {
    try {
      // 查找用户
      const user = await this.userDb.getUserByUsername(username);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 验证密码
      const hashedPassword = this._hashPassword(password);
      if (user.password !== hashedPassword) {
        return { success: false, message: '密码错误' };
      }
      
      // 重置所有用户登录状态
      await this.userDb.resetAllLoginStatus();
      
      // 设置当前用户为登录状态
      await this.userDb.setUserLoginStatus(user.id, true);
      
      // 返回不带密码的用户信息
      const { password: _, ...userInfo } = user;
      
      return { success: true, user: userInfo, message: '登录成功' };
    } catch (error) {
      logger.error('用户登录失败:', error);
      return { success: false, message: `登录失败: ${error.message}` };
    }
  }

  /**
   * 通过密钥登录
   * @param {string} keyValue 密钥值
   * @returns {Promise<{success: boolean, user: Object, message: string}>}
   */
  async loginByKey(keyValue) {
    try {
      // 查找密钥
      const keyInfo = await this.userDb.getKeyByValue(keyValue);
      if (!keyInfo) {
        return { success: false, message: '无效的密钥' };
      }
      
      // 根据密钥关联的用户ID获取用户
      const user = await this.userDb.getUserById(keyInfo.user_id);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 重置所有用户登录状态
      await this.userDb.resetAllLoginStatus();
      
      // 设置当前用户为登录状态
      await this.userDb.setUserLoginStatus(user.id, true);
      
      // 返回不带密码的用户信息
      const { password: _, ...userInfo } = user;
      
      return { success: true, user: userInfo, message: '密钥登录成功' };
    } catch (error) {
      logger.error('密钥登录失败:', error);
      return { success: false, message: `密钥登录失败: ${error.message}` };
    }
  }

  /**
   * 用户登出
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async logout() {
    try {
      // 重置所有用户登录状态
      await this.userDb.resetAllLoginStatus();
      return { success: true, message: '登出成功' };
    } catch (error) {
      logger.error('用户登出失败:', error);
      return { success: false, message: `登出失败: ${error.message}` };
    }
  }

  /**
   * 获取当前登录用户
   * @returns {Promise<{success: boolean, user: Object, message: string}>}
   */
  async getCurrentUser() {
    try {
      const user = await this.userDb.getCurrentLoggedInUser();
      if (!user) {
        return { success: false, message: '当前无登录用户' };
      }
      
      // 返回不带密码的用户信息
      const { password: _, ...userInfo } = user;
      
      return { success: true, user: userInfo, message: '获取成功' };
    } catch (error) {
      logger.error('获取当前用户失败:', error);
      return { success: false, message: `获取当前用户失败: ${error.message}` };
    }
  }

  /**
   * 更新用户信息
   * @param {number} userId 用户ID
   * @param {Object} userData 用户数据
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async updateUser(userId, userData) {
    try {
      // 如果要更新密码，先加密
      if (userData.password) {
        userData.password = this._hashPassword(userData.password);
      }
      
      const result = await this.userDb.updateUser(userId, userData);
      if (result === 0) {
        return { success: false, message: '用户不存在或无数据更新' };
      }
      
      return { success: true, message: '用户信息更新成功' };
    } catch (error) {
      logger.error('更新用户信息失败:', error);
      return { success: false, message: `更新失败: ${error.message}` };
    }
  }

  /**
   * 删除用户
   * @param {number} userId 用户ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteUser(userId) {
    try {
      // 先删除该用户的所有密钥
      await this.userDb.deleteAllUserKeys(userId);
      
      // 然后删除用户
      const result = await this.userDb.deleteUser(userId);
      if (result === 0) {
        return { success: false, message: '用户不存在或删除失败' };
      }
      
      return { success: true, message: '用户删除成功' };
    } catch (error) {
      logger.error('删除用户失败:', error);
      return { success: false, message: `删除失败: ${error.message}` };
    }
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<{success: boolean, users: Array, message: string}>}
   */
  async getAllUsers() {
    try {
      const users = await this.userDb.listUsers();
      
      // 移除所有用户的密码信息
      const safeUsers = users.map(user => {
        const { password: _, ...safeUser } = user;
        return safeUser;
      });
      
      return { success: true, users: safeUsers, message: '获取用户列表成功' };
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      return { success: false, message: `获取失败: ${error.message}` };
    }
  }

  /**
   * 密码加密
   * @private
   * @param {string} password 原始密码
   * @returns {string} 加密后的密码
   */
  _hashPassword(password) {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }
}

module.exports = UserService; 