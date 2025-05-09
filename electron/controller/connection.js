'use strict';

/**
 * 连接控制器
 * @class
 */
class ConnectionController {
  /**
   * 检查连接是否成功
   */
  async check() {
    return {
      status: 'success',
      message: '连接成功'
    };
  }
}

// 支持示例模式
ConnectionController.toString = () => '[class ConnectionController]';

module.exports = ConnectionController; 