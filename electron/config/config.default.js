'use strict';

const path = require('path');
const { getBaseDir } = require('ee-core/ps');

/**
 * 默认配置
 */
module.exports = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: 'electron-egg',
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        //webSecurity: false,
        contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
        nodeIntegration: true,
        //preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
      },
      frame: true,
      show: true,
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },
    logger: {
      encoding: 'utf-8', 
      level: 'INFO',
      outputJSON: false,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log' 
    },
    remote: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/'
    },
    socketServer: {
      enable: false,
      port: 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
      },
      channel: 'socket-channel'
    },
    httpServer: {
      enable: false,
      https: {
        enable: false, 
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem'
      },
      host: '127.0.0.1',
      port: 7071,
    },
    mainServer: {
      indexPath: '/public/dist/index.html',
      channelSeparator: '/',
    },
    /* IPC通信路由 */
    ipcRoutes: {
      'controller/connection/check': {
        controller: 'connection',
        action: 'check'
      },
      // 知识库相关接口
      'controller/knowledge/listBases': {
        controller: 'knowledge',
        action: 'listBases'
      },
      'controller/knowledge/createBase': {
        controller: 'knowledge',
        action: 'createBase'
      },
      'controller/knowledge/listDocuments': {
        controller: 'knowledge',
        action: 'listDocuments'
      },
      'controller/knowledge/getDocumentChunks': {
        controller: 'knowledge',
        action: 'getDocumentChunks'
      },
      'controller/knowledge/ingestFromPath': {
        controller: 'knowledge',
        action: 'ingestFromPath'
      },
      'controller/knowledge/getRetriever': {
        controller: 'knowledge',
        action: 'getRetriever'
      },
      'controller/knowledge/deleteDocument': {
        controller: 'knowledge',
        action: 'deleteDocument'
      },
      'controller/knowledge/deleteBase': {
        controller: 'knowledge',
        action: 'deleteBase'
      },
      // 上传文件相关接口
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
      },
      // 配置相关接口
      'controller/config/getNodeTypes': {
        controller: 'config',
        action: 'getNodeTypes'
      },
      'controller/config/getNodeConfigByType': {
        controller: 'config',
        action: 'getNodeConfigByType'
      },
      'controller/config/getDefaultFlowConfig': {
        controller: 'config',
        action: 'getDefaultFlowConfig'
      },
      'controller/config/getDefaultWorkConfig': {
        controller: 'config',
        action: 'getDefaultWorkConfig'
      },
      // 工作流相关接口
      'controller/workflow/createWorkflow': {
        controller: 'workflow',
        action: 'createWorkflow'
      },
      'controller/workflow/getWorkflow': {
        controller: 'workflow',
        action: 'getWorkflow'
      },
      'controller/workflow/listWorkflows': {
        controller: 'workflow',
        action: 'listWorkflows'
      },
      'controller/workflow/updateWorkflow': {
        controller: 'workflow',
        action: 'updateWorkflow'
      },
      'controller/workflow/deleteWorkflow': {
        controller: 'workflow',
        action: 'deleteWorkflow'
      },
      'controller/workflow/addNode': {
        controller: 'workflow',
        action: 'addNode'
      },
      'controller/workflow/updateNode': {
        controller: 'workflow',
        action: 'updateNode'
      },
      'controller/workflow/deleteNode': {
        controller: 'workflow',
        action: 'deleteNode'
      },
      'controller/workflow/moveNode': {
        controller: 'workflow',
        action: 'moveNode'
      },
      'controller/workflow/getNodeTypes': {
        controller: 'workflow',
        action: 'getNodeTypes'
      },
      'controller/workflow/executeWorkflow': {
        controller: 'workflow',
        action: 'executeWorkflow'
      }
    }
  }
}
