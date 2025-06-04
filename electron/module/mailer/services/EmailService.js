/**
 * 邮件服务类
 * 处理邮件发送的核心业务逻辑
 */

const nodemailer = require('nodemailer');
const EmailModel = require('../models/EmailModel');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isInitialized = false;
        this.config = null;
    }

    /**
     * 初始化邮件服务
     * @param {Object} config 邮件配置
     */
    async initialize(config) {
        try {
            this.config = config;
            
            // 根据服务类型创建传输器配置
            const transportConfig = this.getTransportConfig(config);
            
            // 创建传输器
            this.transporter = nodemailer.createTransport(transportConfig);
            
            // 验证连接
            await this.verifyConnection();
            
            this.isInitialized = true;
            console.log(`✅ 邮件服务初始化成功 - 使用 ${config.service} 服务`);
            
            return { success: true, message: '邮件服务初始化成功' };
        } catch (error) {
            console.error('❌ 邮件服务初始化失败:', error.message);
            throw new Error(`邮件服务初始化失败: ${error.message}`);
        }
    }

    /**
     * 根据服务类型获取传输器配置
     * @param {Object} config 配置对象
     * @returns {Object} 传输器配置
     */
    getTransportConfig(config) {
        const serviceConfigs = {
            qq: {
                host: 'smtp.qq.com',
                port: 587,
                secure: false,
                auth: {
                    user: config.username,
                    pass: config.authCode
                },
                tls: {
                    rejectUnauthorized: false
                }
            },
            '163': {
                host: 'smtp.163.com',
                port: 465,
                secure: true,
                auth: {
                    user: config.username,
                    pass: config.authCode
                },
                tls: {
                    rejectUnauthorized: false
                }
            },
            aliyun: {
                host: 'smtpdm.aliyun.com',
                port: 465,
                secure: true,
                auth: {
                    user: config.username,
                    pass: config.authCode
                },
                tls: {
                    rejectUnauthorized: false
                }
            }
        };

        const transportConfig = serviceConfigs[config.service.toLowerCase()];
        if (!transportConfig) {
            throw new Error(`不支持的邮件服务: ${config.service}`);
        }

        return transportConfig;
    }

    /**
     * 验证邮件服务连接
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        if (!this.transporter) {
            throw new Error('邮件传输器未初始化');
        }

        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            throw new Error(`邮件服务连接失败: ${error.message}`);
        }
    }

    /**
     * 发送单个邮件
     * @param {EmailModel} emailModel 邮件模型实例
     * @returns {Promise<Object>} 发送结果
     */
    async sendEmail(emailModel) {
        if (!this.isInitialized) {
            throw new Error('邮件服务未初始化，请先调用 initialize 方法');
        }

        // 验证邮件数据
        const validation = emailModel.validate();
        if (!validation.valid) {
            return {
                success: false,
                error: `邮件数据验证失败: ${validation.errors.join(', ')}`
            };
        }

        try {
            // 设置发件人信息
            if (!emailModel.from) {
                emailModel.from = this.config.username;
                emailModel.fromName = this.config.senderName || '系统提醒';
            }

            // 转换为 nodemailer 格式
            const mailOptions = emailModel.toNodemailerFormat();

            // 发送邮件
            const info = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ 邮件发送成功 - 收件人: ${emailModel.to}, 主题: ${emailModel.subject}`);
            
            return {
                success: true,
                messageId: info.messageId,
                response: info.response,
                recipient: emailModel.to
            };
        } catch (error) {
            console.error(`❌ 邮件发送失败 - 收件人: ${emailModel.to}, 错误: ${error.message}`);
            return {
                success: false,
                error: error.message,
                recipient: emailModel.to
            };
        }
    }

    /**
     * 批量发送邮件
     * @param {Array<EmailModel>} emailModels 邮件模型数组
     * @param {Object} options 选项 { delay: 发送间隔(毫秒) }
     * @returns {Promise<Array>} 发送结果数组
     */
    async sendBulkEmails(emailModels, options = {}) {
        const { delay = 1500 } = options; // 默认1.5秒间隔
        const results = [];

        for (let i = 0; i < emailModels.length; i++) {
            const emailModel = emailModels[i];
            
            try {
                const result = await this.sendEmail(emailModel);
                results.push({
                    index: i,
                    ...result
                });

                // 添加发送间隔，避免触发限制
                if (i < emailModels.length - 1) {
                    await this.delay(delay);
                }
            } catch (error) {
                results.push({
                    index: i,
                    success: false,
                    error: error.message,
                    recipient: emailModel.to
                });
            }
        }

        // 统计发送结果
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        
        console.log(`📊 批量发送完成 - 成功: ${successCount}, 失败: ${failureCount}, 总计: ${results.length}`);

        return results;
    }

    /**
     * 发送提醒邮件的便捷方法
     * @param {string|Array} recipients 收件人（字符串或 [{email, name}] 数组）
     * @param {string} title 提醒标题
     * @param {string} message 提醒内容
     * @param {Object} options 选项
     * @returns {Promise<Object|Array>} 发送结果
     */
    async sendReminder(recipients, title, message, options = {}) {
        try {
            if (typeof recipients === 'string') {
                // 单个收件人
                const emailModel = EmailModel.createReminderEmail(recipients, title, message, {
                    senderName: this.config.senderName,
                    ...options
                });
                
                return await this.sendEmail(emailModel);
            } else if (Array.isArray(recipients)) {
                // 多个收件人
                const emailModels = recipients.map(recipient => {
                    const personalizedMessage = message.replace(/\{name\}/g, recipient.name || '用户');
                    const personalizedTitle = title.replace(/\{name\}/g, recipient.name || '用户');
                    
                    return EmailModel.createReminderEmail(recipient.email, personalizedTitle, personalizedMessage, {
                        senderName: this.config.senderName,
                        ...options
                    });
                });

                return await this.sendBulkEmails(emailModels, options);
            } else {
                throw new Error('收件人参数格式不正确');
            }
        } catch (error) {
            console.error('发送提醒邮件失败:', error.message);
            throw error;
        }
    }

    /**
     * 发送文本邮件
     * @param {string} to 收件人
     * @param {string} subject 主题
     * @param {string} text 内容
     * @returns {Promise<Object>} 发送结果
     */
    async sendTextEmail(to, subject, text) {
        const emailModel = EmailModel.createTextEmail(to, subject, text);
        return await this.sendEmail(emailModel);
    }

    /**
     * 发送HTML邮件
     * @param {string} to 收件人
     * @param {string} subject 主题
     * @param {string} html HTML内容
     * @param {string} text 纯文本备用内容
     * @returns {Promise<Object>} 发送结果
     */
    async sendHtmlEmail(to, subject, html, text = '') {
        const emailModel = EmailModel.createHtmlEmail(to, subject, html, text);
        return await this.sendEmail(emailModel);
    }

    /**
     * 获取服务状态
     * @returns {Object} 服务状态信息
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            service: this.config?.service || null,
            username: this.config?.username || null,
            senderName: this.config?.senderName || null
        };
    }

    /**
     * 延迟函数
     * @param {number} ms 毫秒数
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 重置服务（清除配置和连接）
     */
    reset() {
        this.transporter = null;
        this.isInitialized = false;
        this.config = null;
        console.log('邮件服务已重置');
    }
}

module.exports = EmailService; 