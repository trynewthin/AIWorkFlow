/**
 * @file electron/config/api/upload.js
 * @description IPC 路由：文件上传相关接口
 */
module.exports = {
  'controller/upload/uploadFile': {
    controller: 'upload',
    action: 'uploadFile'
  },
  'controller/upload/listFiles': {
    controller: 'upload',
    action: 'listFiles'
  },
  'controller/upload/getFileInfo': {
    controller: 'upload',
    action: 'getFileInfo'
  },
  'controller/upload/deleteFile': {
    controller: 'upload',
    action: 'deleteFile'
  },
  'controller/upload/getFilePath': {
    controller: 'upload',
    action: 'getFilePath'
  }
}; 