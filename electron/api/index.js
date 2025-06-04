'use strict';

/**
 * @description 统一的IPC路由配置导出
 * @author AIWorkflow Team
 */

// 导入各模块的路由配置
const knowledgeRoutes = require('./knowledge');
const uploadRoutes = require('./upload');
const configRoutes = require('./config');
const workflowRoutes = require('./workflow');
const userRoutes = require('./user');
const mcpRoutes = require('./mcp');

/**
 * 合并所有路由配置并导出
 */
module.exports = {
  ...knowledgeRoutes,
  ...uploadRoutes,
  ...configRoutes,
  ...workflowRoutes,
  ...userRoutes,
  ...mcpRoutes
}; 