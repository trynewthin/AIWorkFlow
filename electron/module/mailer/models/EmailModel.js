/**
 * 邮件模型类
 * 定义邮件数据结构和基本验证
 */

class EmailModel {
    constructor(data = {}) {
        this.to = data.to || '';
        this.subject = data.subject || '';
        this.text = data.text || '';
        this.html = data.html || '';
        this.from = data.from || '';
        this.fromName = data.fromName || '';
        this.attachments = data.attachments || [];
        this.cc = data.cc || [];
        this.bcc = data.bcc || [];
        this.replyTo = data.replyTo || '';
        this.priority = data.priority || 'normal'; // high, normal, low
        this.timestamp = data.timestamp || new Date();
    }

    /**
     * 验证邮件数据是否有效
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validate() {
        const errors = [];

        // 验证收件人
        if (!this.to || this.to.trim() === '') {
            errors.push('收件人邮箱不能为空');
        } else if (!this.isValidEmail(this.to)) {
            errors.push('收件人邮箱格式不正确');
        }

        // 验证主题
        if (!this.subject || this.subject.trim() === '') {
            errors.push('邮件主题不能为空');
        }

        // 验证内容
        if (!this.text && !this.html) {
            errors.push('邮件内容不能为空');
        }

        // 验证发件人
        if (this.from && !this.isValidEmail(this.from)) {
            errors.push('发件人邮箱格式不正确');
        }

        // 验证抄送
        if (this.cc.length > 0) {
            this.cc.forEach((email, index) => {
                if (!this.isValidEmail(email)) {
                    errors.push(`抄送邮箱 ${index + 1} 格式不正确: ${email}`);
                }
            });
        }

        // 验证密送
        if (this.bcc.length > 0) {
            this.bcc.forEach((email, index) => {
                if (!this.isValidEmail(email)) {
                    errors.push(`密送邮箱 ${index + 1} 格式不正确: ${email}`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 验证邮箱格式
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 转换为 nodemailer 格式
     * @returns {Object}
     */
    toNodemailerFormat() {
        const mailOptions = {
            from: this.fromName ? `"${this.fromName}" <${this.from}>` : this.from,
            to: this.to,
            subject: this.subject
        };

        // 添加内容
        if (this.text) mailOptions.text = this.text;
        if (this.html) mailOptions.html = this.html;

        // 添加可选字段
        if (this.cc.length > 0) mailOptions.cc = this.cc.join(', ');
        if (this.bcc.length > 0) mailOptions.bcc = this.bcc.join(', ');
        if (this.replyTo) mailOptions.replyTo = this.replyTo;
        if (this.attachments.length > 0) mailOptions.attachments = this.attachments;

        // 添加优先级
        if (this.priority !== 'normal') {
            mailOptions.priority = this.priority;
        }

        return mailOptions;
    }

    /**
     * 创建简单文本邮件
     * @param {string} to 收件人
     * @param {string} subject 主题
     * @param {string} text 内容
     * @returns {EmailModel}
     */
    static createTextEmail(to, subject, text) {
        return new EmailModel({
            to,
            subject,
            text
        });
    }

    /**
     * 创建HTML邮件
     * @param {string} to 收件人
     * @param {string} subject 主题
     * @param {string} html HTML内容
     * @param {string} text 纯文本备用内容
     * @returns {EmailModel}
     */
    static createHtmlEmail(to, subject, html, text = '') {
        return new EmailModel({
            to,
            subject,
            html,
            text
        });
    }

    /**
     * 创建提醒邮件（带样式模板）
     * @param {string} to 收件人
     * @param {string} title 提醒标题
     * @param {string} message 提醒内容
     * @param {Object} options 选项
     * @returns {EmailModel}
     */
    static createReminderEmail(to, title, message, options = {}) {
        const timestamp = new Date().toLocaleString('zh-CN');
        const senderName = options.senderName || '系统提醒';
        
        const html = `
        <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
            <!-- 头部 -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 300;">📧 ${senderName}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">重要提醒通知</p>
            </div>
            
            <!-- 主体内容 -->
            <div style="background: white; padding: 40px 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; border-left: 4px solid #667eea; padding-left: 15px;">${title}</h2>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                    <p style="color: #555; line-height: 1.8; margin: 0; font-size: 16px;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <!-- 时间信息 -->
                <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                        <div style="color: #666; font-size: 14px;">
                            <strong>📅 发送时间：</strong>${timestamp}
                        </div>
                        <div style="color: #666; font-size: 14px;">
                            <strong>📤 发送方：</strong>${senderName}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 底部 -->
            <div style="text-align: center; padding: 25px; color: #999; font-size: 12px; background: #f8f9fa;">
                <p style="margin: 0;">这是一封系统自动发送的提醒邮件，请勿直接回复</p>
                <p style="margin: 5px 0 0 0;">如有疑问，请联系系统管理员</p>
            </div>
        </div>
        `;

        const text = `【${senderName}】${title}\n\n${message}\n\n发送时间：${timestamp}\n发送方：${senderName}\n\n这是一封系统自动发送的提醒邮件，请勿直接回复。`;

        return new EmailModel({
            to,
            subject: `【系统提醒】${title}`,
            html,
            text,
            priority: options.priority || 'normal'
        });
    }
}

module.exports = EmailModel; 