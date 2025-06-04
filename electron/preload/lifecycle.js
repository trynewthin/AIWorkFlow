'use strict';

const { logger } = require('ee-core/log');
const { getConfig } = require('ee-core/config');
const { getMainWindow } = require('ee-core/electron');
const { mcpIntegration } = require('../module/mcp/index');

class Lifecycle {

  /**
   * core app have been loaded
   */
  async ready() {
    logger.info('[lifecycle] ready');
  }

  /**
   * electron app ready
   */
  async electronAppReady() {
    logger.info('[lifecycle] electron-app-ready');
    
    // 初始化MCP集成
    try {
      logger.info('[lifecycle] 正在初始化MCP集成...');
      const result = await mcpIntegration.initialize({
        port: 3000,
        host: 'localhost',
        autoStart: false, // 不自动启动，让用户手动控制
        enabledModules: ['mailer']
      });
      
      if (result.success) {
        logger.info('[lifecycle] ✅ MCP集成初始化成功');
      } else {
        logger.error('[lifecycle] ❌ MCP集成初始化失败:', result.error);
      }
    } catch (error) {
      logger.error('[lifecycle] ❌ MCP初始化异常:', error);
    }
  }

  /**
   * main window have been loaded
   */
  async windowReady() {
    logger.info('[lifecycle] window-ready');
    // 延迟加载，无白屏
    const { windowsOption } = getConfig();
    if (windowsOption.show == false) {
      const win = getMainWindow();
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
      })
    }
  }

  /**
   * before app close
   */  
  async beforeClose() {
    logger.info('[lifecycle] before-close');
  }
}
Lifecycle.toString = () => '[class Lifecycle]';

module.exports = {
  Lifecycle
};