/**
 * @module WorkflowConfigDb
 * @description 工作流配置数据库服务，提供工作流配置的持久化存储
 */
const { ModuleDbBase } = require('./module-db-base');
const path = require('path');
const { app } = require('electron');

/**
 * @class WorkflowConfigDb
 * @extends ModuleDbBase
 * @description 工作流配置数据库类，负责工作流配置的持久化
 */
class WorkflowConfigDb extends ModuleDbBase {
  constructor() {
    super({
      // 必须指定数据库文件名和模块ID
      dbname: 'workflow-config.db',
      moduleId: 'workflow-config'
    });
    // 初始化表结构
    this._initTable();
  }

  /**
   * @method _initTable
   * @private
   * @description 初始化表结构
   */
  _initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_config (
        name TEXT PRIMARY KEY,
        config TEXT NOT NULL,
        create_time INTEGER,
        update_time INTEGER
      )
    `);
  }

  /**
   * @method saveWorkflowConfig
   * @description 保存工作流配置
   * @param {string} name - 工作流名称
   * @param {Object} config - 工作流配置对象
   * @returns {boolean} 是否成功
   */
  saveWorkflowConfig(name, config) {
    try {
      const now = Date.now();
      const configStr = JSON.stringify(config);
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO workflow_config (name, config, create_time, update_time)
        VALUES (?, ?, 
          COALESCE((SELECT create_time FROM workflow_config WHERE name = ?), ?), 
          ?)
      `);
      // 使用事务确保原子性
      const insertTxn = this.db.transaction((nameParam, cfgParam, timeParam) => {
        stmt.run(nameParam, cfgParam, nameParam, timeParam, timeParam);
      });
      insertTxn(name, configStr, now);
      return true;
    } catch (error) {
      console.error(`保存工作流配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * @method getWorkflowConfig
   * @description 获取指定工作流配置
   * @param {string} name - 工作流名称
   * @returns {Object|null} 工作流配置对象
   */
  getWorkflowConfig(name) {
    try {
      const stmt = this.db.prepare('SELECT config FROM workflow_config WHERE name = ?');
      const row = stmt.get(name);
      
      if (!row) return null;
      
      return JSON.parse(row.config);
    } catch (error) {
      console.error(`获取工作流配置失败: ${error.message}`);
      return null;
    }
  }

  /**
   * @method getAllWorkflowConfigs
   * @description 获取所有工作流配置
   * @returns {Object} 工作流配置对象映射表
   */
  getAllWorkflowConfigs() {
    try {
      const stmt = this.db.prepare('SELECT name, config FROM workflow_config');
      const rows = stmt.all();
      
      const configs = {};
      for (const row of rows) {
        configs[row.name] = JSON.parse(row.config);
      }
      
      return configs;
    } catch (error) {
      console.error(`获取所有工作流配置失败: ${error.message}`);
      return {};
    }
  }

  /**
   * @method removeWorkflowConfig
   * @description 删除工作流配置
   * @param {string} name - 工作流名称
   * @returns {boolean} 是否成功
   */
  removeWorkflowConfig(name) {
    try {
      const deleteStmt = this.db.prepare('DELETE FROM workflow_config WHERE name = ?');
      // 使用事务确保原子性
      const deleteTxn = this.db.transaction((nameParam) => {
        return deleteStmt.run(nameParam);
      });
      const result = deleteTxn(name);
      return result.changes > 0;
    } catch (error) {
      console.error(`删除工作流配置失败: ${error.message}`);
      return false;
    }
  }
}

// 数据库单例
let _instance = null;

/**
 * @function getWorkflowConfigDb
 * @description 获取工作流配置数据库单例
 * @returns {WorkflowConfigDb} 数据库单例
 */
function getWorkflowConfigDb() {
  if (!_instance) {
    _instance = new WorkflowConfigDb();
  }
  return _instance;
}

module.exports = {
  WorkflowConfigDb,
  getWorkflowConfigDb
}; 