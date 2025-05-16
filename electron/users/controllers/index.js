'use strict';

const UserController = require('./user-controller');
const UserKeyController = require('./user-key-controller');

/**
 * 获取用户控制器实例
 * @returns {UserController}
 */
function getUserController() {
  return new UserController();
}

/**
 * 获取用户密钥控制器实例
 * @returns {UserKeyController}
 */
function getUserKeyController() {
  return new UserKeyController();
}

module.exports = {
  UserController,
  UserKeyController,
  getUserController,
  getUserKeyController
}; 