'use strict';

const path = require('path');
const { SqliteStorage } = require('ee-core/storage');
const { getDataDir } = require('ee-core/ps');
const { logger } = require('ee-core/log');

/**
 * 数据库连接注册表 - 保存已经创建的数据库连接
 * key: 数据库文件名
 * value: {storage, db} 对象
 */
const DB_REGISTRY = new Map();

/**
 * 模块化数据库基础类
 * 支持单例模式和数据库连接复用
 */
class ModuleDbBase {
  /**
   * 构造函数
   * @param {Object} options 配置项
   * @param {string} options.dbname 数据库文件名
   * @param {string} [options.moduleId] 模块唯一标识，默认使用dbname
   */
  constructor(options) {
    this.dbname = options.dbname;
    this.moduleId = options.moduleId || options.dbname;
    this.db = null;
    this.storage = null;
    this._connectDb();
  }

  /**
   * 连接数据库 (内部方法)
   * @private
   */
  _connectDb() {
    // 首先检查是否已存在此数据库的连接
    const registryKey = this.dbname;
    
    if (DB_REGISTRY.has(registryKey)) {
      // 如果已存在连接，则复用
      const existingConnection = DB_REGISTRY.get(registryKey);
      this.storage = existingConnection.storage;
      this.db = existingConnection.db;
      logger.info(`[${this.moduleId}] Reusing existing SQLite connection: ${this.dbname}`);
    } else {
      // 如果不存在，创建新连接
      const dataDir = getDataDir();
      const dbFile = path.join(dataDir, 'db', this.dbname);
      
      const sqliteOptions = {
        timeout: 6000,
        verbose: console.log
      };
      
      this.storage = new SqliteStorage(dbFile, sqliteOptions);
      this.db = this.storage.db;
      
      // 将新连接保存到注册表
      DB_REGISTRY.set(registryKey, {
        storage: this.storage,
        db: this.db
      });
      
      logger.info(`[${this.moduleId}] New SQLite database connected, file: ${dbFile}`);
    }
  }

  /**
   * 获取此模块数据库的单例
   * @param {Object} [options] 配置选项
   * @returns {ModuleDbBase} 单例实例
   */
  static getInstance(options = {}) {
    const Constructor = this; // 获取调用此方法的具体类
    
    if (!Constructor._instance) {
      Constructor._instance = new Constructor(options);
    }
    
    return Constructor._instance;
  }
}

ModuleDbBase.toString = () => '[class ModuleDbBase]';

module.exports = {
  ModuleDbBase
}; 