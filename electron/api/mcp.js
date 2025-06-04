/**
 * @file electron/api/mcp.js
 * @description IPC 路由：MCP服务相关接口
 */
module.exports = {
  'controller/mcp/initialize': {
    controller: 'mcp',
    action: 'initialize'
  },
  'controller/mcp/startService': {
    controller: 'mcp',
    action: 'startService'
  },
  'controller/mcp/stopService': {
    controller: 'mcp',
    action: 'stopService'
  },
  'controller/mcp/restartService': {
    controller: 'mcp',
    action: 'restartService'
  },
  'controller/mcp/getServiceStatus': {
    controller: 'mcp',
    action: 'getServiceStatus'
  },
  'controller/mcp/getAvailableModules': {
    controller: 'mcp',
    action: 'getAvailableModules'
  },
  'controller/mcp/toggleModule': {
    controller: 'mcp',
    action: 'toggleModule'
  },
  'controller/mcp/enableModule': {
    controller: 'mcp',
    action: 'enableModule'
  },
  'controller/mcp/disableModule': {
    controller: 'mcp',
    action: 'disableModule'
  },
  'controller/mcp/getClaudeConfig': {
    controller: 'mcp',
    action: 'getClaudeConfig'
  },
  'controller/mcp/checkHealth': {
    controller: 'mcp',
    action: 'checkHealth'
  },
  'controller/mcp/getServiceMetrics': {
    controller: 'mcp',
    action: 'getServiceMetrics'
  }
}; 