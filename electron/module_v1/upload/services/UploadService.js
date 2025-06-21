/**
 * @file UploadService.js
 * @description 文件存储服务类，为其他模块提供文件存储功能，实现模块间存储隔离
 */

const BaseService = require('../../../core/baseservice');
const { getUploadDb } = require('../database/UploadDb');
const UploadFile = require('../models/UploadFile');

/**
 * 文件存储服务类
 * 作为其他模块的服务提供者，实现按模块名称的存储隔离
 */
class FileStorageService extends BaseService {
  constructor(options = {}) {
    super();
    this.uploadDb = getUploadDb(options);
  }



  /**
   * 为指定模块存储文件
   * @param {string} moduleName - 模块名称
   * @param {Object} fileParams - 文件参数
   * @param {string} fileParams.sourcePath - 源文件路径
   * @param {string} fileParams.filename - 原始文件名
   * @param {string} fileParams.mimetype - 文件MIME类型
   * @param {string} [fileParams.description] - 文件描述
   * @returns {Promise<UploadFile>} 存储的文件对象
   */
  async storeFile(moduleName, { sourcePath, filename, mimetype, description = null }) {
    this.logAction('模块存储文件开始', { moduleName, filename, mimetype });

    // 验证模块名称
    if (!moduleName || typeof moduleName !== 'string') {
      throw new Error('模块名称不能为空');
    }

    try {
      // 调用数据库层保存文件
      const uploadFile = await this.uploadDb.saveFile({
        moduleName,
        sourcePath,
        filename,
        mimetype,
        description
      });

      this.logAction('模块存储文件成功', { 
        moduleName,
        fileId: uploadFile.id, 
        filename: uploadFile.filename,
        size: uploadFile.size
      });

      return uploadFile;
    } catch (error) {
      this.logError('模块存储文件失败', error, { moduleName, filename, mimetype });
      throw error;
    }
  }

  /**
   * 获取文件信息
   * @param {string} fileId - 文件ID
   * @param {string} [moduleName] - 模块名称（用于权限检查）
   * @returns {Promise<UploadFile>} 文件对象
   */
  async getFileInfo(fileId, moduleName = null) {
    this.logAction('获取文件信息', { fileId, moduleName });

    const file = await this.uploadDb.getFileById(fileId);
    this.assertExists(file, '文件不存在');

    // 如果指定了模块名称，检查文件是否属于该模块
    if (moduleName && file.moduleName !== moduleName) {
      throw new Error(`文件不属于模块 ${moduleName}`);
    }

    return file;
  }

  /**
   * 列出指定模块的文件
   * @param {string} moduleName - 模块名称
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 分页文件列表
   */
  async listModuleFiles(moduleName, options = {}) {
    if (!moduleName) {
      throw new Error('模块名称不能为空');
    }

    const {
      page = 1,
      limit = 10,
      mimetype,
      search
    } = options;

    this.logAction('列出模块文件', { moduleName, page, limit });

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 查询指定模块的文件列表
    const result = await this.uploadDb.listFiles({
      moduleName,
      limit,
      offset,
      mimetype,
      search
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      files: result.files,
      total: result.total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      moduleName
    };
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   * @param {string} [moduleName] - 模块名称（用于权限检查）
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteFile(fileId, moduleName = null) {
    this.logAction('删除文件', { fileId, moduleName });

    const file = await this.uploadDb.getFileById(fileId);
    this.assertExists(file, '文件不存在');

    // 如果指定了模块名称，检查文件是否属于该模块
    if (moduleName && file.moduleName !== moduleName) {
      throw new Error(`文件不属于模块 ${moduleName}`);
    }

    try {
      const success = await this.uploadDb.deleteFile(fileId);
      
      if (success) {
        this.logAction('删除文件成功', { 
          fileId, 
          moduleName: file.moduleName,
          filename: file.filename
        });
      }

      return success;
    } catch (error) {
      this.logError('删除文件失败', error, { fileId, moduleName });
      throw error;
    }
  }

  /**
   * 删除指定模块的所有文件
   * @param {string} moduleName - 模块名称
   * @returns {Promise<number>} 删除的文件数量
   */
  async deleteModuleFiles(moduleName) {
    if (!moduleName) {
      throw new Error('模块名称不能为空');
    }

    this.logAction('删除模块所有文件', { moduleName });

    try {
      const deletedCount = await this.uploadDb.deleteModuleFiles(moduleName);
      
      this.logAction('删除模块所有文件成功', { 
        moduleName, 
        deletedCount 
      });

      return deletedCount;
    } catch (error) {
      this.logError('删除模块所有文件失败', error, { moduleName });
      throw error;
    }
  }

  /**
   * 获取文件的绝对路径
   * @param {string} fileId - 文件ID
   * @param {string} [moduleName] - 模块名称（用于权限检查）
   * @returns {Promise<string>} 文件绝对路径
   */
  async getFilePath(fileId, moduleName = null) {
    // 确保文件存在并属于指定模块
    await this.getFileInfo(fileId, moduleName);

    const filePath = this.uploadDb.getFilePath(fileId);
    this.assertExists(filePath, '文件路径不存在');

    return filePath;
  }

  /**
   * 获取指定模块的存储统计信息
   * @param {string} moduleName - 模块名称
   * @returns {Promise<Object>} 存储统计信息
   */
  async getModuleStorageStats(moduleName) {
    if (!moduleName) {
      throw new Error('模块名称不能为空');
    }

    this.logAction('获取模块存储统计', { moduleName });
    return await this.uploadDb.getStorageStats(moduleName);
  }

  /**
   * 获取所有模块的存储统计信息
   * @returns {Promise<Array>} 模块统计信息数组
   */
  async getAllModuleStats() {
    this.logAction('获取所有模块存储统计');
    return await this.uploadDb.getModuleStats();
  }

  /**
   * 获取全局存储统计信息
   * @returns {Promise<Object>} 全局存储统计信息
   */
  async getGlobalStorageStats() {
    this.logAction('获取全局存储统计');
    return await this.uploadDb.getStorageStats();
  }
}

/**
 * 获取FileStorageService实例
 * @param {Object} [options] - 配置选项
 * @returns {FileStorageService} FileStorageService实例
 */
function getFileStorageService(options) {
  return new FileStorageService(options);
}

module.exports = {
  FileStorageService,
  getFileStorageService
}; 