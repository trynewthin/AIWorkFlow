'use strict';

const path = require('path');
const { getBaseDir } = require('ee-core/ps');

/**
 * @description IPC 路由分模块配置
 */
const connectionRoutes = require('./api/connection');
const knowledgeRoutes = require('./api/knowledge');
const uploadRoutes = require('./api/upload');
const configRoutes = require('./api/config');
const workflowRoutes = require('./api/workflow');
const userRoutes = require('./api/user');

/**
 * 默认配置
 */
module.exports = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: 'AIWorkflow',
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
      ...connectionRoutes,
      ...knowledgeRoutes,
      ...uploadRoutes,
      ...configRoutes,
      ...workflowRoutes,
      ...userRoutes
    }
  }
}
