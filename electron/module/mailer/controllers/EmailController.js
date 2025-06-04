/**
 * 邮件控制器
 * 对外提供邮件发送的API接口
 */

const EmailService = require('../services/EmailService');
const EmailModel = require('../models/EmailModel');
const path = require('path');

class EmailController {
    constructor() {
        this.emailService = new EmailService();
    }

    /**
     * 从环境变量初始化邮件服务
     * @returns {Promise<Object>} 初始化结果
     */
    async initializeFromEnv() {
        try {
            // 读取环境变量
            const config = {
                service: process.env.EMAIL_SERVICE || 'qq',
                username: process.env.EMAIL_USERNAME,
                authCode: process.env.EMAIL_AUTH_CODE,
                senderName: process.env.EMAIL_SENDER_NAME || '系统提醒'
            };

            // 验证必需的配置
            if (!config.username) {
                throw new Error('EMAIL_USERNAME 环境变量未设置');
            }
            if (!config.authCode) {
                throw new Error('EMAIL_AUTH_CODE 环境变量未设置');
            }

            // 初始化服务
            const result = await this.emailService.initialize(config);
            
            return {
                success: true,
                message: '邮件服务初始化成功',
                config: {
                    service: config.service,
                    username: config.username,
                    senderName: config.senderName
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 使用自定义配置初始化邮件服务
     * @param {Object} config 邮件配置
     * @returns {Promise<Object>} 初始化结果
     */
    async initialize(config) {
        try {
            const result = await this.emailService.initialize(config);
            return {
                success: true,
                message: '邮件服务初始化成功',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 发送提醒邮件
     * @param {Object} params 参数对象
     * @param {string|Array} params.recipients 收件人
     * @param {string} params.title 提醒标题
     * @param {string} params.message 提醒内容
     * @param {Object} params.options 其他选项
     * @returns {Promise<Object>} 发送结果
     */
    async sendReminder(params) {
        try {
            const { recipients, title, message, options = {} } = params;

            // 参数验证
            if (!recipients) {
                return {
                    success: false,
                    error: '收件人不能为空'
                };
            }
            if (!title) {
                return {
                    success: false,
                    error: '提醒标题不能为空'
                };
            }
            if (!message) {
                return {
                    success: false,
                    error: '提醒内容不能为空'
                };
            }

            // 发送邮件
            const result = await this.emailService.sendReminder(recipients, title, message, options);
            
            return {
                success: true,
                message: '提醒邮件发送完成',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 发送文本邮件
     * @param {Object} params 参数对象
     * @param {string} params.to 收件人
     * @param {string} params.subject 主题
     * @param {string} params.text 内容
     * @returns {Promise<Object>} 发送结果
     */
    async sendTextEmail(params) {
        try {
            const { to, subject, text } = params;

            // 参数验证
            if (!to || !subject || !text) {
                return {
                    success: false,
                    error: '收件人、主题和内容都不能为空'
                };
            }

            const result = await this.emailService.sendTextEmail(to, subject, text);
            
            return {
                success: true,
                message: '文本邮件发送完成',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 发送HTML邮件
     * @param {Object} params 参数对象
     * @param {string} params.to 收件人
     * @param {string} params.subject 主题
     * @param {string} params.html HTML内容
     * @param {string} params.text 纯文本备用内容
     * @returns {Promise<Object>} 发送结果
     */
    async sendHtmlEmail(params) {
        try {
            const { to, subject, html, text = '' } = params;

            // 参数验证
            if (!to || !subject || !html) {
                return {
                    success: false,
                    error: '收件人、主题和HTML内容都不能为空'
                };
            }

            const result = await this.emailService.sendHtmlEmail(to, subject, html, text);
            
            return {
                success: true,
                message: 'HTML邮件发送完成',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 发送自定义邮件
     * @param {Object} params 邮件参数
     * @returns {Promise<Object>} 发送结果
     */
    async sendCustomEmail(params) {
        try {
            // 创建邮件模型
            const emailModel = new EmailModel(params);
            
            // 发送邮件
            const result = await this.emailService.sendEmail(emailModel);
            
            return {
                success: true,
                message: '自定义邮件发送完成',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 批量发送邮件
     * @param {Object} params 参数对象
     * @param {Array} params.emails 邮件数据数组
     * @param {Object} params.options 选项 { delay: 发送间隔 }
     * @returns {Promise<Object>} 发送结果
     */
    async sendBulkEmails(params) {
        try {
            const { emails, options = {} } = params;

            if (!Array.isArray(emails) || emails.length === 0) {
                return {
                    success: false,
                    error: '邮件数据数组不能为空'
                };
            }

            // 创建邮件模型数组
            const emailModels = emails.map(emailData => new EmailModel(emailData));
            
            // 批量发送
            const results = await this.emailService.sendBulkEmails(emailModels, options);
            
            // 统计结果
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.length - successCount;
            
            return {
                success: true,
                message: `批量发送完成 - 成功: ${successCount}, 失败: ${failureCount}`,
                data: {
                    results,
                    summary: {
                        total: results.length,
                        success: successCount,
                        failure: failureCount
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 测试邮件服务连接
     * @returns {Promise<Object>} 测试结果
     */
    async testConnection() {
        try {
            const isConnected = await this.emailService.verifyConnection();
            
            return {
                success: true,
                message: '邮件服务连接正常',
                data: {
                    connected: isConnected,
                    status: this.emailService.getStatus()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: {
                    connected: false,
                    status: this.emailService.getStatus()
                }
            };
        }
    }

    /**
     * 获取邮件服务状态
     * @returns {Object} 服务状态
     */
    getStatus() {
        return {
            success: true,
            data: this.emailService.getStatus()
        };
    }

    /**
     * 重置邮件服务
     * @returns {Object} 重置结果
     */
    reset() {
        this.emailService.reset();
        return {
            success: true,
            message: '邮件服务已重置'
        };
    }

    /**
     * 发送系统通知邮件（预设模板）
     * @param {Object} params 参数对象
     * @param {string|Array} params.recipients 收件人
     * @param {string} params.type 通知类型 (info/warning/error/success)
     * @param {string} params.title 通知标题
     * @param {string} params.message 通知内容
     * @param {Object} params.data 附加数据
     * @returns {Promise<Object>} 发送结果
     */
    async sendSystemNotification(params) {
        try {
            const { recipients, type = 'info', title, message, data = {} } = params;

            // 根据类型设置图标和颜色
            const typeConfig = {
                info: { icon: 'ℹ️', color: '#2196F3', bgColor: '#e3f2fd' },
                warning: { icon: '⚠️', color: '#ff9800', bgColor: '#fff3e0' },
                error: { icon: '❌', color: '#f44336', bgColor: '#ffebee' },
                success: { icon: '✅', color: '#4caf50', bgColor: '#e8f5e9' }
            };

            const config = typeConfig[type] || typeConfig.info;
            
            // 构建系统通知内容
            const notificationMessage = `
${config.icon} ${message}

${data.details ? `详细信息：\n${data.details}\n` : ''}
${data.action ? `建议操作：\n${data.action}\n` : ''}
${data.url ? `相关链接：${data.url}` : ''}
            `.trim();

            // 发送提醒邮件
            const result = await this.sendReminder({
                recipients,
                title: `【${type.toUpperCase()}】${title}`,
                message: notificationMessage,
                options: {
                    priority: type === 'error' ? 'high' : 'normal'
                }
            });

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 验证邮件地址格式
     * @param {string} email 邮件地址
     * @returns {Object} 验证结果
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        return {
            success: true,
            data: {
                email,
                valid: isValid,
                message: isValid ? '邮件地址格式正确' : '邮件地址格式不正确'
            }
        };
    }
}

module.exports = EmailController; 