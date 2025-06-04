/**
 * 邮件模块 MCP 适配器
 * 将原有的邮件模块功能适配为MCP工具
 * 保持原有代码不变，只是创建适配层
 */

class MailerAdapter {
    constructor() {
        this.name = 'mailer';
        this.description = '电子邮件发送服务';
        this.version = '1.0.0';
    }

    /**
     * 获取适配器配置
     * 定义所有可用的MCP工具
     */
    getAdapterConfig() {
        return {
            name: this.name,
            description: this.description,
            version: this.version,
            tools: [
                {
                    name: 'send_reminder_email',
                    description: '发送提醒邮件，支持单个或多个收件人',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            recipients: {
                                oneOf: [
                                    { type: 'string', format: 'email' },
                                    { 
                                        type: 'array',
                                        items: { type: 'string', format: 'email' }
                                    }
                                ],
                                description: '收件人邮箱地址（字符串或字符串数组）'
                            },
                            title: {
                                type: 'string',
                                description: '邮件标题'
                            },
                            message: {
                                type: 'string',
                                description: '邮件内容'
                            },
                            options: {
                                type: 'object',
                                properties: {
                                    priority: {
                                        type: 'string',
                                        enum: ['high', 'normal', 'low'],
                                        description: '邮件优先级'
                                    },
                                    replyTo: {
                                        type: 'string',
                                        format: 'email',
                                        description: '回复地址'
                                    },
                                    attachments: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                filename: { type: 'string' },
                                                path: { type: 'string' },
                                                content: { type: 'string' }
                                            }
                                        },
                                        description: '附件列表'
                                    }
                                },
                                description: '邮件选项'
                            }
                        },
                        required: ['recipients', 'title', 'message']
                    },
                    execute: this.sendReminderEmail.bind(this)
                },
                {
                    name: 'send_text_email',
                    description: '发送纯文本邮件',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            to: {
                                type: 'string',
                                format: 'email',
                                description: '收件人邮箱地址'
                            },
                            subject: {
                                type: 'string',
                                description: '邮件主题'
                            },
                            text: {
                                type: 'string',
                                description: '纯文本邮件内容'
                            }
                        },
                        required: ['to', 'subject', 'text']
                    },
                    execute: this.sendTextEmail.bind(this)
                },
                {
                    name: 'send_html_email',
                    description: '发送HTML格式邮件',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            to: {
                                type: 'string',
                                format: 'email',
                                description: '收件人邮箱地址'
                            },
                            subject: {
                                type: 'string',
                                description: '邮件主题'
                            },
                            html: {
                                type: 'string',
                                description: 'HTML格式的邮件内容'
                            },
                            text: {
                                type: 'string',
                                description: '纯文本备用内容（可选）'
                            }
                        },
                        required: ['to', 'subject', 'html']
                    },
                    execute: this.sendHtmlEmail.bind(this)
                },
                {
                    name: 'send_system_notification',
                    description: '发送系统通知邮件，支持不同类型的通知',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            recipients: {
                                oneOf: [
                                    { type: 'string', format: 'email' },
                                    { 
                                        type: 'array',
                                        items: { type: 'string', format: 'email' }
                                    }
                                ],
                                description: '收件人邮箱地址（字符串或字符串数组）'
                            },
                            type: {
                                type: 'string',
                                enum: ['info', 'warning', 'error', 'success'],
                                description: '通知类型'
                            },
                            title: {
                                type: 'string',
                                description: '通知标题'
                            },
                            message: {
                                type: 'string',
                                description: '通知内容'
                            },
                            data: {
                                type: 'object',
                                description: '附加数据（可选）'
                            }
                        },
                        required: ['recipients', 'type', 'title', 'message']
                    },
                    execute: this.sendSystemNotification.bind(this)
                },
                {
                    name: 'test_email_connection',
                    description: '测试邮件服务连接状态',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: []
                    },
                    execute: this.testEmailConnection.bind(this)
                },
                {
                    name: 'get_email_service_status',
                    description: '获取邮件服务运行状态',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: []
                    },
                    execute: this.getEmailServiceStatus.bind(this)
                },
                {
                    name: 'validate_email_address',
                    description: '验证邮件地址格式是否正确',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            email: {
                                type: 'string',
                                description: '需要验证的邮件地址'
                            }
                        },
                        required: ['email']
                    },
                    execute: this.validateEmailAddress.bind(this)
                }
            ]
        };
    }

    /**
     * 发送提醒邮件
     */
    async sendReminderEmail(args, mailerModule) {
        try {
            const { recipients, title, message, options = {} } = args;
            
            console.log(`📧 MCP调用: 发送提醒邮件 - 收件人: ${JSON.stringify(recipients)}, 标题: ${title}`);
            
            const result = await mailerModule.sendReminder(recipients, title, message, options);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 提醒邮件发送成功\n📧 收件人: ${Array.isArray(recipients) ? recipients.join(', ') : recipients}\n📝 标题: ${title}\n✨ 状态: ${result.message || '发送完成'}`
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
            console.error('MCP邮件适配器错误 - 发送提醒邮件:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送提醒邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 发送文本邮件
     */
    async sendTextEmail(args, mailerModule) {
        try {
            const { to, subject, text } = args;
            
            console.log(`📧 MCP调用: 发送文本邮件 - 收件人: ${to}, 主题: ${subject}`);
            
            const result = await mailerModule.sendTextEmail(to, subject, text);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 文本邮件发送成功\n📧 收件人: ${to}\n📝 主题: ${subject}\n✨ 状态: ${result.message || '发送完成'}`
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
            console.error('MCP邮件适配器错误 - 发送文本邮件:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送文本邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 发送HTML邮件
     */
    async sendHtmlEmail(args, mailerModule) {
        try {
            const { to, subject, html, text = '' } = args;
            
            console.log(`📧 MCP调用: 发送HTML邮件 - 收件人: ${to}, 主题: ${subject}`);
            
            const result = await mailerModule.sendHtmlEmail(to, subject, html, text);
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ HTML邮件发送成功\n📧 收件人: ${to}\n📝 主题: ${subject}\n✨ 状态: ${result.message || '发送完成'}`
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
            console.error('MCP邮件适配器错误 - 发送HTML邮件:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送HTML邮件时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 发送系统通知邮件
     */
    async sendSystemNotification(args, mailerModule) {
        try {
            const { recipients, type, title, message, data = {} } = args;
            
            console.log(`📧 MCP调用: 发送系统通知 - 收件人: ${JSON.stringify(recipients)}, 类型: ${type}, 标题: ${title}`);
            
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
                        text: `${typeEmoji[type]} 系统通知发送成功\n📧 收件人: ${Array.isArray(recipients) ? recipients.join(', ') : recipients}\n📋 类型: ${type}\n📝 标题: ${title}\n✨ 状态: ${result.message || '发送完成'}`
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
            console.error('MCP邮件适配器错误 - 发送系统通知:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 发送系统通知时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 测试邮件连接
     */
    async testEmailConnection(args, mailerModule) {
        try {
            console.log('📧 MCP调用: 测试邮件服务连接');
            
            const result = await mailerModule.testConnection();
            
            if (result.success) {
                return {
                    content: [{
                        type: "text",
                        text: `✅ 邮件服务连接测试成功\n🔧 服务状态: 正常\n📊 配置信息:\n${JSON.stringify(result.data || {}, null, 2)}`
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
            console.error('MCP邮件适配器错误 - 测试邮件连接:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 测试邮件连接时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 获取邮件服务状态
     */
    async getEmailServiceStatus(args, mailerModule) {
        try {
            console.log('📧 MCP调用: 获取邮件服务状态');
            
            const status = mailerModule.getStatus();
            
            return {
                content: [{
                    type: "text",
                    text: `📊 邮件服务状态\n🔧 服务状态: ${status.success ? '正常' : '异常'}\n📈 详细信息:\n${JSON.stringify(status.data || {}, null, 2)}`
                }]
            };
        } catch (error) {
            console.error('MCP邮件适配器错误 - 获取邮件服务状态:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 获取邮件服务状态时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }

    /**
     * 验证邮件地址
     */
    async validateEmailAddress(args, mailerModule) {
        try {
            const { email } = args;
            
            console.log(`📧 MCP调用: 验证邮件地址 - ${email}`);
            
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
                        text: `❌ 邮件地址验证失败\n📧 地址: ${email}\n🔍 错误信息: ${result.errors ? result.errors.join(', ') : '格式不正确'}`
                    }],
                    isError: true
                };
            }
        } catch (error) {
            console.error('MCP邮件适配器错误 - 验证邮件地址:', error);
            return {
                content: [{
                    type: "text",
                    text: `❌ 验证邮件地址时发生错误: ${error.message}`
                }],
                isError: true
            };
        }
    }
}

module.exports = MailerAdapter; 