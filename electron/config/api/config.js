/**
 * @file electron/config/api/config.js
 * @description IPC 路由：配置相关接口
 */
module.exports = {
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
  }
}; 