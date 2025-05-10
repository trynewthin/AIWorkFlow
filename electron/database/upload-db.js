'use strict';

const path = require('path');
const fs = require('fs');
const { getDataDir } = require('ee-core/ps');
const { ModuleDbBase } = require('./module-db-base');
const { randomUUID } = require('crypto');

/**
 * 上传服务数据库
 */
class UploadDb extends ModuleDbBase {
  constructor(options = {}) {
    super({ dbname: options.dbname || 'upload.db', moduleId: options.moduleId || 'upload-module' });
    // 上传文件存储目录
    this.uploadDir = path.resolve(getDataDir(), options.uploadDir || 'upload');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    this._initTable();
  }

  /**
   * 初始化表结构
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS upload_files (
        id TEXT PRIMARY KEY,           -- 文件唯一标识
        filename TEXT NOT NULL,        -- 原始文件名
        mimetype TEXT,                 -- 文件 MIME 类型
        size INTEGER NOT NULL,         -- 文件大小（字节）
        path TEXT NOT NULL,            -- 存储相对路径
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP  -- 上传时间
      );
    `;
    this.db.exec(sql);
  }

  /**
   * 保存上传文件，自动生成ID并存储文件及记录
   * @param {{sourcePath:string, filename:string, mimetype:string}} params
   */
  async saveFile({ sourcePath, filename, mimetype }) {
    const id = randomUUID();
    const ext = path.extname(filename);
    const destFilename = id + ext;
    const destPath = path.join(this.uploadDir, destFilename);
    // 复制文件到上传目录
    fs.copyFileSync(sourcePath, destPath);
    const stats = fs.statSync(destPath);
    // 插入数据库记录
    const stmt = this.db.prepare(
      'INSERT INTO upload_files(id, filename, mimetype, size, path) VALUES(?,?,?,?,?)'
    );
    stmt.run(id, filename, mimetype, stats.size, destFilename);
    // 返回记录信息，并添加完整路径
    return { 
      id, 
      filename, 
      mimetype, 
      size: stats.size, 
      path: destFilename,
      fullPath: destPath // 添加完整路径
    };
  }

  /**
   * 根据ID获取文件记录
   * @param {string} id 文件ID
   */
  async getFileById(id) {
    const stmt = this.db.prepare('SELECT * FROM upload_files WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * 列出所有上传文件
   */
  async listFiles() {
    const stmt = this.db.prepare('SELECT * FROM upload_files');
    return stmt.all();
  }

  /**
   * 删除文件记录及实际文件
   * @param {string} id 文件ID
   */
  async deleteFile(id) {
    const record = this.db.prepare('SELECT * FROM upload_files WHERE id = ?').get(id);
    if (!record) {
      return;
    }
    const filePath = path.join(this.uploadDir, record.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const stmt = this.db.prepare('DELETE FROM upload_files WHERE id = ?');
    stmt.run(id);
  }

  /**
   * 获取文件的绝对路径
   * @param {string} id 文件ID
   */
  getFilePath(id) {
    const record = this.db.prepare('SELECT path FROM upload_files WHERE id = ?').get(id);
    if (!record) {
      return null;
    }
    return path.join(this.uploadDir, record.path);
  }
}

UploadDb.toString = () => '[class UploadDb]';

module.exports = {
  UploadDb,
  getUploadDb: (options) => UploadDb.getInstance(options)
}; 