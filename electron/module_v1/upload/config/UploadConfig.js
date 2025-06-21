/**
 * @file UploadConfig.js
 * @description 文件上传模块配置
 */

/**
 * 默认上传配置
 */
const DEFAULT_CONFIG = {
  // 最大文件大小 (100MB)
  maxFileSize: 100 * 1024 * 1024,
  
  // 允许的文件类型（空数组表示允许所有类型）
  allowedMimeTypes: [],
  
  // 是否启用文件哈希计算
  enableHash: true,
  
  // 上传目录名称
  uploadDir: 'upload_v1',
  
  // 数据库文件名
  dbname: 'upload_v1.db',
  
  // 模块ID
  moduleId: 'upload-v1-module'
};

/**
 * 图片上传配置
 */
const IMAGE_CONFIG = {
  ...DEFAULT_CONFIG,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  uploadDir: 'images_v1'
};

/**
 * 文档上传配置
 */
const DOCUMENT_CONFIG = {
  ...DEFAULT_CONFIG,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  uploadDir: 'documents_v1'
};

/**
 * 音频上传配置
 */
const AUDIO_CONFIG = {
  ...DEFAULT_CONFIG,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm'
  ],
  uploadDir: 'audio_v1'
};

/**
 * 视频上传配置
 */
const VIDEO_CONFIG = {
  ...DEFAULT_CONFIG,
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv'
  ],
  uploadDir: 'videos_v1'
};

/**
 * 获取配置的辅助函数
 */
class UploadConfig {
  /**
   * 获取默认配置
   * @returns {Object} 默认配置
   */
  static getDefault() {
    return { ...DEFAULT_CONFIG };
  }

  /**
   * 获取图片上传配置
   * @returns {Object} 图片上传配置
   */
  static getImageConfig() {
    return { ...IMAGE_CONFIG };
  }

  /**
   * 获取文档上传配置
   * @returns {Object} 文档上传配置
   */
  static getDocumentConfig() {
    return { ...DOCUMENT_CONFIG };
  }

  /**
   * 获取音频上传配置
   * @returns {Object} 音频上传配置
   */
  static getAudioConfig() {
    return { ...AUDIO_CONFIG };
  }

  /**
   * 获取视频上传配置
   * @returns {Object} 视频上传配置
   */
  static getVideoConfig() {
    return { ...VIDEO_CONFIG };
  }

  /**
   * 根据文件类型获取推荐配置
   * @param {string} mimetype - 文件MIME类型
   * @returns {Object} 推荐配置
   */
  static getConfigByMimeType(mimetype) {
    if (mimetype.startsWith('image/')) {
      return this.getImageConfig();
    }
    if (mimetype.startsWith('audio/')) {
      return this.getAudioConfig();
    }
    if (mimetype.startsWith('video/')) {
      return this.getVideoConfig();
    }
    if (DOCUMENT_CONFIG.allowedMimeTypes.includes(mimetype)) {
      return this.getDocumentConfig();
    }
    return this.getDefault();
  }

  /**
   * 合并自定义配置
   * @param {Object} baseConfig - 基础配置
   * @param {Object} customConfig - 自定义配置
   * @returns {Object} 合并后的配置
   */
  static mergeConfig(baseConfig, customConfig) {
    return {
      ...baseConfig,
      ...customConfig
    };
  }

  /**
   * 验证配置参数
   * @param {Object} config - 配置对象
   * @throws {Error} 配置无效时抛出错误
   */
  static validateConfig(config) {
    if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
      throw new Error('maxFileSize必须是正数');
    }

    if (!Array.isArray(config.allowedMimeTypes)) {
      throw new Error('allowedMimeTypes必须是数组');
    }

    if (typeof config.enableHash !== 'boolean') {
      throw new Error('enableHash必须是布尔值');
    }

    if (typeof config.uploadDir !== 'string' || !config.uploadDir.trim()) {
      throw new Error('uploadDir必须是非空字符串');
    }

    if (typeof config.dbname !== 'string' || !config.dbname.trim()) {
      throw new Error('dbname必须是非空字符串');
    }

    if (typeof config.moduleId !== 'string' || !config.moduleId.trim()) {
      throw new Error('moduleId必须是非空字符串');
    }
  }
}

module.exports = {
  DEFAULT_CONFIG,
  IMAGE_CONFIG,
  DOCUMENT_CONFIG,
  AUDIO_CONFIG,
  VIDEO_CONFIG,
  UploadConfig
}; 