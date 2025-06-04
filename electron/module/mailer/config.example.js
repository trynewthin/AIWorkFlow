/**
 * MCP 邮件服务器配置示例
 * 复制此文件为 config.js 并根据需要修改配置
 */

module.exports = {
    // 邮件服务配置
    email: {
        // 邮件服务商: qq, 163, aliyun
        service: process.env.EMAIL_SERVICE || 'qq',
        
        // 发件人邮箱
        username: process.env.EMAIL_USERNAME || 'your-email@qq.com',
        
        // 邮箱授权码
        authCode: process.env.EMAIL_AUTH_CODE || 'your-authorization-code',
        
        // 发件人显示名称
        senderName: process.env.EMAIL_SENDER_NAME || '系统提醒'
    },

    // MCP 服务器配置
    mcp: {
        name: "电子邮件服务",
        version: "1.0.0",
        description: "提供电子邮件发送功能的 MCP 服务器"
    },

    // 调试配置
    debug: process.env.DEBUG === 'true',

    // 自定义邮件服务器配置（可选）
    customSmtp: {
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: false,
        // auth: {
        //     user: 'your-email@gmail.com',
        //     pass: 'your-app-password'
        // }
    },

    // 安全配置
    security: {
        // 允许的收件人域名（空数组表示不限制）
        allowedDomains: [],
        
        // 最大附件大小（字节）
        maxAttachmentSize: 10 * 1024 * 1024, // 10MB
        
        // 邮件发送频率限制（每分钟最多发送数量）
        rateLimit: 10
    }
}; 