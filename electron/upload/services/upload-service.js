'use strict';

const { getUploadDb } = require('../../database');

/**
 * 上传文件服务
 * @class UploadService
 */
class UploadService {
  constructor() {
    // TODO: 获取上传数据库实例
    this.uploadDb = getUploadDb();
  }

  /**
   * 上传文件并保存记录
   * @param {{sourcePath:string, filename:string, mimetype:string}} params
   * @returns {{id:string, filename:string, mimetype:string, size:number, path:string}}
   */
  async uploadFile({ sourcePath, filename, mimetype }) {
    return this.uploadDb.saveFile({ sourcePath, filename, mimetype });
  }

  /**
   * 列出所有上传文件记录
   * @returns {Array}
   */
  async listFiles() {
    return this.uploadDb.listFiles();
  }

  /**
   * 根据ID获取文件信息
   * @param {string} id 文件ID
   * @returns {Object|null}
   */
  async getFileInfo(id) {
    return this.uploadDb.getFileById(id);
  }

  /**
   * 删除文件记录及实际文件
   * @param {string} id 文件ID
   */
  async deleteFile(id) {
    return this.uploadDb.deleteFile(id);
  }

  /**
   * 获取文件的绝对路径
   * @param {string} id 文件ID
   * @returns {string|null}
   */
  getFilePath(id) {
    return this.uploadDb.getFilePath(id);
  }
}

module.exports = new UploadService(); 