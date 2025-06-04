'use strict';

const UserService = require('./user-service');
const UserKeyService = require('./user-key-service');

/**
 * 获取用户服务实例
 * @returns {UserService}
 */
function getUserService() {
  return new UserService();
}

/**
 * 获取用户密钥服务实例
 * @returns {UserKeyService}
 */
function getUserKeyService() {
  return new UserKeyService();
}

module.exports = {
  UserService,
  UserKeyService,
  getUserService,
  getUserKeyService
}; 