/**
 * @file electron/config/nodes/index.js
 * @description 汇总并导出所有节点配置
 */
const fs = require('fs');
const path = require('path');

/**
 * @description 节点状态枚举
 * @type {{IDLE: string, RUNNING: string, COMPLETED: string, FAILED: string}}
 */
const Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

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
    const baseName = path.basename(file, '.js'); // 例如 'chat', 'start'
    // 将 'chat' 转换为 'ChatNode', 'start' 转换为 'StartNode'
    const nodeKey = baseName.charAt(0).toUpperCase() + baseName.slice(1) + 'Node';

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

module.exports = { classConfigs, defaultFlowConfigs, defaultWorkConfigs, Status }; 