'use strict';

const { BasedbService } = require('./basedb');

/**
 * SQLite 数据库服务，继承自 BasedbService
 */
class SqlitedbService extends BasedbService {
  constructor() {
    // 数据库文件名，可根据需求修改
    super({ dbname: 'sqlite-demo.db' });
    this.userTable = 'user';
    this._initTable();
  }

  /**
   * 初始化 user 表
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.userTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
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

SqlitedbService.toString = () => '[class SqlitedbService]';

module.exports = {
  SqlitedbService
}; 