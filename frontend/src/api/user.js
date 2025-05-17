/**
 * @file frontend/src/api/user.js
 * @description 用户 API 封装
 */
import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 用户注册
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<Object>} 注册结果
 */
export function register(username, password) {
  return ipc.invoke(ipcApiRoute.userRegister, { username, password });
}

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<Object>} 登录结果
 */
export function login(username, password) {
  return ipc.invoke(ipcApiRoute.userLogin, { username, password });
}

/**
 * 通过密钥登录
 * @param {string} keyValue 密钥值
 * @returns {Promise<Object>} 登录结果
 */
export function loginByKey(keyValue) {
  return ipc.invoke(ipcApiRoute.userLoginByKey, { keyValue });
}

/**
 * 用户登出
 * @returns {Promise<Object>} 登出结果
 */
export function logout() {
  return ipc.invoke(ipcApiRoute.userLogout, {});
}

/**
 * 获取当前登录用户
 * @returns {Promise<Object>} 当前用户信息
 */
export function getCurrentUser() {
  return ipc.invoke(ipcApiRoute.userGetCurrentUser, {});
}

/**
 * 获取所有用户
 * @returns {Promise<Object>} 用户列表
 */
export function getAllUsers() {
  return ipc.invoke(ipcApiRoute.userGetAllUsers, {});
}

/**
 * 更新用户信息
 * @param {number} userId 用户ID
 * @param {Object} userData 用户数据
 * @returns {Promise<Object>} 更新结果
 */
export function updateUser(userId, userData) {
  return ipc.invoke(ipcApiRoute.userUpdateUser, { userId, userData });
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise<Object>} 删除结果
 */
export function deleteUser(userId) {
  return ipc.invoke(ipcApiRoute.userDeleteUser, { userId });
}

/**
 * 为用户生成密钥
 * @param {number} userId 用户ID
 * @returns {Promise<Object>} 生成结果
 */
export function generateKey(userId) {
  return ipc.invoke(ipcApiRoute.userGenerateKey, { userId });
}

/**
 * 为当前登录用户生成密钥
 * @returns {Promise<Object>} 生成结果
 */
export function generateKeyForCurrentUser() {
  return ipc.invoke(ipcApiRoute.userGenerateKeyForCurrentUser, {});
}

/**
 * 获取用户密钥列表
 * @param {number} userId 用户ID
 * @returns {Promise<Object>} 密钥列表
 */
export function getUserKeys(userId) {
  return ipc.invoke(ipcApiRoute.userGetUserKeys, { userId });
}

/**
 * 获取当前登录用户的密钥列表
 * @returns {Promise<Object>} 密钥列表
 */
export function getCurrentUserKeys() {
  return ipc.invoke(ipcApiRoute.userGetCurrentUserKeys, {});
}

/**
 * 更新密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<Object>} 更新结果
 */
export function updateKey(keyId) {
  return ipc.invoke(ipcApiRoute.userUpdateKey, { keyId });
}

/**
 * 删除密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<Object>} 删除结果
 */
export function deleteKey(keyId) {
  return ipc.invoke(ipcApiRoute.userDeleteKey, { keyId });
}

/**
 * 验证密钥
 * @param {string} keyValue 密钥值
 * @returns {Promise<Object>} 验证结果
 */
export function verifyKey(keyValue) {
  return ipc.invoke(ipcApiRoute.userVerifyKey, { keyValue });
} 