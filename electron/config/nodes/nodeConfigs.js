/**
 * @file electron/configs/nodes/nodeConfigs.js
 * @description 节点状态枚举和其他可能的基础节点配置
 */

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

module.exports = {
  Status
}; 