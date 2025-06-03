'use strict';

/**
 * Development environment configuration, coverage config.default.js
 */
module.exports = () => {
  return {
    // 开发环境开启开发者工具
    openDevTools: true,
    // 任务消息日志
    jobs: {
      messageLog: true
    },
    // 热重载配置
    hotReload: {
      enable: true,
      delay: 1000,
      watch: [
        'electron/controller/',
        'electron/services/',
        'electron/config/',
        'electron/database/',
        'electron/workflow/',
        'electron/knowledge/',
        'electron/pipeline/',
        'electron/node/',
        'electron/users/'
      ]
    },
    // 日志级别调整为DEBUG便于调试
    logger: {
      level: 'DEBUG',
      outputJSON: false
    }
  };
};
