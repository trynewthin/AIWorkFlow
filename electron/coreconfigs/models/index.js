/**
 * @file electron/core/configs/models/index.js
 * @description 统一导出 models 目录下的所有配置模型
 */

const { Status, NodeKey } = require('./enums');
const {
  DataType,
  PipelineType
} = require('./pipelineTypes');
const { nodeConfigurations } = require('./nodeConfigs');

module.exports = {
  // Enums
  Status,
  NodeKey,
  // Pipeline Data Models
  DataType,
  PipelineType,
  // Node Configurations (the single, structured object)
  nodeConfigurations
};
