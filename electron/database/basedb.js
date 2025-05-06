'use strict';

const path = require('path');
const { SqliteStorage } = require('ee-core/storage');
const { getDataDir } = require('ee-core/ps');
const { logger } = require('ee-core/log');

/**
 * SQLite 数据库基础服务类
 */
class BasedbService {
  /**
   * 构造函数
   * @param {Object} options
   * @param {string} options.dbname 数据库文件名
   */
  constructor(options) {
    this.dbname = options.dbname;
    this.db = null;
    this.storage = null;
    this._init();
  }

  /**
   * 初始化数据库连接
   */
  _init() {
    // 获取数据目录
    const dataDir = getDataDir();
    // 数据库文件路径
    const dbFile = path.join(dataDir, 'db', this.dbname);
    // SQLite 配置参数
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    };
    // 创建存储实例并建立连接
    this.storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = this.storage.db;
    logger.info(`SQLite database connected, file path: ${dbFile}`);
  }
}

BasedbService.toString = () => '[class BasedbService]';

module.exports = {
  BasedbService
}; 