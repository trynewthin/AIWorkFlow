'use strict';

/**
 * 用户模块API路由配置
 */
module.exports = {
  // 用户身份验证相关接口
  'controller/user/register': {
    controller: 'user',
    desc: '用户注册'
  },
  'controller/user/login': {
    controller: 'user',
    desc: '用户登录'
  },
  'controller/user/loginByKey': {
    controller: 'user',
    desc: '用户通过密钥登录'
  },
  'controller/user/logout': {
    controller: 'user',
    desc: '用户登出'
  },
  'controller/user/getCurrentUser': {
    controller: 'user',
    desc: '获取当前登录用户'
  },
  
  // 用户信息管理相关接口
  'controller/user/getAllUsers': {
    controller: 'user',
    desc: '获取所有用户'
  },
  'controller/user/updateUser': {
    controller: 'user',
    desc: '更新用户信息'
  },
  'controller/user/deleteUser': {
    controller: 'user',
    desc: '删除用户'
  },
  
  // 用户密钥相关接口
  'controller/user/generateKey': {
    controller: 'user',
    desc: '为用户生成密钥'
  },
  'controller/user/generateKeyForCurrentUser': {
    controller: 'user',
    desc: '为当前用户生成密钥'
  },
  'controller/user/getUserKeys': {
    controller: 'user',
    desc: '获取用户密钥列表'
  },
  'controller/user/getCurrentUserKeys': {
    controller: 'user',
    desc: '获取当前用户密钥列表'
  },
  'controller/user/updateKey': {
    controller: 'user',
    desc: '更新密钥'
  },
  'controller/user/deleteKey': {
    controller: 'user',
    desc: '删除密钥'
  },
  'controller/user/verifyKey': {
    controller: 'user',
    desc: '验证密钥'
  }
}; 