/**
 * @file electron/config/pipeline/index.js
 * @description 统一导出管道相关配置与工具
 */
const DataType = require('./DataType').default;
const {
  PipelineType,
  isValidPipelineType,
  getAllPipelineTypes,
  getRecommendedPipelineTypes
} = require('./PipelineType').default;

module.exports = {
  DataType,
  PipelineType,
  isValidPipelineType,
  getAllPipelineTypes,
  getRecommendedPipelineTypes
}; 