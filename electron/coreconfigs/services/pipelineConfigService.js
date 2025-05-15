/**
 * @file electron/core/configs/services/pipelineConfigService.js
 * @description 提供与管道类型相关的配置服务函数
 */

// 从 models 层导入 PipelineType 数据模型
const { PipelineType } = require('../models/pipelineTypes');

/**
 * @description 判断是否为合法管道类型
 * @param {string} type 
 * @returns {boolean}
 */
function isValidPipelineType(type) {
  return Object.values(PipelineType).includes(type);
}

/**
 * @description 获取所有管道类型数组
 * @returns {string[]}
 */
function getAllPipelineTypes() {
  return Object.values(PipelineType);
}

module.exports = {
  isValidPipelineType,
  getAllPipelineTypes
}; 