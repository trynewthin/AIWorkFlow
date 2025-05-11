'use strict';

// 导入模块数据库服务
const { ModuleDbBase } = require('./module-db-base');
const { UserDb, getUserDb } = require('./user-db');
const { KnowledgeDb, getKnowledgeDb } = require('./knowledge-db');
const { HNSWDb, getHNSWDb } = require('./hnsw-db');
const { UploadDb, getUploadDb } = require('./upload-db');
const { NodeConfigDb, getNodeConfigDb } = require('./node-config-db');
const { WorkflowConfigDb, getWorkflowConfigDb } = require('./workflow-config-db');

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
  getKnowledgeDb,
  
  // HNSW 索引管理服务
  HNSWDb,
  getHNSWDb,
  
  // 上传数据库服务
  UploadDb,
  getUploadDb,
  
  // 新增导出
  NodeConfigDb,
  getNodeConfigDb,
  WorkflowConfigDb,
  getWorkflowConfigDb
}; 