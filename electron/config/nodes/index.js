/**
 * @file electron/configs/nodes/index.js
 * @description 统一导出所有与节点相关的配置和枚举
 */

const classConfigs = require('./classConfigs');
const defaultFlowConfigs = require('./defaultFlowConfigs');
const defaultWorkConfigs = require('./defaultWorkConfigs');
const { Status } = defaultFlowConfigs;

module.exports = {
  classConfigs,
  defaultFlowConfigs,
  defaultWorkConfigs,
  Status
}; 