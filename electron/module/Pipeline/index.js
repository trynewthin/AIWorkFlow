/**
 * @file electron/core/pipline/index.js
 * @description 统一导出项目管道服务包，包含管道类
 */

const Pipeline = require('./Pipeline');
const PipeTools = require('./tools');

module.exports = {
  Pipeline,
  PipeTools
};