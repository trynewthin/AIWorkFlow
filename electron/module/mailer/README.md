# MCP 邮件服务器

一个强大的 Model Context Protocol (MCP) 服务器，将电子邮件发送功能暴露给 AI 助手（如 Claude Desktop、Cursor 等）。

## 🌟 功能特性

- ✅ **发送提醒邮件** - 快速发送自定义提醒邮件
- ✅ **发送文本邮件** - 发送纯文本格式邮件
- ✅ **发送HTML邮件** - 发送富文本HTML格式邮件
- ✅ **系统通知邮件** - 发送不同类型的系统通知（信息、警告、错误、成功）
- ✅ **连接测试** - 测试邮件服务连接状态
- ✅ **服务状态监控** - 获取邮件服务运行状态
- ✅ **邮件地址验证** - 验证邮件地址格式是否正确
- 🔒 **安全验证** - 完整的输入验证和错误处理
- 🎯 **多邮件服务支持** - 支持QQ邮箱、163邮箱、阿里云邮箱等

## 📦 安装

### 前置要求

- Node.js >= 16.0.0
- npm 或 yarn

### 本地安装

```bash
# 进入邮件模块目录
cd electron/module/mailer

# 安装依赖
npm install

# 安装 MCP SDK
npm install @modelcontextprotocol/sdk zod
```

### 全局安装（可选）

```bash
# 全局安装，方便在任何地方使用
npm install -g .
```

## ⚙️ 配置

### 1. 环境变量配置

在项目根目录或邮件模块目录创建 `.env` 文件：

```bash
# 邮件服务配置
EMAIL_SERVICE=qq              # 邮件服务商 (qq/163/aliyun)
EMAIL_USERNAME=your@qq.com     # 发件人邮箱
EMAIL_AUTH_CODE=your_auth_code # 邮箱授权码
EMAIL_SENDER_NAME=系统提醒      # 发件人显示名称
```

### 2. 邮箱授权码获取

#### QQ邮箱
1. 登录QQ邮箱 → 设置 → 账户
2. 开启 SMTP 服务
3. 生成授权码

#### 163邮箱
1. 登录163邮箱 → 设置 → POP3/SMTP/IMAP
2. 开启 SMTP 服务
3. 设置客户端授权密码

## 🚀 使用方法

### 方式一：直接运行

```bash
# 启动 MCP 服务器
npm start

# 或者使用 node
node mcp-server.js
```

### 方式二：集成到 Claude Desktop

1. 打开 Claude Desktop 配置文件：
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 添加服务器配置：

```json
{
  "mcpServers": {
    "mailer": {
      "command": "node",
      "args": ["/path/to/your/electron/module/mailer/mcp-server.js"],
      "env": {
        "EMAIL_SERVICE": "qq",
        "EMAIL_USERNAME": "your@qq.com",
        "EMAIL_AUTH_CODE": "your_auth_code",
        "EMAIL_SENDER_NAME": "系统提醒"
      }
    }
  }
}
```

3. 重启 Claude Desktop

### 方式三：集成到 Cursor/其他 IDE

参考各自的 MCP 集成文档，配置方式类似。

## 🛠️ 可用工具

### 1. 发送提醒邮件 (send_reminder_email)

```javascript
// 参数
{
  recipients: "user@example.com" | ["user1@example.com", "user2@example.com"],
  title: "邮件标题",
  message: "邮件内容",
  options: {
    priority: "high" | "normal" | "low",  // 可选
    replyTo: "reply@example.com",         // 可选
    attachments: [...]                    // 可选
  }
}
```

### 2. 发送文本邮件 (send_text_email)

```javascript
// 参数
{
  to: "user@example.com",
  subject: "邮件主题",
  text: "纯文本邮件内容"
}
```

### 3. 发送HTML邮件 (send_html_email)

```javascript
// 参数
{
  to: "user@example.com",
  subject: "邮件主题",
  html: "<h1>HTML内容</h1>",
  text: "备用纯文本内容"  // 可选
}
```

### 4. 发送系统通知 (send_system_notification)

```javascript
// 参数
{
  recipients: "user@example.com" | ["user1@example.com", "user2@example.com"],
  type: "info" | "warning" | "error" | "success",
  title: "通知标题",
  message: "通知内容",
  data: { ... }  // 可选，附加数据
}
```

### 5. 测试连接 (test_email_connection)

```javascript
// 无参数，直接调用
// 返回连接状态和配置信息
```

### 6. 获取服务状态 (get_email_service_status)

```javascript
// 无参数，直接调用
// 返回详细的服务状态信息
```

### 7. 验证邮件地址 (validate_email_address)

```javascript
// 参数
{
  email: "test@example.com"
}
```

## 📝 使用示例

### 在 Claude Desktop 中使用

```
用户: 帮我发送一封邮件给 john@example.com，标题是"项目更新"，内容是"项目已完成第一阶段开发"

Claude: 我来帮您发送这封邮件。

[调用 send_text_email 工具]
- 收件人: john@example.com
- 主题: 项目更新
- 内容: 项目已完成第一阶段开发

✅ 邮件发送成功！
```

### 在代码中直接调用（开发测试）

```javascript
const mailerMCP = require('./mcp-server.js');

// 注意：在实际使用中，MCP工具通过协议调用，这里仅为说明用途
```

## 🔧 开发和测试

### 开发模式

```bash
# 使用 nodemon 监听文件变化
npm run dev
```

### 测试工具

```bash
# 运行测试脚本（如果创建了的话）
npm test
```

### 调试

MCP 服务器的日志会输出到标准错误流（stderr），您可以查看：

```bash
# 启动时会看到类似输出
🚀 MCP 邮件服务器已启动，使用标准输入输出通信
📧 可用工具: send_reminder_email, send_text_email, send_html_email, send_system_notification, test_email_connection, get_email_service_status, validate_email_address
```

## 🔒 安全性

- ✅ 输入验证：使用 Zod 进行严格的参数验证
- ✅ 错误处理：完善的错误捕获和用户友好的错误消息
- ✅ 邮件地址验证：防止无效邮件地址
- ✅ 权限控制：通过环境变量控制邮件服务访问
- ⚠️ 建议在生产环境中添加额外的安全措施（如 IP 白名单、访问令牌等）

## 🐛 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查邮箱授权码是否正确
   - 确认邮件服务商设置是否正确
   - 检查网络连接

2. **MCP 服务器启动失败**
   - 确认 Node.js 版本 >= 16.0.0
   - 检查依赖是否正确安装
   - 查看错误日志

3. **Claude Desktop 无法连接**
   - 确认配置文件路径正确
   - 检查 JSON 格式是否正确
   - 重启 Claude Desktop

### 日志查看

服务器日志通过 `console.error()` 输出，包含：
- 工具调用信息
- 错误详情
- 服务状态

## 🤝 贡献

欢迎贡献代码！请确保：

1. 遵循现有代码风格
2. 添加适当的错误处理
3. 更新文档
4. 添加测试用例

## 📄 许可证

Apache-2.0 License

## 🔗 相关链接

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop](https://claude.ai/desktop)
- [Nodemailer 文档](https://nodemailer.com/)

## ❓ 支持

如有问题，请：

1. 查看本文档的故障排除部分
2. 在 GitHub Issues 中提交问题
3. 联系开发团队

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！ 