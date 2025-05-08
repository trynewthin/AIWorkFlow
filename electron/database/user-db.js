'use strict';

const { ModuleDbBase } = require('./module-db-base');

/**
 * 用户数据库服务
 * 提供用户表的管理功能
 */
class UserDb extends ModuleDbBase {
  constructor(options = {}) {
    // 设置数据库名称和模块ID
    super({
      dbname: options.dbname || 'user-data.db',
      moduleId: 'user-module'
    });
    
    this.userTable = 'user';
    this._initTable();
  }

  /**
   * 初始化用户表
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.userTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,      -- User name
        password TEXT NOT NULL,      -- User password
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation time
      );
    `;
    this.db.exec(sql);
  }

  /**
   * 插入新用户
   * @param {Object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns {number} 新插入记录的 ID
   */
  async addUser({ username, password }) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.userTable} (username, password) VALUES (?, ?)`
    );
    const info = stmt.run(username, password);
    return info.lastInsertRowid;
  }

  /**
   * 根据 ID 查询用户
   * @param {number} id
   * @returns {Object|null}
   */
  async getUserById(id) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userTable} WHERE id = ?`
    );
    return stmt.get(id);
  }

  /**
   * 查询所有用户
   * @returns {Array<Object>}
   */
  async listUsers() {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userTable}`
    );
    return stmt.all();
  }

  /**
   * 更新用户信息
   * @param {number} id
   * @param {Object} data
   * @param {string} [data.username]
   * @param {string} [data.password]
   * @returns {number} 更新的记录数
   */
  async updateUser(id, data) {
    const fields = [];
    const values = [];
    if (data.username !== undefined) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }
    if (fields.length === 0) return 0;
    values.push(id);
    const sql = `UPDATE ${this.userTable} SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(...values);
    return info.changes;
  }

  /**
   * 删除用户
   * @param {number} id
   * @returns {number} 删除的记录数
   */
  async deleteUser(id) {
    const stmt = this.db.prepare(
      `DELETE FROM ${this.userTable} WHERE id = ?`
    );
    const info = stmt.run(id);
    return info.changes;
  }
}

UserDb.toString = () => '[class UserDb]';

// 导出类和便捷的单例获取方法
module.exports = {
  UserDb,
  getUserDb: (options) => UserDb.getInstance(options)
}; 