'use strict';

/**
 * 用户控制器
 * 负责处理用户相关的请求
 */
class UserController {
  constructor() {
    const { getUserController, getUserKeyController } = require('../users/controllers');
    this.userController = getUserController();
    this.userKeyController = getUserKeyController();
  }

  /**
   * 用户注册
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async register(args) {
    return await this.userController.register(args);
  }

  /**
   * 用户登录
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async login(args) {
    return await this.userController.login(args);
  }

  /**
   * 密钥登录
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async loginByKey(args) {
    return await this.userKeyController.loginByKey(args);
  }

  /**
   * 用户登出
   * @returns {Promise<Object>}
   */
  async logout() {
    return await this.userController.logout();
  }

  /**
   * 获取当前用户
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    return await this.userController.getCurrentUser();
  }

  /**
   * 更新用户
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async updateUser(args) {
    return await this.userController.updateUser(args);
  }

  /**
   * 删除用户
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async deleteUser(args) {
    return await this.userController.deleteUser(args);
  }

  /**
   * 获取所有用户
   * @returns {Promise<Object>}
   */
  async getAllUsers() {
    return await this.userController.getAllUsers();
  }

  /**
   * 为用户生成密钥
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async generateKey(args) {
    return await this.userKeyController.generateKey(args);
  }

  /**
   * 为当前用户生成密钥
   * @returns {Promise<Object>}
   */
  async generateKeyForCurrentUser() {
    return await this.userKeyController.generateKeyForCurrentUser();
  }

  /**
   * 获取用户密钥列表
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async getUserKeys(args) {
    return await this.userKeyController.getUserKeys(args);
  }

  /**
   * 获取当前用户密钥列表
   * @returns {Promise<Object>}
   */
  async getCurrentUserKeys() {
    return await this.userKeyController.getCurrentUserKeys();
  }

  /**
   * 更新密钥
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async updateKey(args) {
    return await this.userKeyController.updateKey(args);
  }

  /**
   * 删除密钥
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async deleteKey(args) {
    return await this.userKeyController.deleteKey(args);
  }

  /**
   * 验证密钥
   * @param {Object} args 参数对象
   * @returns {Promise<Object>}
   */
  async verifyKey(args) {
    return await this.userKeyController.verifyKey(args);
  }
}

// 导出类而非实例
module.exports = UserController; 