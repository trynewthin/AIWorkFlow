'use strict';

const { ModuleDbBase } = require('./module-db-base');

const TABLE_NAME = 'node_configs';

/**
 * @class NodeConfigDb
 * @description 节点配置数据库服务
 */
class NodeConfigDb extends ModuleDbBase {
  constructor(options = {}) {
    super({
      dbname: options.dbname || 'node-config-data.db',
      moduleId: 'node-config-module'
    });
    this._initTable();
  }

  /**
   * @override
   * @description 初始化节点配置表结构
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        node_name TEXT PRIMARY KEY, -- 节点名称
        config TEXT NOT NULL,       -- 节点配置 (JSON 字符串)
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    this.db.exec(sql);
  }

  /**
   * @description 保存或更新节点配置
   * @param {string} nodeName - 节点名称
   * @param {Object} config - 节点配置对象
   * @returns {Object} better-sqlite3 runInfo
   */
  saveNodeConfig(nodeName, config) {
    const stmt = this.db.prepare(
      `INSERT INTO ${TABLE_NAME} (node_name, config, updated_at)
       VALUES (@nodeName, @config, CURRENT_TIMESTAMP)
       ON CONFLICT(node_name) DO UPDATE SET
         config = excluded.config,
         updated_at = CURRENT_TIMESTAMP;`
    );
    return stmt.run({ nodeName, config: JSON.stringify(config) });
  }

  /**
   * @description 获取节点配置
   * @param {string} nodeName - 节点名称
   * @returns {Object|null} 节点配置对象，如果不存在则返回 null
   */
  getNodeConfig(nodeName) {
    const stmt = this.db.prepare(
      `SELECT config FROM ${TABLE_NAME} WHERE node_name = ?`
    );
    const row = stmt.get(nodeName);
    return row ? JSON.parse(row.config) : null;
  }

  /**
   * @description 删除节点配置
   * @param {string} nodeName - 节点名称
   * @returns {Object} better-sqlite3 runInfo
   */
  deleteNodeConfig(nodeName) {
    const stmt = this.db.prepare(
      `DELETE FROM ${TABLE_NAME} WHERE node_name = ?`
    );
    return stmt.run(nodeName);
  }
}

NodeConfigDb.toString = () => '[class NodeConfigDb]';

// 导出类和便捷的单例获取方法
module.exports = {
  NodeConfigDb,
  getNodeConfigDb: (options) => NodeConfigDb.getInstance(options)
}; 