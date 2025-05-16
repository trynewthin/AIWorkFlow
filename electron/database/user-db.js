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
    this.userKeyTable = 'user_key'; // 添加用户密钥表名
    this._initTable();
  }

  /**
   * 初始化用户表
   * @private
   */
  _initTable() {
    // 用户表 SQL
    const userSql = `
      CREATE TABLE IF NOT EXISTS ${this.userTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,      -- User name
        password TEXT NOT NULL,      -- User password
        is_logged_in INTEGER DEFAULT 0, -- 是否当前登录(0:否, 1:是)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation time
      );
    `;
    this.db.exec(userSql);
    
    // 用户密钥表 SQL
    const userKeySql = `
      CREATE TABLE IF NOT EXISTS ${this.userKeyTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,    -- 用户ID
        key_value TEXT NOT NULL,     -- 用户密钥
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 创建时间
        FOREIGN KEY (user_id) REFERENCES ${this.userTable}(id) ON DELETE CASCADE
      );
    `;
    this.db.exec(userKeySql);
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
   * 根据用户名查询用户
   * @param {string} username
   * @returns {Object|null}
   */
  async getUserByUsername(username) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userTable} WHERE username = ?`
    );
    return stmt.get(username);
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
   * @param {number} [data.is_logged_in]
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
    if (data.is_logged_in !== undefined) {
      fields.push('is_logged_in = ?');
      values.push(data.is_logged_in);
    }
    if (fields.length === 0) return 0;
    values.push(id);
    const sql = `UPDATE ${this.userTable} SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(...values);
    return info.changes;
  }

  /**
   * 设置用户登录状态
   * @param {number} id 
   * @param {boolean} isLoggedIn 
   * @returns {number} 更新的记录数
   */
  async setUserLoginStatus(id, isLoggedIn) {
    return this.updateUser(id, { is_logged_in: isLoggedIn ? 1 : 0 });
  }

  /**
   * 重置所有用户的登录状态为未登录
   * @returns {number} 更新的记录数
   */
  async resetAllLoginStatus() {
    const sql = `UPDATE ${this.userTable} SET is_logged_in = 0`;
    const stmt = this.db.prepare(sql);
    const info = stmt.run();
    return info.changes;
  }

  /**
   * 获取当前登录的用户
   * @returns {Object|null} 登录用户信息
   */
  async getCurrentLoggedInUser() {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userTable} WHERE is_logged_in = 1 LIMIT 1`
    );
    return stmt.get();
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

  // ===== 用户密钥相关操作 =====

  /**
   * 为用户添加密钥
   * @param {number} userId 
   * @param {string} keyValue 
   * @returns {number} 新插入记录的ID
   */
  async addUserKey(userId, keyValue) {
    const stmt = this.db.prepare(
      `INSERT INTO ${this.userKeyTable} (user_id, key_value) VALUES (?, ?)`
    );
    const info = stmt.run(userId, keyValue);
    return info.lastInsertRowid;
  }

  /**
   * 获取用户的所有密钥
   * @param {number} userId 
   * @returns {Array<Object>} 密钥列表
   */
  async getUserKeys(userId) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userKeyTable} WHERE user_id = ?`
    );
    return stmt.all(userId);
  }

  /**
   * 根据ID获取密钥
   * @param {number} keyId 
   * @returns {Object|null} 密钥信息
   */
  async getKeyById(keyId) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userKeyTable} WHERE id = ?`
    );
    return stmt.get(keyId);
  }

  /**
   * 根据密钥值获取密钥信息
   * @param {string} keyValue 
   * @returns {Object|null} 密钥信息
   */
  async getKeyByValue(keyValue) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.userKeyTable} WHERE key_value = ?`
    );
    return stmt.get(keyValue);
  }

  /**
   * 更新密钥
   * @param {number} keyId 
   * @param {string} newKeyValue 
   * @returns {number} 更新的记录数
   */
  async updateUserKey(keyId, newKeyValue) {
    const stmt = this.db.prepare(
      `UPDATE ${this.userKeyTable} SET key_value = ? WHERE id = ?`
    );
    const info = stmt.run(newKeyValue, keyId);
    return info.changes;
  }

  /**
   * 删除密钥
   * @param {number} keyId 
   * @returns {number} 删除的记录数
   */
  async deleteUserKey(keyId) {
    const stmt = this.db.prepare(
      `DELETE FROM ${this.userKeyTable} WHERE id = ?`
    );
    const info = stmt.run(keyId);
    return info.changes;
  }

  /**
   * 删除用户的所有密钥
   * @param {number} userId 
   * @returns {number} 删除的记录数
   */
  async deleteAllUserKeys(userId) {
    const stmt = this.db.prepare(
      `DELETE FROM ${this.userKeyTable} WHERE user_id = ?`
    );
    const info = stmt.run(userId);
    return info.changes;
  }
}

UserDb.toString = () => '[class UserDb]';

// 导出类和便捷的单例获取方法
module.exports = {
  UserDb,
  getUserDb: (options) => UserDb.getInstance(options)
}; 