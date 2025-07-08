/**
 * @file frontend/src/services/index.js
 * @description 服务模块的统一导出出口
 */

/**
 * 服务层导出
 * 提供更友好的服务API，处理错误和格式化结果
 */

import * as userServiceFunctions from './userService';
import * as workflowServiceFunctions from './workflowService';
import * as knowledgeServiceFunctions from './knowledgeService';
import * as configServiceFunctions from './configService';
import * as uploadServiceFunctions from './uploadService';
import * as connectionServiceFunctions from './connectionService';

// 解构导出所有服务函数
export * from './workflowService';
export * from './userService';
export * from './knowledgeService';
export * from './configService';
export * from './uploadService';
export * from './connectionService';

// 导出服务对象，便于非解构导入
export const userService = {
  ...userServiceFunctions
};

// 导出工作流服务对象
export const workflowService = {
  ...workflowServiceFunctions
};

// 导出知识库服务对象
export const knowledgeService = {
  ...knowledgeServiceFunctions
};

// 导出配置服务对象
export const configService = {
  ...configServiceFunctions
};

// 导出上传服务对象
export const uploadService = {
  ...uploadServiceFunctions
};

// 导出连接服务对象
export const connectionService = {
  ...connectionServiceFunctions
};

// 导出对话相关服务
export const conversationService = {
  ...workflowServiceFunctions
}; 