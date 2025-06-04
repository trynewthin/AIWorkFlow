#!/usr/bin/env node

/**
 * MCP 邮件服务器
 * 将 electron/module/mailer 模块功能暴露为 MCP 服务
 * 使用标准输入输出进行通信
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const path = require('path');

// 导入原有的邮件模块
const mailerModule = require('./index.js');

/**
 * 创建 MCP 服务器实例
 */
const server = new McpServer({
    name: "电子邮件服务",
    version: "1.0.0",
    description: "提供电子邮件发送功能的 MCP 服务器"
});

/**
 * 邮件发送工具 - 发送提醒邮件
 */
server.tool(
    "send_reminder_email",
    {
        recipients: z.union([z.string(), z.array(z.string())]).describe("收件人邮箱地址（字符串或字符串数组）"),
        title: z.string().describe("邮件标题"),
        message: z.string().describe("邮件内容"),
        options: z.object({
            priority: z.enum(['high', 'normal', 'low']).optional().describe("邮件优先级"),
            replyTo: z.string().email().optional().describe("回复地址"),
            attachments: z.array(z.object({
                filename: z.string(),
                path: z.string().optional(),
                content: z.string().optional()
            })).optional().describe("附件列表")
        }).optional().describe("邮件选项")
    },
    async ({ recipients, title, message, options = {} }) => {
        try {
            console.error(`MCP: 发送提醒邮件 - 收件人: ${JSON.stringify(recipients)}, 标题: ${title}`);
            
            const result = await mailerModule.sendReminder(recipients, title, message, options);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 提醒邮件发送成功\n📧 收件人: ${Array.isArray(recipients) ? recipients.join(', ') : recipients}\n📝 标题: ${title}\n✨ 结果: ${result.message}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ 提醒邮件发送失败\n🔍 错误: ${result.error}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 发送提醒邮件失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送提醒邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件发送工具 - 发送文本邮件
 */
server.tool(
    "send_text_email",
    {
        to: z.string().email().describe("收件人邮箱地址"),
        subject: z.string().describe("邮件主题"),
        text: z.string().describe("纯文本邮件内容")
    },
    async ({ to, subject, text }) => {
        try {
            console.error(`MCP: 发送文本邮件 - 收件人: ${to}, 主题: ${subject}`);
            
            const result = await mailerModule.sendTextEmail(to, subject, text);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 文本邮件发送成功\n📧 收件人: ${to}\n📝 主题: ${subject}\n✨ 结果: ${result.message}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ 文本邮件发送失败\n🔍 错误: ${result.error}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 发送文本邮件失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送文本邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件发送工具 - 发送HTML邮件
 */
server.tool(
    "send_html_email",
    {
        to: z.string().email().describe("收件人邮箱地址"),
        subject: z.string().describe("邮件主题"),
        html: z.string().describe("HTML格式的邮件内容"),
        text: z.string().optional().describe("纯文本备用内容")
    },
    async ({ to, subject, html, text = '' }) => {
        try {
            console.error(`MCP: 发送HTML邮件 - 收件人: ${to}, 主题: ${subject}`);
            
            const result = await mailerModule.sendHtmlEmail(to, subject, html, text);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ HTML邮件发送成功\n📧 收件人: ${to}\n📝 主题: ${subject}\n✨ 结果: ${result.message}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ HTML邮件发送失败\n🔍 错误: ${result.error}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 发送HTML邮件失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送HTML邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件发送工具 - 发送系统通知邮件
 */
server.tool(
    "send_system_notification",
    {
        recipients: z.union([z.string(), z.array(z.string())]).describe("收件人邮箱地址（字符串或字符串数组）"),
        type: z.enum(['info', 'warning', 'error', 'success']).describe("通知类型"),
        title: z.string().describe("通知标题"),
        message: z.string().describe("通知内容"),
        data: z.record(z.any()).optional().describe("附加数据")
    },
    async ({ recipients, type, title, message, data = {} }) => {
        try {
            console.error(`MCP: 发送系统通知 - 收件人: ${JSON.stringify(recipients)}, 类型: ${type}, 标题: ${title}`);
            
            const result = await mailerModule.sendSystemNotification(recipients, type, title, message, data);
            
            if (result.success) {
                const typeEmoji = {
                    'info': 'ℹ️',
                    'warning': '⚠️',
                    'error': '❌',
                    'success': '✅'
                };
                
                return {
                    content: [{
                        type: "text",
                        text: `${typeEmoji[type]} 系统通知发送成功\n📧 收件人: ${Array.isArray(recipients) ? recipients.join(', ') : recipients}\n📋 类型: ${type}\n📝 标题: ${title}\n✨ 结果: ${result.message}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ 系统通知发送失败\n🔍 错误: ${result.error}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 发送系统通知失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送系统通知时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件服务工具 - 测试连接
 */
server.tool(
    "test_email_connection",
    {},
    async () => {
        try {
            console.error('MCP: 测试邮件服务连接');
            
            const result = await mailerModule.testConnection();
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 邮件服务连接测试成功\n🔧 服务状态: 正常\n📊 配置信息: ${JSON.stringify(result.data, null, 2)}`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ 邮件服务连接测试失败\n🔍 错误: ${result.error}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 测试邮件连接失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 测试邮件连接时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件服务工具 - 获取服务状态
 */
server.tool(
    "get_email_service_status",
    {},
    async () => {
        try {
            console.error('MCP: 获取邮件服务状态');
            
            const status = mailerModule.getStatus();
            
            return {
                content: [{
                    type: "text",
                    text: `📊 邮件服务状态\n🔧 服务状态: ${status.success ? '正常' : '异常'}\n📈 详细信息:\n${JSON.stringify(status.data, null, 2)}`
                }]
            };
        } catch (error) {
            console.error('MCP: 获取邮件服务状态失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 获取邮件服务状态时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 邮件工具 - 验证邮件地址格式
 */
server.tool(
    "validate_email_address",
    {
        email: z.string().describe("需要验证的邮件地址")
    },
    async ({ email }) => {
        try {
            console.error(`MCP: 验证邮件地址 - ${email}`);
            
            const result = mailerModule.validateEmail(email);
            
            if (result.valid) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 邮件地址验证通过\n📧 地址: ${email}\n🔍 验证结果: 格式正确`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: `❌ 邮件地址验证失败\n📧 地址: ${email}\n🔍 错误信息: ${result.errors.join(', ')}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP: 验证邮件地址失败:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 验证邮件地址时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
);

/**
 * 启动 MCP 服务器
 */
async function startMCPServer() {
    try {
        // 创建标准输入输出传输层
        const transport = new StdioServerTransport();
        
        // 连接服务器
        await server.connect(transport);
        
        console.error("🚀 MCP 邮件服务器已启动，使用标准输入输出通信");
        console.error("📧 可用工具: send_reminder_email, send_text_email, send_html_email, send_system_notification, test_email_connection, get_email_service_status, validate_email_address");
        
    } catch (error) {
        console.error("❌ MCP 邮件服务器启动失败:", error);
        process.exit(1);
    }
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
    process.exit(1);
});

// 启动服务器
startMCPServer(); 