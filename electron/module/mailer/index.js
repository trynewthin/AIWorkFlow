/**
 * 邮件模块统一导出
 * 提供完整的邮件发送功能
 */

const EmailController = require('./controllers/EmailController');
const EmailService = require('./services/EmailService');
const EmailModel = require('./models/EmailModel');

// 创建控制器实例
const emailController = new EmailController();

/**
 * 快速发送提醒邮件的便捷函数
 * @param {string|Array} recipients 收件人
 * @param {string} title 标题
 * @param {string} message 内容
 * @param {Object} options 选项
 * @returns {Promise<Object>} 发送结果
 */
async function sendReminder(recipients, title, message, options = {}) {
    // 确保服务已初始化
    await ensureInitialized();
    
    return await emailController.sendReminder({
        recipients,
        title,
        message,
        options
    });
}

/**
 * 快速发送文本邮件的便捷函数
 * @param {string} to 收件人
 * @param {string} subject 主题
 * @param {string} text 内容
 * @returns {Promise<Object>} 发送结果
 */
async function sendTextEmail(to, subject, text) {
    await ensureInitialized();
    
    return await emailController.sendTextEmail({
        to,
        subject,
        text
    });
}

/**
 * 快速发送HTML邮件的便捷函数
 * @param {string} to 收件人
 * @param {string} subject 主题
 * @param {string} html HTML内容
 * @param {string} text 纯文本备用内容
 * @returns {Promise<Object>} 发送结果
 */
async function sendHtmlEmail(to, subject, html, text = '') {
    await ensureInitialized();
    
    return await emailController.sendHtmlEmail({
        to,
        subject,
        html,
        text
    });
}

/**
 * 发送系统通知邮件
 * @param {string|Array} recipients 收件人
 * @param {string} type 通知类型 (info/warning/error/success)
 * @param {string} title 标题
 * @param {string} message 内容
 * @param {Object} data 附加数据
 * @returns {Promise<Object>} 发送结果
 */
async function sendSystemNotification(recipients, type, title, message, data = {}) {
    await ensureInitialized();
    
    return await emailController.sendSystemNotification({
        recipients,
        type,
        title,
        message,
        data
    });
}

/**
 * 确保邮件服务已初始化
 */
async function ensureInitialized() {
    const status = emailController.getStatus();
    if (!status.data.initialized) {
        const result = await emailController.initializeFromEnv();
        if (!result.success) {
            throw new Error(`邮件服务初始化失败: ${result.error}`);
        }
    }
}

/**
 * 测试邮件服务连接
 * @returns {Promise<Object>} 测试结果
 */
async function testConnection() {
    await ensureInitialized();
    return await emailController.testConnection();
}

/**
 * 获取邮件服务状态
 * @returns {Object} 服务状态
 */
function getStatus() {
    return emailController.getStatus();
}

/**
 * 初始化邮件服务
 * @param {Object} config 配置对象（可选，不传则使用环境变量）
 * @returns {Promise<Object>} 初始化结果
 */
async function initialize(config = null) {
    if (config) {
        return await emailController.initialize(config);
    } else {
        return await emailController.initializeFromEnv();
    }
}

/**
 * 验证邮件地址格式
 * @param {string} email 邮件地址
 * @returns {Object} 验证结果
 */
function validateEmail(email) {
    return emailController.validateEmail(email);
}

// 导出所有功能
module.exports = {
    // 便捷函数（推荐使用）
    sendReminder,
    sendTextEmail,
    sendHtmlEmail,
    sendSystemNotification,
    testConnection,
    getStatus,
    initialize,
    validateEmail,
    
    // 完整的类（高级使用）
    EmailController,
    EmailService,
    EmailModel,
    
    // 控制器实例（直接调用）
    controller: emailController,
    
    // 常用的邮件类型常量
    NotificationTypes: {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        SUCCESS: 'success'
    },
    
    // 优先级常量
    Priority: {
        HIGH: 'high',
        NORMAL: 'normal',
        LOW: 'low'
    }
}; 