/**
 * @file electron/core/configs/index.js
 * @description 统一导出项目配置服务包，包含模型定义和服务
 */

const models = require('./models');
const services = require('./services');
const controllers = require('./controllers');

module.exports = {
  ...models,
  ...services,
  controllers
}; 