/**
 * @file electron/core/configs/services/index.js
 * @description 统一导出 services 目录下的所有配置服务
 */

const nodeConfigProvider = require('./nodeConfigProvider');
const pipelineConfigService = require('./pipelineConfigService');

module.exports = {
  ...nodeConfigProvider,
  ...pipelineConfigService
};
