'use strict';

const uploadService = require('../../services/upload/upload-service');

/**
 * 上传控制器
 */
class UploadController {
  /**
   * 上传文件并保存记录
   * @param {{sourcePath:string, filename:string, mimetype:string}} params
   */
  async uploadFile(params) {
    return await uploadService.uploadFile(params);
  }

  /**
   * 列出所有上传文件记录
   */
  async listFiles() {
    return await uploadService.listFiles();
  }

  /**
   * 根据ID获取文件信息
   * @param {string} id 文件ID
   */
  async getFileInfo(id) {
    return await uploadService.getFileInfo(id);
  }

  /**
   * 删除文件记录及实际文件
   * @param {string} id 文件ID
   * @returns {{success:boolean}}
   */
  async deleteFile(id) {
    await uploadService.deleteFile(id);
    return { success: true };
  }

  /**
   * 获取文件的绝对路径
   * @param {string} id 文件ID
   */
  async getFilePath(id) {
    return uploadService.getFilePath(id);
  }
}

// 支持示例模式
UploadController.toString = () => '[class UploadController]';

module.exports = UploadController; 