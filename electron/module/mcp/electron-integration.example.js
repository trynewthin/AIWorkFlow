/**
 * Electron 主进程 MCP 集成示例
 * 将此代码集成到你的 Electron 主进程文件中
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const { mcpIntegration } = require('./index');

// MCP 服务状态
let mcpServiceRunning = false;

/**
 * 初始化 MCP 集成
 * 在 app.whenReady() 中调用
 */
async function initializeMCP() {
    try {
        console.log('🔧 初始化 MCP 集成...');
        
        // 初始化但不自动启动
        const result = await mcpIntegration.initialize({
            port: 3000,
            host: 'localhost',
            autoStart: false, // 让用户手动控制
            enabledModules: ['mailer']
        });
        
        if (result.success) {
            console.log('✅ MCP 集成初始化成功');
            setupMCPIpcHandlers();
        } else {
            console.error('❌ MCP 集成初始化失败:', result.error);
        }
    } catch (error) {
        console.error('❌ MCP 初始化异常:', error);
    }
}

/**
 * 设置 MCP 相关的 IPC 处理程序
 */
function setupMCPIpcHandlers() {
    // 启动 MCP 服务
    ipcMain.handle('mcp:start', async () => {
        try {
            if (mcpServiceRunning) {
                return { success: false, message: 'MCP服务已在运行中' };
            }
            
            const result = await mcpIntegration.start();
            if (result.success) {
                mcpServiceRunning = true;
                console.log('🚀 MCP服务已启动:', result.url);
                
                // 可以在这里通知所有窗口
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('mcp:status-changed', {
                        running: true,
                        url: result.url
                    });
                });
            }
            return result;
        } catch (error) {
            console.error('❌ 启动MCP服务失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 停止 MCP 服务
    ipcMain.handle('mcp:stop', async () => {
        try {
            const result = await mcpIntegration.stop();
            if (result.success) {
                mcpServiceRunning = false;
                console.log('🛑 MCP服务已停止');
                
                // 通知所有窗口
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('mcp:status-changed', {
                        running: false,
                        url: null
                    });
                });
            }
            return result;
        } catch (error) {
            console.error('❌ 停止MCP服务失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 获取 MCP 服务状态
    ipcMain.handle('mcp:status', () => {
        const status = mcpIntegration.getStatus();
        return {
            ...status,
            running: mcpServiceRunning,
            url: mcpIntegration.getServiceUrl()
        };
    });

    // 切换模块状态
    ipcMain.handle('mcp:toggle-module', async (event, moduleName, enabled) => {
        try {
            const result = await mcpIntegration.toggleModule(moduleName, enabled);
            return { success: result };
        } catch (error) {
            console.error(`❌ 切换模块状态失败 ${moduleName}:`, error);
            return { success: false, error: error.message };
        }
    });

    // 重启 MCP 服务
    ipcMain.handle('mcp:restart', async () => {
        try {
            const result = await mcpIntegration.restart();
            if (result.success) {
                mcpServiceRunning = true;
                
                // 通知所有窗口
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('mcp:status-changed', {
                        running: true,
                        url: result.url
                    });
                });
            }
            return result;
        } catch (error) {
            console.error('❌ 重启MCP服务失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 获取 Claude Desktop 配置
    ipcMain.handle('mcp:claude-config', () => {
        const config = mcpIntegration.getClaudeConfig();
        return config;
    });
}

/**
 * 应用退出时清理 MCP 服务
 */
async function cleanupMCP() {
    if (mcpServiceRunning) {
        console.log('🧹 清理 MCP 服务...');
        try {
            await mcpIntegration.stop();
            console.log('✅ MCP 服务已清理');
        } catch (error) {
            console.error('❌ 清理 MCP 服务失败:', error);
        }
    }
}

// 在应用准备就绪时初始化 MCP
app.whenReady().then(() => {
    initializeMCP();
});

// 应用退出前清理
app.on('before-quit', (event) => {
    if (mcpServiceRunning) {
        event.preventDefault();
        cleanupMCP().then(() => {
            app.quit();
        });
    }
});

// 导出函数供其他模块使用
module.exports = {
    initializeMCP,
    setupMCPIpcHandlers,
    cleanupMCP
};
