'use strict';

// 导入模块数据库服务
const { ModuleDbBase } = require('./module-db-base');
const { UserDb, getUserDb } = require('./user-db');
const { KnowledgeDb, getKnowledgeDb } = require('./knowledge-db');

/**
 * 数据库服务索引
 * 导出所有数据库服务和便捷获取方法
 */
module.exports = {
  // 基础类
  ModuleDbBase,
  
  // 用户数据库
  UserDb,
  getUserDb,
  
  // 知识库数据库服务
  KnowledgeDb,
  getKnowledgeDb
}; 