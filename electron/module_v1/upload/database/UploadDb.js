/**
 * @file UploadDb.js
 * @description 优化版本的文件上传数据库类，支持更多功能和更好的错误处理
 */

const path = require('path');
const fs = require('fs');
const { getDataDir } = require('ee-core/ps');
const { ModuleDbBase } = require('../../../core/basemoduledb');
const { randomUUID } = require('crypto');
const UploadFile = require('../models/UploadFile');
const { NotFoundError, BusinessError } = require('../../../core/Validator');

/**
 * 文件上传数据库类
 */
class UploadDb extends ModuleDbBase {
  constructor(options = {}) {
    super({ 
      dbname: options.dbname || 'upload_v1.db', 
      moduleId: options.moduleId || 'upload-v1-module' 
    });
    
    // 配置选项
    this.options = {
      maxFileSize: options.maxFileSize || 100 * 1024 * 1024, // 默认100MB
      allowedMimeTypes: options.allowedMimeTypes || [], // 空数组表示允许所有类型
      uploadDir: options.uploadDir || 'upload_v1',
      ...options
    };
    
    // 上传文件存储目录
    this.uploadDir = path.resolve(getDataDir(), this.options.uploadDir);
    this._ensureUploadDir();
    this._initTable();
  }

  /**
   * 确保模块上传目录存在
   * @param {string} moduleName - 模块名称
   * @private
   */
  _ensureModuleUploadDir(moduleName) {
    // 创建模块根目录
    const moduleDir = path.join(this.uploadDir, moduleName);
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // 创建子目录（按年月分类）
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const subDir = path.join(moduleDir, yearMonth);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    return subDir;
  }

  /**
   * 初始化表结构
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS upload_files (
        id TEXT PRIMARY KEY,                    -- 文件唯一标识
        module_name TEXT NOT NULL,              -- 所属模块名称
        filename TEXT NOT NULL,                 -- 原始文件名
        mimetype TEXT,                          -- 文件 MIME 类型
        size INTEGER NOT NULL,                  -- 文件大小（字节）
        path TEXT NOT NULL,                     -- 存储相对路径
        description TEXT,                       -- 文件描述
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP  -- 上传时间
      );

      CREATE INDEX IF NOT EXISTS idx_upload_files_module_name ON upload_files(module_name);
      CREATE INDEX IF NOT EXISTS idx_upload_files_mimetype ON upload_files(mimetype);
      CREATE INDEX IF NOT EXISTS idx_upload_files_upload_time ON upload_files(upload_time);
    `;
    this.db.exec(sql);
  }

  /**
   * 验证文件类型和大小
   * @param {string} mimetype - 文件MIME类型
   * @param {number} size - 文件大小
   * @throws {BusinessError} 验证失败时抛出
   * @private
   */
  _validateFile(mimetype, size) {
    // 检查文件大小
    if (size > this.options.maxFileSize) {
      throw new BusinessError(`文件大小超过限制，最大允许${Math.round(this.options.maxFileSize / 1024 / 1024)}MB`);
    }

    // 检查文件类型
    if (this.options.allowedMimeTypes.length > 0 && !this.options.allowedMimeTypes.includes(mimetype)) {
      throw new BusinessError(`不支持的文件类型: ${mimetype}`);
    }
  }

  /**
   * 生成唯一的文件路径
   * @param {string} moduleName - 模块名称
   * @param {string} filename - 原始文件名
   * @returns {string} 相对存储路径
   * @private
   */
  _generateFilePath(moduleName, filename) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ext = path.extname(filename);
    const id = randomUUID();
    return `${moduleName}/${yearMonth}/${id}${ext}`;
  }



  /**
   * 保存上传文件
   * @param {Object} params - 上传参数
   * @param {string} params.moduleName - 模块名称
   * @param {string} params.sourcePath - 源文件路径
   * @param {string} params.filename - 原始文件名
   * @param {string} params.mimetype - 文件MIME类型
   * @param {string} [params.description] - 文件描述
   * @returns {UploadFile} 上传文件对象
   */
  async saveFile({ moduleName, sourcePath, filename, mimetype, description = null }) {
    // 检查源文件是否存在
    if (!fs.existsSync(sourcePath)) {
      throw new NotFoundError('源文件不存在');
    }

    const stats = fs.statSync(sourcePath);
    
    // 验证模块名称
    if (!moduleName || typeof moduleName !== 'string') {
      throw new BusinessError('模块名称不能为空');
    }

    // 验证文件
    this._validateFile(mimetype, stats.size);

    // 确保模块上传目录存在
    this._ensureModuleUploadDir(moduleName);

    // 生成新的文件路径
    const relativePath = this._generateFilePath(moduleName, filename);
    const destPath = path.join(this.uploadDir, relativePath);

    // 确保目标目录存在
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 复制文件
    fs.copyFileSync(sourcePath, destPath);

    // 生成文件ID
    const id = randomUUID();

    // 插入数据库记录
    const stmt = this.db.prepare(`
      INSERT INTO upload_files(id, module_name, filename, mimetype, size, path, description) 
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, moduleName, filename, mimetype, stats.size, relativePath, description);

    // 返回文件对象
    return new UploadFile({
      id,
      moduleName,
      filename,
      mimetype,
      size: stats.size,
      path: relativePath,
      fullPath: destPath,
      description,
      uploadTime: new Date().toISOString()
    });
  }

  /**
   * 根据ID获取文件
   * @param {string} id - 文件ID
   * @returns {UploadFile|null} 文件对象
   */
  async getFileById(id) {
    const stmt = this.db.prepare('SELECT * FROM upload_files WHERE id = ?');
    const record = stmt.get(id);
    
    if (!record) {
      return null;
    }

    return new UploadFile({
      ...record,
      moduleName: record.module_name,
      uploadTime: record.upload_time,
      fullPath: path.join(this.uploadDir, record.path)
    });
  }

  /**
   * 列出文件（支持分页和过滤）
   * @param {Object} options - 查询选项
   * @param {string} [options.moduleName] - 模块名称（必须指定以实现隔离）
   * @param {number} [options.limit=10] - 每页数量
   * @param {number} [options.offset=0] - 偏移量
   * @param {string} [options.mimetype] - 文件类型
   * @param {string} [options.search] - 搜索关键词（在文件名中搜索）
   * @returns {Object} 包含files和total的结果对象
   */
  async listFiles(options = {}) {
    const {
      moduleName,
      limit = 10,
      offset = 0,
      mimetype,
      search
    } = options;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // 如果指定了模块名称，只查询该模块的文件
    if (moduleName) {
      whereClause += ' AND module_name = ?';
      params.push(moduleName);
    }

    if (mimetype) {
      whereClause += ' AND mimetype = ?';
      params.push(mimetype);
    }

    if (search) {
      whereClause += ' AND filename LIKE ?';
      params.push(`%${search}%`);
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM upload_files ${whereClause}`;
    const countStmt = this.db.prepare(countSql);
    const { total } = countStmt.get(...params);

    // 获取文件列表
    const listSql = `
      SELECT * FROM upload_files 
      ${whereClause} 
      ORDER BY upload_time DESC 
      LIMIT ? OFFSET ?
    `;
    const listStmt = this.db.prepare(listSql);
    const records = listStmt.all(...params, limit, offset);

    const files = records.map(record => new UploadFile({
      ...record,
      moduleName: record.module_name,
      uploadTime: record.upload_time,
      fullPath: path.join(this.uploadDir, record.path)
    }));

    return { files, total };
  }





  /**
   * 删除文件（删除数据库记录和物理文件）
   * @param {string} id - 文件ID
   * @returns {boolean} 删除是否成功
   */
  async deleteFile(id) {
    const record = this.db.prepare('SELECT * FROM upload_files WHERE id = ?').get(id);
    if (!record) {
      return false;
    }

    // 删除物理文件
    const filePath = path.join(this.uploadDir, record.path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.warn(`删除物理文件失败: ${filePath}`, error);
      }
    }

    // 删除数据库记录
    const stmt = this.db.prepare('DELETE FROM upload_files WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 获取文件的绝对路径
   * @param {string} id - 文件ID
   * @returns {string|null} 文件绝对路径
   */
  getFilePath(id) {
    const record = this.db.prepare('SELECT path FROM upload_files WHERE id = ?').get(id);
    if (!record) {
      return null;
    }
    return path.join(this.uploadDir, record.path);
  }

  /**
   * 批量删除模块的所有文件
   * @param {string} moduleName - 模块名称
   * @returns {number} 删除的文件数量
   */
  async deleteModuleFiles(moduleName) {
    if (!moduleName) {
      throw new BusinessError('模块名称不能为空');
    }

    // 获取模块的所有文件
    const stmt = this.db.prepare('SELECT * FROM upload_files WHERE module_name = ?');
    const files = stmt.all(moduleName);

    let deletedCount = 0;

    for (const file of files) {
      // 删除物理文件
      const filePath = path.join(this.uploadDir, file.path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`删除物理文件失败: ${filePath}`, error);
          continue;
        }
      }

      // 删除数据库记录
      const deleteStmt = this.db.prepare('DELETE FROM upload_files WHERE id = ?');
      const result = deleteStmt.run(file.id);
      if (result.changes > 0) {
        deletedCount++;
      }
    }

    // 尝试删除空的模块目录
    const moduleDir = path.join(this.uploadDir, moduleName);
    if (fs.existsSync(moduleDir)) {
      try {
        // 递归删除空目录
        this._removeEmptyDirs(moduleDir);
      } catch (error) {
        console.warn(`删除模块目录失败: ${moduleDir}`, error);
      }
    }

    return deletedCount;
  }

  /**
   * 递归删除空目录
   * @param {string} dirPath - 目录路径
   * @private
   */
  _removeEmptyDirs(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    
    // 递归删除子目录
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        this._removeEmptyDirs(fullPath);
      }
    }

    // 如果目录为空，删除它
    const remainingFiles = fs.readdirSync(dirPath);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * 获取存储统计信息
   * @param {string} [moduleName] - 模块名称，不指定则统计所有模块
   * @returns {Object} 存储统计信息
   */
  async getStorageStats(moduleName) {
    let sql = `
      SELECT 
        COUNT(*) as totalFiles,
        SUM(size) as totalSize
      FROM upload_files
    `;
    
    const params = [];
    
    if (moduleName) {
      sql += ' WHERE module_name = ?';
      params.push(moduleName);
    }

    const stats = this.db.prepare(sql).get(...params);

    const result = {
      totalFiles: stats.totalFiles || 0,
      totalSize: stats.totalSize || 0,
      formattedTotalSize: this._formatBytes(stats.totalSize || 0)
    };

    if (moduleName) {
      result.moduleName = moduleName;
    }

    return result;
  }

  /**
   * 获取所有模块的统计信息
   * @returns {Array} 模块统计信息数组
   */
  async getModuleStats() {
    const stats = this.db.prepare(`
      SELECT 
        module_name,
        COUNT(*) as fileCount,
        SUM(size) as totalSize
      FROM upload_files
      GROUP BY module_name
      ORDER BY totalSize DESC
    `).all();

    return stats.map(stat => ({
      moduleName: stat.module_name,
      fileCount: stat.fileCount || 0,
      totalSize: stat.totalSize || 0,
      formattedTotalSize: this._formatBytes(stat.totalSize || 0)
    }));
  }

  /**
   * 格式化字节数
   * @param {number} bytes - 字节数
   * @returns {string} 格式化的大小字符串
   * @private
   */
  _formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }


}

/**
 * 获取UploadDb实例
 * @param {Object} [options] - 配置选项
 * @returns {UploadDb} UploadDb实例
 */
function getUploadDb(options) {
  return UploadDb.getInstance(options);
}

module.exports = {
  UploadDb,
  getUploadDb
}; 