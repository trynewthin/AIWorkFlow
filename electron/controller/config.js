/**
 * @file electron/controller/config.js
 * @description 配置控制器，转发到核心配置服务。
 *              遵循 "工作流样式"，直接导出核心控制器。
 */
'use strict';

// 引入并导出核心配置控制器
const CoreConfigsController = require('../core/configs/controllers');

module.exports = CoreConfigsController; 