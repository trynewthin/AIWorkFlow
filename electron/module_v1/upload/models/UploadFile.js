/**
 * @file UploadFile.js
 * @description 文件上传模型类，定义文件对象的数据结构和验证规则
 */

/**
 * 文件上传模型
 */
class UploadFile {
  /**
   * 构造函数
   * @param {Object} data - 文件数据
   * @param {string} data.id - 文件唯一标识
   * @param {string} data.moduleName - 所属模块名称
   * @param {string} data.filename - 原始文件名
   * @param {string} data.mimetype - 文件MIME类型
   * @param {number} data.size - 文件大小（字节）
   * @param {string} data.path - 存储相对路径
   * @param {string} data.fullPath - 完整存储路径
   * @param {string} [data.description] - 文件描述
   * @param {string} [data.uploadTime] - 上传时间
   */
  constructor(data) {
    this.id = data.id;
    this.moduleName = data.moduleName;
    this.filename = data.filename;
    this.mimetype = data.mimetype;
    this.size = data.size;
    this.path = data.path;
    this.fullPath = data.fullPath;
    this.description = data.description || null;
    this.uploadTime = data.uploadTime || new Date().toISOString();
  }

  /**
   * 获取文件扩展名
   * @returns {string} 文件扩展名
   */
  getExtension() {
    return this.filename.split('.').pop().toLowerCase();
  }

  /**
   * 检查是否为图片文件
   * @returns {boolean} 是否为图片
   */
  isImage() {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return imageTypes.includes(this.mimetype);
  }

  /**
   * 检查是否为文档文件
   * @returns {boolean} 是否为文档
   */
  isDocument() {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    return docTypes.includes(this.mimetype);
  }

  /**
   * 获取人类可读的文件大小
   * @returns {string} 格式化的文件大小
   */
  getFormattedSize() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (this.size === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 转换为简化的JSON对象（用于API响应）
   * @param {boolean} [includeFullPath=false] - 是否包含完整路径
   * @returns {Object} JSON对象
   */
  toJSON(includeFullPath = false) {
    const json = {
      id: this.id,
      moduleName: this.moduleName,
      filename: this.filename,
      mimetype: this.mimetype,
      size: this.size,
      formattedSize: this.getFormattedSize(),
      extension: this.getExtension(),
      isImage: this.isImage(),
      isDocument: this.isDocument(),
      description: this.description,
      uploadTime: this.uploadTime
    };

    if (includeFullPath) {
      json.fullPath = this.fullPath;
    }

    return json;
  }

  /**
   * 验证文件数据完整性
   * @throws {Error} 如果数据不完整
   */
  validate() {
    if (!this.id) {
      throw new Error('文件ID不能为空');
    }
    if (!this.moduleName) {
      throw new Error('模块名称不能为空');
    }
    if (!this.filename) {
      throw new Error('文件名不能为空');
    }
    if (!this.mimetype) {
      throw new Error('文件类型不能为空');
    }
    if (typeof this.size !== 'number' || this.size < 0) {
      throw new Error('文件大小必须是非负数');
    }
    if (!this.path) {
      throw new Error('文件路径不能为空');
    }
    if (!this.fullPath) {
      throw new Error('完整文件路径不能为空');
    }
  }


}

module.exports = UploadFile; 