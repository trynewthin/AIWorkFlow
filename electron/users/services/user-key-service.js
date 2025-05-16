'use strict';

const crypto = require('crypto');
const { getUserDb } = require('../../database');
const { logger } = require('ee-core/log');

/**
 * 用户密钥服务类，提供密钥相关的业务逻辑
 */
class UserKeyService {
  constructor() {
    this.userDb = getUserDb();
  }

  /**
   * 为用户生成新密钥
   * @param {number} userId 用户ID
   * @returns {Promise<{success: boolean, keyId: number, keyValue: string, message: string}>}
   */
  async generateKey(userId) {
    try {
      // 验证用户是否存在
      const user = await this.userDb.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 生成随机密钥
      const keyValue = this._generateRandomKey();
      
      // 保存密钥
      const keyId = await this.userDb.addUserKey(userId, keyValue);
      
      return { 
        success: true, 
        keyId, 
        keyValue,
        message: '密钥生成成功' 
      };
    } catch (error) {
      logger.error('生成密钥失败:', error);
      return { success: false, message: `生成密钥失败: ${error.message}` };
    }
  }

  /**
   * 获取用户的所有密钥
   * @param {number} userId 用户ID
   * @returns {Promise<{success: boolean, keys: Array, message: string}>}
   */
  async getUserKeys(userId) {
    try {
      // 验证用户是否存在
      const user = await this.userDb.getUserById(userId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }
      
      // 获取用户密钥列表
      const keys = await this.userDb.getUserKeys(userId);
      
      return { success: true, keys, message: '获取密钥列表成功' };
    } catch (error) {
      logger.error('获取用户密钥列表失败:', error);
      return { success: false, message: `获取密钥列表失败: ${error.message}` };
    }
  }

  /**
   * 更新密钥
   * @param {number} keyId 密钥ID
   * @returns {Promise<{success: boolean, keyValue: string, message: string}>}
   */
  async updateKey(keyId) {
    try {
      // 验证密钥是否存在
      const keyInfo = await this.userDb.getKeyById(keyId);
      if (!keyInfo) {
        return { success: false, message: '密钥不存在' };
      }
      
      // 生成新密钥
      const newKeyValue = this._generateRandomKey();
      
      // 更新密钥
      const result = await this.userDb.updateUserKey(keyId, newKeyValue);
      if (result === 0) {
        return { success: false, message: '密钥更新失败' };
      }
      
      return { success: true, keyValue: newKeyValue, message: '密钥更新成功' };
    } catch (error) {
      logger.error('更新密钥失败:', error);
      return { success: false, message: `更新密钥失败: ${error.message}` };
    }
  }

  /**
   * 删除密钥
   * @param {number} keyId 密钥ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteKey(keyId) {
    try {
      // 验证密钥是否存在
      const keyInfo = await this.userDb.getKeyById(keyId);
      if (!keyInfo) {
        return { success: false, message: '密钥不存在' };
      }
      
      // 删除密钥
      const result = await this.userDb.deleteUserKey(keyId);
      if (result === 0) {
        return { success: false, message: '密钥删除失败' };
      }
      
      return { success: true, message: '密钥删除成功' };
    } catch (error) {
      logger.error('删除密钥失败:', error);
      return { success: false, message: `删除密钥失败: ${error.message}` };
    }
  }

  /**
   * 验证密钥
   * @param {string} keyValue 密钥值
   * @returns {Promise<{success: boolean, userId: number, message: string}>}
   */
  async verifyKey(keyValue) {
    try {
      // 查找密钥
      const keyInfo = await this.userDb.getKeyByValue(keyValue);
      if (!keyInfo) {
        return { success: false, message: '无效的密钥' };
      }
      
      // 验证用户是否存在
      const user = await this.userDb.getUserById(keyInfo.user_id);
      if (!user) {
        return { success: false, message: '密钥对应的用户不存在' };
      }
      
      return { success: true, userId: user.id, message: '密钥验证成功' };
    } catch (error) {
      logger.error('验证密钥失败:', error);
      return { success: false, message: `验证密钥失败: ${error.message}` };
    }
  }

  /**
   * 生成随机密钥
   * @private
   * @returns {string} 随机密钥
   */
  _generateRandomKey() {
    // 生成24字节的随机数，然后转为36进制字符串
    return crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
  }
}

module.exports = UserKeyService; 