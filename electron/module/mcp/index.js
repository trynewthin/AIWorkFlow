/**
 * MCP 主集成文件
 * 提供统一的接口来管理和控制MCP服务
 * 在Electron主进程中使用
 */

const MCPServiceManager = require('./MCPServiceManager');
const MailerAdapter = require('./adapters/MailerAdapter');
const path = require('path');

class MCPIntegration {
    constructor() {
        this.manager = new MCPServiceManager();
        this.isInitialized = false;
        this.availableAdapters = new Map();
        
        // 事件监听
        this.setupEventListeners();
        
        // 预注册适配器
        this.registerAvailableAdapters();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.manager.on('started', (data) => {
            console.log('🚀 MCP服务已启动:', data);
        });

        this.manager.on('stopped', () => {
            console.log('🛑 MCP服务已停止');
        });

        this.manager.on('moduleRegistered', (data) => {
            console.log('📝 模块已注册:', data);
        });

        this.manager.on('error', (error) => {
            console.error('❌ MCP服务错误:', error);
        });
    }

    /**
     * 注册可用的适配器
     */
    registerAvailableAdapters() {
        // 注册邮件适配器
        this.availableAdapters.set('mailer', {
            name: 'mailer',
            adapter: MailerAdapter,
            description: '电子邮件发送服务',
            enabled: false
        });

        // 可以在这里注册更多适配器
        // this.availableAdapters.set('workflow', {...});
        // this.availableAdapters.set('knowledge', {...});
    }

    /**
     * 初始化MCP集成
     * @param {Object} options - 配置选项
     */
    async initialize(options = {}) {
        if (this.isInitialized) {
            console.log('⚠️  MCP集成已初始化');
            return { success: true, message: '已初始化' };
        }

        try {
            // 默认配置
            const config = {
                port: 3000,
                host: 'localhost',
                autoStart: false,
                enabledModules: ['mailer'], // 默认启用的模块
                ...options
            };

            // 注册启用的模块
            for (const moduleName of config.enabledModules) {
                await this.enableModule(moduleName);
            }

            this.isInitialized = true;

            // 自动启动服务（如果配置了）
            if (config.autoStart) {
                const startResult = await this.start(config.port, config.host);
                return {
                    success: true,
                    message: 'MCP集成初始化并自动启动成功',
                    serverInfo: startResult
                };
            }

            return {
                success: true,
                message: 'MCP集成初始化成功',
                moduleCount: this.manager.registeredModules.size
            };

        } catch (error) {
            console.error('❌ MCP集成初始化失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 启用模块
     * @param {string} moduleName - 模块名称
     */
    async enableModule(moduleName) {
        const adapterInfo = this.availableAdapters.get(moduleName);
        if (!adapterInfo) {
            throw new Error(`未知的模块: ${moduleName}`);
        }

        try {
            // 动态加载模块
            const module = await this.loadModule(moduleName);
            
            // 创建适配器实例
            const adapter = new adapterInfo.adapter();
            const adapterConfig = adapter.getAdapterConfig();

            // 注册到管理器
            const success = this.manager.registerModule(moduleName, module, adapterConfig);
            
            if (success) {
                adapterInfo.enabled = true;
                console.log(`✅ 模块 ${moduleName} 已启用`);
                return true;
            } else {
                throw new Error(`注册模块失败: ${moduleName}`);
            }

        } catch (error) {
            console.error(`❌ 启用模块失败 ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * 禁用模块
     * @param {string} moduleName - 模块名称
     */
    disableModule(moduleName) {
        const adapterInfo = this.availableAdapters.get(moduleName);
        if (adapterInfo) {
            adapterInfo.enabled = false;
            // TODO: 从管理器中移除模块
            console.log(`⏹️  模块 ${moduleName} 已禁用`);
            return true;
        }
        return false;
    }

    /**
     * 动态加载模块
     * @param {string} moduleName - 模块名称
     */
    async loadModule(moduleName) {
        switch (moduleName) {
            case 'mailer':
                // 加载邮件模块
                return require('../mailer/index.js');
            
            // 可以在这里添加更多模块的加载逻辑
            // case 'workflow':
            //     return require('../workflow/index.js');
            
            default:
                throw new Error(`不支持的模块: ${moduleName}`);
        }
    }

    /**
     * 启动MCP服务
     * @param {number} port - 端口号
     * @param {string} host - 主机地址
     */
    async start(port = 3000, host = 'localhost') {
        if (!this.isInitialized) {
            throw new Error('请先初始化MCP集成');
        }

        return await this.manager.start(port, host);
    }

    /**
     * 停止MCP服务
     */
    async stop() {
        return await this.manager.stop();
    }

    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            manager: this.manager.getStatus(),
            availableModules: Array.from(this.availableAdapters.entries()).map(([name, info]) => ({
                name,
                description: info.description,
                enabled: info.enabled
            }))
        };
    }

    /**
     * 重启服务
     */
    async restart(port, host) {
        await this.stop();
        // 等待一小段时间确保端口释放
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await this.start(port, host);
    }

    /**
     * 获取可用模块列表
     */
    getAvailableModules() {
        return Array.from(this.availableAdapters.entries()).map(([name, info]) => ({
            name,
            description: info.description,
            enabled: info.enabled
        }));
    }

    /**
     * 切换模块状态
     * @param {string} moduleName - 模块名称
     * @param {boolean} enabled - 是否启用
     */
    async toggleModule(moduleName, enabled) {
        if (enabled) {
            return await this.enableModule(moduleName);
        } else {
            return this.disableModule(moduleName);
        }
    }

    /**
     * 获取服务URL
     */
    getServiceUrl() {
        const status = this.manager.getStatus();
        if (status.isRunning) {
            return `http://localhost:${status.port}`;
        }
        return null;
    }

    /**
     * 获取Claude Desktop配置
     */
    getClaudeConfig() {
        const url = this.getServiceUrl();
        if (!url) {
            return null;
        }

        return {
            mcpServers: {
                "aiworkflow": {
                    "command": "curl",
                    "args": ["-X", "POST", `${url}/mcp`, "-H", "Content-Type: application/json"],
                    "env": {}
                }
            }
        };
    }
}

// 创建单例实例
const mcpIntegration = new MCPIntegration();

module.exports = {
    MCPIntegration,
    mcpIntegration, // 单例实例
    MCPServiceManager,
    MailerAdapter
}; 