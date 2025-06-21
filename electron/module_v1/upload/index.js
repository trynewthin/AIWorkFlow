/**
 * @file index.js
 * @description 文件存储服务模块入口文件
 * 提供跨模块的文件存储服务，实现存储隔离
 */

const { FileStorageService, getFileStorageService } = require('./services/UploadService');
const { UploadDb, getUploadDb } = require('./database/UploadDb');
const UploadFile = require('./models/UploadFile');
const UploadConfig = require('./config/UploadConfig');

module.exports = {
  // 主要服务 - 其他模块应该使用这个
  FileStorageService,
  getFileStorageService,
  
  // 底层组件（一般不直接使用）
  UploadDb,
  getUploadDb,
  UploadFile,
  UploadConfig
}; 