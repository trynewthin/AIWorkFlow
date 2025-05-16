/**
 * @file frontend/src/services/userService.js
 * @description 用户服务，提供用户相关功能的封装和错误处理
 */
import * as userApi from '../api/user';

/**
 * @async
 * @function register
 * @description 用户注册
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{success: boolean, userId: number, message: string}>}
 * @throws {Error} 注册失败时抛出异常
 */
export async function register(username, password) {
  try {
    const result = await userApi.register(username, password);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '注册失败';
      console.error('用户注册失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('用户注册服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function login
 * @description 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 * @throws {Error} 登录失败时抛出异常
 */
export async function login(username, password) {
  try {
    const result = await userApi.login(username, password);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '登录失败';
      console.error('用户登录失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('用户登录服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function loginByKey
 * @description 通过密钥登录
 * @param {string} keyValue 密钥值
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 * @throws {Error} 登录失败时抛出异常
 */
export async function loginByKey(keyValue) {
  try {
    const result = await userApi.loginByKey(keyValue);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '密钥登录失败';
      console.error('密钥登录失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('密钥登录服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function logout
 * @description 用户登出
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} 登出失败时抛出异常
 */
export async function logout() {
  try {
    const result = await userApi.logout();
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '登出失败';
      console.error('用户登出失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('用户登出服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function getCurrentUser
 * @description 获取当前登录用户
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 * @throws {Error} 获取失败时抛出异常
 */
export async function getCurrentUser() {
  try {
    const result = await userApi.getCurrentUser();
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '获取当前用户失败';
      console.error('获取当前用户失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('获取当前用户服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function isLoggedIn
 * @description 检查用户是否已登录
 * @returns {Promise<boolean>} 是否已登录
 */
export async function isLoggedIn() {
  try {
    const result = await getCurrentUser();
    return result && result.success && result.user;
  } catch (error) {
    return false;
  }
}

/**
 * @async
 * @function getAllUsers
 * @description 获取所有用户
 * @returns {Promise<{success: boolean, users: Array, message: string}>}
 * @throws {Error} 获取失败时抛出异常
 */
export async function getAllUsers() {
  try {
    const result = await userApi.getAllUsers();
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '获取所有用户失败';
      console.error('获取所有用户失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('获取所有用户服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function updateUser
 * @description 更新用户信息
 * @param {number} userId 用户ID
 * @param {Object} userData 用户数据
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} 更新失败时抛出异常
 */
export async function updateUser(userId, userData) {
  try {
    const result = await userApi.updateUser(userId, userData);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '更新用户信息失败';
      console.error('更新用户信息失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('更新用户信息服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function deleteUser
 * @description 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} 删除失败时抛出异常
 */
export async function deleteUser(userId) {
  try {
    const result = await userApi.deleteUser(userId);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '删除用户失败';
      console.error('删除用户失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('删除用户服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function generateKey
 * @description 为用户生成密钥
 * @param {number} userId 用户ID
 * @returns {Promise<{success: boolean, keyId: number, keyValue: string, message: string}>}
 * @throws {Error} 生成失败时抛出异常
 */
export async function generateKey(userId) {
  try {
    const result = await userApi.generateKey(userId);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '生成密钥失败';
      console.error('生成密钥失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('生成密钥服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function generateKeyForCurrentUser
 * @description 为当前登录用户生成密钥
 * @returns {Promise<{success: boolean, keyId: number, keyValue: string, message: string}>}
 * @throws {Error} 生成失败时抛出异常
 */
export async function generateKeyForCurrentUser() {
  try {
    const result = await userApi.generateKeyForCurrentUser();
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '为当前用户生成密钥失败';
      console.error('为当前用户生成密钥失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('为当前用户生成密钥服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function getUserKeys
 * @description 获取用户密钥列表
 * @param {number} userId 用户ID
 * @returns {Promise<{success: boolean, keys: Array, message: string}>}
 * @throws {Error} 获取失败时抛出异常
 */
export async function getUserKeys(userId) {
  try {
    const result = await userApi.getUserKeys(userId);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '获取用户密钥列表失败';
      console.error('获取用户密钥列表失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('获取用户密钥列表服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function getCurrentUserKeys
 * @description 获取当前登录用户的密钥列表
 * @returns {Promise<{success: boolean, keys: Array, message: string}>}
 * @throws {Error} 获取失败时抛出异常
 */
export async function getCurrentUserKeys() {
  try {
    const result = await userApi.getCurrentUserKeys();
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '获取当前用户密钥列表失败';
      console.error('获取当前用户密钥列表失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('获取当前用户密钥列表服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function updateKey
 * @description 更新密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<{success: boolean, keyValue: string, message: string}>}
 * @throws {Error} 更新失败时抛出异常
 */
export async function updateKey(keyId) {
  try {
    const result = await userApi.updateKey(keyId);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '更新密钥失败';
      console.error('更新密钥失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('更新密钥服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function deleteKey
 * @description 删除密钥
 * @param {number} keyId 密钥ID
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} 删除失败时抛出异常
 */
export async function deleteKey(keyId) {
  try {
    const result = await userApi.deleteKey(keyId);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '删除密钥失败';
      console.error('删除密钥失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('删除密钥服务错误:', error);
    throw error;
  }
}

/**
 * @async
 * @function verifyKey
 * @description 验证密钥
 * @param {string} keyValue 密钥值
 * @returns {Promise<{success: boolean, userId: number, message: string}>}
 * @throws {Error} 验证失败时抛出异常
 */
export async function verifyKey(keyValue) {
  try {
    const result = await userApi.verifyKey(keyValue);
    if (result && result.success) {
      return result;
    } else {
      const errorMessage = result ? result.message : '验证密钥失败';
      console.error('验证密钥失败:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('验证密钥服务错误:', error);
    throw error;
  }
} 