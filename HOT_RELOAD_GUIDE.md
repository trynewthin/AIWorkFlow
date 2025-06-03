# 🔥 AIWorkFlow 热重载开发指南

## 概述

本项目已配置完整的热重载开发环境，支持后端代码实时更新，提升开发效率。同时解决了中文编码显示问题。

## 📁 项目结构

```
AIWorkFlow/
├── tools/                    # 🔧 开发工具脚本
│   ├── dev-server.js         # 增强开发服务器
│   ├── fix-encoding.js       # 编码检查修复工具
│   └── ...
├── electron/                 # 📱 主进程代码
│   ├── controller/           # 控制器
│   ├── services/             # 服务层
│   ├── config/               # 配置文件
│   └── ...
└── ...
```

## 🚀 快速开始

### 方式一：标准开发模式（推荐）
```bash
npm run dev
```
使用 electron-egg 框架内置的热重载功能。

### 方式二：增强开发模式
```bash
npm run dev:enhanced
```
使用自定义开发服务器（`tools/dev-server.js`），提供更详细的文件变化监控，并自动设置 UTF-8 编码。

### 方式三：纯热重载模式
```bash
npm run dev:hot
```
使用 nodemon 直接监控文件变化。

### 方式四：监视模式
```bash
npm run dev:watch
```
使用 ee-bin 的监视模式。

## 📁 监控的目录

热重载会监控以下目录中的文件变化：

- `electron/controller/` - 控制器
- `electron/services/` - 服务层
- `electron/config/` - 配置文件
- `electron/database/` - 数据库相关
- `electron/workflow/` - 工作流
- `electron/knowledge/` - 知识库
- `electron/pipeline/` - 管道系统
- `electron/node/` - 节点系统
- `electron/users/` - 用户管理

## ⚙️ 配置文件

### 1. nodemon.json
位置：`electron/config/nodemon.json`

这个文件配置了 nodemon 的监控规则：
- 监控的文件扩展名：`.js`, `.json`
- 忽略的目录：`node_modules/`, `logs/`, `data/` 等
- 延迟时间：1000ms

### 2. config.local.js
位置：`electron/config/config.local.js`

开发环境配置：
- 开启开发者工具
- 启用任务日志
- 配置热重载选项
- 调整日志级别为 DEBUG

### 3. .editorconfig
位置：`.editorconfig`

统一编码和格式配置：
- 强制使用 UTF-8 编码
- 统一换行符和缩进
- 确保文件编码一致性

## 🛠️ 开发流程

1. **启动开发环境**
   ```bash
   npm run dev:enhanced  # 推荐，包含编码优化
   ```

2. **修改后端代码**
   - 编辑 `electron/` 目录下的任何 `.js` 或 `.json` 文件
   - 保存文件

3. **自动重载**
   - 系统会自动检测文件变化
   - Electron 主进程会重新启动
   - 无需手动刷新

## 🔧 编码问题解决

### 检查编码问题
```bash
npm run fix:encoding
```
这个命令会运行 `tools/fix-encoding.js` 脚本来：
- 扫描项目中的所有代码文件
- 检查文件编码类型
- 识别可能的编码问题
- 提供修复建议

### 中文乱码解决方案

**问题现象：**
- ee-core 输出显示为乱码：`宸ヤ綔娴佺浉鍏宠〃缁撴瀯鍒濆鍖栧畢鎴?`
- 我们的脚本中文显示正常

**解决方法：**

1. **使用增强开发模式**
   ```bash
   npm run dev:enhanced
   ```
   这个模式会自动设置 Windows UTF-8 编码

2. **手动设置终端编码**
   ```bash
   chcp 65001  # Windows 设置为 UTF-8
   ```

3. **检查文件编码**
   - 在 VS Code 中查看右下角编码显示
   - 如果显示为 GBK，转换为 UTF-8：
     - 点击编码显示 → "通过编码重新打开" → "GBK"
     - 然后 "通过编码保存" → "UTF-8"

## 🔧 故障排除

### 热重载不工作？

1. **检查 nodemon 是否安装**
   ```bash
   npm list nodemon
   ```

2. **检查文件是否在监控目录内**
   确保修改的文件在配置的监控目录中。

3. **检查文件扩展名**
   只有 `.js` 和 `.json` 文件会触发重载。

4. **重新安装依赖**
   ```bash
   npm install
   ```

### 重载太频繁？

调整 `electron/config/nodemon.json` 中的 `delay` 值：
```json
{
  "delay": 2000
}
```

### 需要排除某些文件？

在 `nodemon.json` 的 `ignore` 数组中添加路径：
```json
{
  "ignore": [
    "node_modules/",
    "logs/",
    "your-file-or-directory"
  ]
}
```

### 中文仍然显示乱码？

1. **检查 IDE 设置**
   - VS Code: 设置 → 搜索 "encoding" → 设置为 UTF-8
   - 确保 `.editorconfig` 插件已安装

2. **检查系统编码**
   - Windows: 控制面板 → 区域 → 管理 → 更改系统区域设置 → Beta版UTF-8

3. **运行编码检查**
   ```bash
   npm run fix:encoding
   ```

## 🛠️ 工具脚本说明

### tools/dev-server.js
增强的开发服务器脚本，提供：
- 自动设置 UTF-8 编码环境
- 文件变化监控
- 进程重启管理
- 错误处理和自动恢复

### tools/fix-encoding.js
编码检查和修复工具，功能：
- 智能检测文件编码格式
- 识别 GBK/UTF-8 编码问题
- 提供自动转换选项
- 生成详细的编码报告

## 📝 使用建议

1. **推荐使用 `npm run dev:enhanced`** - 包含编码优化的开发模式
2. **开发时开启开发者工具** - 已在 `config.local.js` 中配置
3. **关注控制台输出** - 可以看到文件变化和重载信息
4. **定期检查编码** - 使用 `npm run fix:encoding` 命令
5. **统一团队编码设置** - 确保所有开发者使用 UTF-8 编码
6. **工具脚本集中管理** - 所有开发工具脚本都在 `tools/` 目录下

## 🎯 性能优化

- 热重载只监控必要的目录，避免监控整个项目
- 设置了合理的延迟时间，防止频繁重启
- 忽略了日志文件和临时文件
- 自动设置编码环境变量，避免中文显示问题
- 工具脚本模块化，便于维护和扩展

## 📚 相关文档

- [Electron-Egg 官方文档](https://github.com/dromara/electron-egg)
- [Nodemon 配置说明](https://nodemon.io/)
- [UTF-8 编码最佳实践](https://utf8everywhere.org/)

---

🎉 现在你可以享受高效的热重载开发体验了，并且中文显示问题也得到了解决！工具脚本已整理到 `tools/` 目录，结构更清晰。 