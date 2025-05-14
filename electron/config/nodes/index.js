/**
 * @file electron/config/nodes/index.js
 * @description 汇总并导出所有节点配置
 */
const fs = require('fs');
const path = require('path');

/**
 * @description 静态配置集合
 * @type {Record<string, object>}
 */
const classConfigs = {};

/**
 * @description 默认流程级配置集合
 * @type {Record<string, object>}
 */
const defaultFlowConfigs = {};

/**
 * @description 默认运行时配置集合
 * @type {Record<string, object>}
 */
const defaultWorkConfigs = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    // 导入模块
    const mod = require(path.join(__dirname, file));
    const nodeKey = path.basename(file, '.js');
    if (mod.classConfig !== undefined) {
      classConfigs[nodeKey] = mod.classConfig;
    }
    if (mod.defaultFlowConfig !== undefined) {
      defaultFlowConfigs[nodeKey] = mod.defaultFlowConfig;
    }
    if (mod.defaultWorkConfig !== undefined) {
      defaultWorkConfigs[nodeKey] = mod.defaultWorkConfig;
    }
  });

module.exports = { classConfigs, defaultFlowConfigs, defaultWorkConfigs }; 