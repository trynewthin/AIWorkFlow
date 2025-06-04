/**
 * MCP 服务管理器
 * 负责管理Electron应用中的Model Context Protocol服务
 * 支持HTTP传输，可在打包后的应用中使用
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const EventEmitter = require('events');

class MCPServiceManager extends EventEmitter {
    constructor() {
        super();
        this.server = null;
        this.httpServer = null;
        this.isRunning = false;
        this.port = null;
        this.registeredModules = new Map();
        this.tools = new Map();
        this.sessionId = null;
        
        // 配置
        this.config = {
            port: 3000,
            host: 'localhost',
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'DELETE'],
                headers: ['Content-Type', 'mcp-session-id']
            },
            timeout: 30000, // 30秒超时
            maxConcurrentRequests: 100
        };
    }

    /**
     * 注册模块到MCP服务
     * @param {string} name - 模块名称
     * @param {Object} module - 模块实例
     * @param {Object} adapter - 模块适配器配置
     */
    registerModule(name, module, adapter) {
        try {
            console.log(`📝 注册MCP模块: ${name}`);
            
            this.registeredModules.set(name, {
                name,
                module,
                adapter,
                tools: adapter.tools || [],
                enabled: true,
                registeredAt: new Date()
            });

            // 注册模块中的工具
            if (adapter.tools) {
                adapter.tools.forEach(tool => {
                    const toolName = `${name}_${tool.name}`;
                    this.tools.set(toolName, {
                        ...tool,
                        moduleName: name,
                        module: module
                    });
                    console.log(`🔧 注册工具: ${toolName}`);
                });
            }

            this.emit('moduleRegistered', { name, toolCount: adapter.tools?.length || 0 });
            return true;
        } catch (error) {
            console.error(`❌ 注册模块失败 ${name}:`, error);
            return false;
        }
    }

    /**
     * 启动MCP HTTP服务器
     * @param {number} port - 端口号
     * @param {string} host - 主机地址
     */
    async start(port = this.config.port, host = this.config.host) {
        if (this.isRunning) {
            console.log('⚠️  MCP服务已在运行中');
            return { success: false, message: 'MCP服务已在运行中' };
        }

        try {
            this.port = port;
            this.sessionId = this.generateSessionId();

            // 创建Express应用
            const app = express();

            // 中间件配置
            app.use(cors(this.config.cors));
            app.use(express.json({ limit: '10mb' }));
            app.use(express.urlencoded({ extended: true }));

            // 请求日志中间件
            app.use((req, res, next) => {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] ${req.method} ${req.path}`);
                next();
            });

            // 设置路由
            this.setupRoutes(app);

            // 启动HTTP服务器
            this.httpServer = app.listen(port, host, () => {
                this.isRunning = true;
                console.log(`🚀 MCP HTTP服务器已启动`);
                console.log(`📍 地址: http://${host}:${port}`);
                console.log(`🆔 会话ID: ${this.sessionId}`);
                console.log(`📊 已注册模块: ${this.registeredModules.size}`);
                console.log(`🔧 可用工具: ${this.tools.size}`);
                
                this.emit('started', { 
                    port, 
                    host, 
                    sessionId: this.sessionId,
                    moduleCount: this.registeredModules.size,
                    toolCount: this.tools.size
                });
            });

            // 错误处理
            this.httpServer.on('error', (error) => {
                console.error('❌ MCP服务器错误:', error);
                this.emit('error', error);
            });

            return { 
                success: true, 
                port, 
                host, 
                sessionId: this.sessionId,
                url: `http://${host}:${port}`
            };

        } catch (error) {
            console.error('❌ MCP服务器启动失败:', error);
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 停止MCP服务器
     */
    async stop() {
        if (!this.isRunning) {
            return { success: false, message: 'MCP服务未运行' };
        }

        try {
            return new Promise((resolve) => {
                this.httpServer.close(() => {
                    this.isRunning = false;
                    this.httpServer = null;
                    this.sessionId = null;
                    
                    console.log('🛑 MCP服务器已停止');
                    this.emit('stopped');
                    
                    resolve({ success: true });
                });
            });
        } catch (error) {
            console.error('❌ 停止MCP服务器失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 设置HTTP路由
     */
    setupRoutes(app) {
        // MCP 初始化端点
        app.post('/mcp', async (req, res) => {
            try {
                const { method, params } = req.body;

                switch (method) {
                    case 'initialize':
                        return this.handleInitialize(req, res);
                    
                    case 'tools/list':
                        return this.handleListTools(req, res);
                    
                    case 'tools/call':
                        return this.handleCallTool(req, res);
                    
                    default:
                        res.status(400).json({
                            jsonrpc: '2.0',
                            error: {
                                code: -32601,
                                message: `未知的方法: ${method}`
                            },
                            id: req.body.id || null
                        });
                }
            } catch (error) {
                console.error('❌ MCP请求处理错误:', error);
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: '内部服务器错误'
                    },
                    id: req.body.id || null
                });
            }
        });

        // 健康检查端点
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                modules: this.registeredModules.size,
                tools: this.tools.size
            });
        });

        // 服务信息端点
        app.get('/info', (req, res) => {
            res.json({
                name: "AIWorkflow MCP服务器",
                version: "1.0.0",
                sessionId: this.sessionId,
                modules: Array.from(this.registeredModules.entries()).map(([name, module]) => ({
                    name,
                    toolCount: module.tools.length,
                    enabled: module.enabled
                })),
                capabilities: {
                    tools: true,
                    resources: false,
                    prompts: false
                }
            });
        });
    }

    /**
     * 处理初始化请求
     */
    handleInitialize(req, res) {
        const { params } = req.body;
        
        res.setHeader('mcp-session-id', this.sessionId);
        res.json({
            jsonrpc: '2.0',
            result: {
                protocolVersion: '2024-11-05',
                serverInfo: {
                    name: "AIWorkflow MCP服务器",
                    version: "1.0.0"
                },
                capabilities: {
                    tools: {
                        listChanged: true
                    }
                }
            },
            id: req.body.id || null
        });
    }

    /**
     * 处理工具列表请求
     */
    handleListTools(req, res) {
        const tools = Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema || {
                type: "object",
                properties: {},
                required: []
            }
        }));

        res.json({
            jsonrpc: '2.0',
            result: { tools },
            id: req.body.id || null
        });
    }

    /**
     * 处理工具调用请求
     */
    async handleCallTool(req, res) {
        const { params } = req.body;
        const { name, arguments: args } = params;

        try {
            const tool = this.tools.get(name);
            if (!tool) {
                return res.status(404).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32601,
                        message: `工具不存在: ${name}`
                    },
                    id: req.body.id || null
                });
            }

            // 执行工具
            const result = await tool.execute(args, tool.module);

            res.json({
                jsonrpc: '2.0',
                result: {
                    content: result.content || [{
                        type: "text",
                        text: JSON.stringify(result)
                    }],
                    isError: result.isError || false
                },
                id: req.body.id || null
            });

        } catch (error) {
            console.error(`❌ 工具执行失败 ${name}:`, error);
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `工具执行失败: ${error.message}`
                },
                id: req.body.id || null
            });
        }
    }

    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'mcp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            sessionId: this.sessionId,
            moduleCount: this.registeredModules.size,
            toolCount: this.tools.size,
            uptime: this.isRunning ? process.uptime() : 0,
            modules: Array.from(this.registeredModules.entries()).map(([name, module]) => ({
                name,
                enabled: module.enabled,
                toolCount: module.tools.length,
                registeredAt: module.registeredAt ? module.registeredAt.toISOString() : null
            }))
        };
    }

    /**
     * 启用/禁用模块
     */
    toggleModule(moduleName, enabled) {
        const module = this.registeredModules.get(moduleName);
        if (module) {
            module.enabled = enabled;
            this.emit('moduleToggled', { moduleName, enabled });
            return true;
        }
        return false;
    }

    /**
     * 重新加载模块
     */
    async reloadModule(moduleName) {
        const module = this.registeredModules.get(moduleName);
        if (module) {
            try {
                // 移除现有工具
                module.tools.forEach(tool => {
                    const toolName = `${moduleName}_${tool.name}`;
                    this.tools.delete(toolName);
                });

                // 重新注册工具
                module.adapter.tools.forEach(tool => {
                    const toolName = `${moduleName}_${tool.name}`;
                    this.tools.set(toolName, {
                        ...tool,
                        moduleName: moduleName,
                        module: module.module
                    });
                });

                this.emit('moduleReloaded', { moduleName });
                return true;
            } catch (error) {
                console.error(`❌ 重新加载模块失败 ${moduleName}:`, error);
                return false;
            }
        }
        return false;
    }
}

module.exports = MCPServiceManager; 