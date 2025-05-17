/**
 * @file frontend/src/api/user.ts
 * @description 用户 API 封装
 */
import { ipc } from '../utils/ipcRenderer';
import ipcApiRoute from './ipcApiRoute';

/**
 * 用户信息接口
 */
export interface User {
  id: number;
  username: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户密钥接口
 */
export interface UserKey {
  id: number;
  userId: number;
  keyValue: string;
  description?: string;
  lastUsed?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 登录返回数据接口
 */
export interface LoginResult {
  user: User;
  token: string;
}

/**
 * 用户注册
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<ApiResponse<User>>} 注册结果
 */
export function register(username: string, password: string): Promise<ApiResponse<User>> {
  return ipc?.invoke(ipcApiRoute.userRegister, { username, password });
}

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<ApiResponse<LoginResult>>} 登录结果
 */
export function login(username: string, password: string): Promise<ApiResponse<LoginResult>> {
  return ipc?.invoke(ipcApiRoute.userLogin, { username, password });
}

/**
 * 通过密钥登录
 * @param {string} keyValue 密钥值
 * @returns {Promise<ApiResponse<LoginResult>>} 登录结果
 */
export function loginByKey(keyValue: string): Promise<ApiResponse<LoginResult>> {
  return ipc?.invoke(ipcApiRoute.userLoginByKey, { keyValue });
}

/**
 * 用户登出
 * @returns {Promise<ApiResponse<boolean>>} 登出结果
 */
export function logout(): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.userLogout, {});
}

/**
 * 获取当前登录用户
 * @returns {Promise<ApiResponse<User>>} 当前用户信息
 */
export function getCurrentUser(): Promise<ApiResponse<User>> {
  return ipc?.invoke(ipcApiRoute.userGetCurrentUser, {});
}

/**
 * 获取所有用户
 * @returns {Promise<ApiResponse<User[]>>} 用户列表
 */
export function getAllUsers(): Promise<ApiResponse<User[]>> {
  return ipc?.invoke(ipcApiRoute.userGetAllUsers, {});
}

/**
 * 更新用户信息
 * @param {number} userId 用户ID
 * @param {Partial<User>} userData 用户数据
 * @returns {Promise<ApiResponse<User>>} 更新结果
 */
export function updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse<User>> {
  return ipc?.invoke(ipcApiRoute.userUpdateUser, { userId, userData });
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise<ApiResponse<boolean>>} 删除结果
 */
export function deleteUser(userId: number): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.userDeleteUser, { userId });
}

/**
 * 为用户生成密钥
 * @param {number} userId 用户ID
 * @returns {Promise<ApiResponse<UserKey>>} 生成结果
 */
export function generateKey(userId: number): Promise<ApiResponse<UserKey>> {
  return ipc?.invoke(ipcApiRoute.userGenerateKey, { userId });
}

/**
 * 为当前登录用户生成密钥
 * @returns {Promise<ApiResponse<UserKey>>} 生成结果
 */
export function generateKeyForCurrentUser(): Promise<ApiResponse<UserKey>> {
  return ipc?.invoke(ipcApiRoute.userGenerateKeyForCurrentUser, {});
}

/**
 * 获取用户密钥列表
 * @param {number} userId 用户ID
 * @returns {Promise<ApiResponse<UserKey[]>>} 密钥列表
 */
export function getUserKeys(userId: number): Promise<ApiResponse<UserKey[]>> {
  return ipc?.invoke(ipcApiRoute.userGetUserKeys, { userId });
}

/**
 * 获取当前登录用户的密钥列表
 * @returns {Promise<ApiResponse<UserKey[]>>} 密钥列表
 */
export function getCurrentUserKeys(): Promise<ApiResponse<UserKey[]>> {
  return ipc?.invoke(ipcApiRoute.userGetCurrentUserKeys, {});
}

/**
 * 更新密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<ApiResponse<UserKey>>} 更新结果
 */
export function updateKey(keyId: number): Promise<ApiResponse<UserKey>> {
  return ipc?.invoke(ipcApiRoute.userUpdateKey, { keyId });
}

/**
 * 删除密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<ApiResponse<boolean>>} 删除结果
 */
export function deleteKey(keyId: number): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.userDeleteKey, { keyId });
}

/**
 * 验证密钥
 * @param {string} keyValue 密钥值
 * @returns {Promise<ApiResponse<boolean>>} 验证结果
 */
export function verifyKey(keyValue: string): Promise<ApiResponse<boolean>> {
  return ipc?.invoke(ipcApiRoute.userVerifyKey, { keyValue });
} 