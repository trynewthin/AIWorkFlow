'use strict';

const { mcpIntegration } = require('../index');

/**
 * MCP服务控制器
 * 提供MCP服务的启动、停止、重启等控制功能
 */
class MCPController {
  /**
   * 初始化MCP集成
   * @param {{port?:number,host?:string,autoStart?:boolean,enabledModules?:string[]}} options
   */
  async initialize(options = {}) {
    const defaultOptions = {
      port: 3000,
      host: 'localhost',
      autoStart: false,
      enabledModules: ['mailer']
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      const result = await mcpIntegration.initialize(config);
      return {
        success: true,
        data: result,
        message: result.message || 'MCP集成初始化成功'
      };
    } catch (error) {
      console.error('❌ MCP初始化失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: 'MCP集成初始化失败'
      };
    }
  }

  /**
   * 启动MCP服务
   * @param {number|Event} port - 端口号，默认3000，或者来自IPC的Event对象
   * @param {string} host - 主机地址，默认localhost
   */
  async startService(port = 3000, host = 'localhost') {
    try {
      // 处理从IPC调用时的参数问题
      // 如果第一个参数是Event对象，说明参数传递有问题
      if (port && typeof port === 'object' && port.sender) {
        // 第一个参数是event对象，重新设置默认值
        console.log('⚠️  检测到参数传递问题，使用默认值');
        port = 3000;
        host = 'localhost';
      }
      
      // 确保参数类型正确
      port = typeof port === 'number' ? port : parseInt(port) || 3000;
      host = typeof host === 'string' ? host : 'localhost';
      
      const result = await mcpIntegration.start(port, host);
      
      if (result.success) {
        return {
          success: true,
          data: {
            port: result.port,
            host: result.host,
            url: result.url,
            sessionId: result.sessionId
          },
          message: `MCP服务已启动 - ${result.url}`
        };
      } else {
        return {
          success: false,
          error: String(result.error || '启动失败'),
          message: String(result.message || 'MCP服务启动失败')
        };
      }
    } catch (error) {
      console.error('❌ 启动MCP服务失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: 'MCP服务启动异常'
      };
    }
  }

  /**
   * 停止MCP服务
   */
  async stopService() {
    try {
      const result = await mcpIntegration.stop();
      
      if (result.success) {
        return {
          success: true,
          data: null,
          message: 'MCP服务已停止'
        };
      } else {
        return {
          success: false,
          error: String(result.error || '停止失败'),
          message: String(result.message || 'MCP服务停止失败')
        };
      }
    } catch (error) {
      console.error('❌ 停止MCP服务失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: 'MCP服务停止异常'
      };
    }
  }

  /**
   * 重启MCP服务
   * @param {number|Event} port - 端口号，或者来自IPC的Event对象
   * @param {string} host - 主机地址
   */
  async restartService(port, host) {
    try {
      // 处理从IPC调用时的参数问题
      if (port && typeof port === 'object' && port.sender) {
        console.log('⚠️  重启服务检测到参数传递问题，使用默认值');
        port = 3000;
        host = 'localhost';
      }
      
      // 确保参数类型正确
      port = typeof port === 'number' ? port : parseInt(port) || 3000;
      host = typeof host === 'string' ? host : 'localhost';
      
      const result = await mcpIntegration.restart(port, host);
      
      if (result.success) {
        return {
          success: true,
          data: {
            port: result.port,
            host: result.host,
            url: result.url,
            sessionId: result.sessionId
          },
          message: `MCP服务已重启 - ${result.url}`
        };
      } else {
        return {
          success: false,
          error: String(result.error || '重启失败'),
          message: String(result.message || 'MCP服务重启失败')
        };
      }
    } catch (error) {
      console.error('❌ 重启MCP服务失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: 'MCP服务重启异常'
      };
    }
  }

  /**
   * 获取MCP服务状态
   */
  async getServiceStatus() {
    try {
      const status = mcpIntegration.getStatus();
      const serviceUrl = mcpIntegration.getServiceUrl();
      
      // 安全地序列化状态数据，确保可以被克隆
      const serializedData = {
        initialized: Boolean(status.initialized),
        running: Boolean(status.manager.isRunning),
        port: status.manager.port || null,
        sessionId: status.manager.sessionId || null,
        url: serviceUrl || null,
        moduleCount: Number(status.manager.moduleCount) || 0,
        toolCount: Number(status.manager.toolCount) || 0,
        uptime: Number(status.manager.uptime) || 0,
        modules: Array.isArray(status.manager.modules) ? status.manager.modules.map(module => ({
          name: String(module.name),
          enabled: Boolean(module.enabled),
          toolCount: Number(module.toolCount) || 0,
          registeredAt: module.registeredAt || null
        })) : [],
        availableModules: Array.isArray(status.availableModules) ? status.availableModules.map(module => ({
          name: String(module.name),
          description: String(module.description),
          enabled: Boolean(module.enabled)
        })) : []
      };
      
      return {
        success: true,
        data: serializedData,
        message: status.manager.isRunning ? 'MCP服务运行中' : 'MCP服务已停止'
      };
    } catch (error) {
      console.error('❌ 获取MCP服务状态失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: '获取MCP服务状态失败'
      };
    }
  }

  /**
   * 获取可用模块列表
   */
  async getAvailableModules() {
    try {
      const modules = mcpIntegration.getAvailableModules();
      
      return {
        success: true,
        data: Array.isArray(modules) ? modules.map(module => ({
          name: String(module.name),
          description: String(module.description),
          enabled: Boolean(module.enabled)
        })) : [],
        message: `获取到 ${modules.length} 个可用模块`
      };
    } catch (error) {
      console.error('❌ 获取可用模块失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: '获取可用模块失败'
      };
    }
  }

  /**
   * 切换模块状态
   * @param {string|Event} moduleName - 模块名称，或者来自IPC的Event对象
   * @param {boolean} enabled - 是否启用
   */
  async toggleModule(moduleName, enabled) {
    try {
      // 处理从IPC调用时的参数问题
      if (moduleName && typeof moduleName === 'object' && moduleName.sender) {
        console.log('⚠️  切换模块检测到参数传递问题');
        return {
          success: false,
          error: '参数传递错误',
          message: '模块名称参数无效'
        };
      }
      
      const result = await mcpIntegration.toggleModule(moduleName, enabled);
      
      if (result) {
        const action = enabled ? '启用' : '禁用';
        return {
          success: true,
          data: { moduleName: String(moduleName), enabled: Boolean(enabled) },
          message: `模块 ${moduleName} 已${action}`
        };
      } else {
        return {
          success: false,
          error: '模块状态切换失败',
          message: `模块 ${moduleName} 状态切换失败`
        };
      }
    } catch (error) {
      console.error(`❌ 切换模块状态失败 ${moduleName}:`, error);
      return {
        success: false,
        error: String(error.message || error),
        message: `模块 ${moduleName} 状态切换异常`
      };
    }
  }

  /**
   * 启用模块
   * @param {string} moduleName - 模块名称
   */
  async enableModule(moduleName) {
    return await this.toggleModule(moduleName, true);
  }

  /**
   * 禁用模块
   * @param {string} moduleName - 模块名称
   */
  async disableModule(moduleName) {
    return await this.toggleModule(moduleName, false);
  }

  /**
   * 获取Claude Desktop配置
   */
  async getClaudeConfig() {
    try {
      const config = mcpIntegration.getClaudeConfig();
      
      if (config) {
        return {
          success: true,
          data: config,
          message: 'Claude Desktop配置生成成功'
        };
      } else {
        return {
          success: false,
          error: 'MCP服务未运行',
          message: '请先启动MCP服务'
        };
      }
    } catch (error) {
      console.error('❌ 获取Claude配置失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: '获取Claude Desktop配置失败'
      };
    }
  }

  /**
   * 检测MCP服务健康状态
   */
  async checkHealth() {
    try {
      const status = mcpIntegration.getStatus();
      
      if (!status.manager.isRunning) {
        return {
          success: false,
          data: { healthy: false, reason: 'service_stopped' },
          message: 'MCP服务未运行'
        };
      }

      // 这里可以添加更多健康检查逻辑
      // 比如检查端口是否可访问、模块是否正常等
      
      return {
        success: true,
        data: {
          healthy: true,
          uptime: Number(status.manager.uptime) || 0,
          moduleCount: Number(status.manager.moduleCount) || 0,
          toolCount: Number(status.manager.toolCount) || 0
        },
        message: 'MCP服务健康状态良好'
      };
    } catch (error) {
      console.error('❌ 检测MCP服务健康状态失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: 'MCP服务健康检查失败'
      };
    }
  }

  /**
   * 获取服务运行指标
   */
  async getServiceMetrics() {
    try {
      const status = mcpIntegration.getStatus();
      
      return {
        success: true,
        data: {
          initialized: Boolean(status.initialized),
          running: Boolean(status.manager.isRunning),
          uptime: Number(status.manager.uptime) || 0,
          port: status.manager.port || null,
          sessionId: status.manager.sessionId || null,
          moduleCount: Number(status.manager.moduleCount) || 0,
          toolCount: Number(status.manager.toolCount) || 0,
          enabledModules: Array.isArray(status.availableModules) ? status.availableModules.filter(m => m.enabled).length : 0,
          totalModules: Array.isArray(status.availableModules) ? status.availableModules.length : 0
        },
        message: '服务指标获取成功'
      };
    } catch (error) {
      console.error('❌ 获取服务指标失败:', error);
      return {
        success: false,
        error: String(error.message || error),
        message: '获取服务指标失败'
      };
    }
  }
}

module.exports = MCPController; 