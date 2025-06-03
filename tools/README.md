# 🔧 AIWorkFlow 开发工具

这个目录包含了 AIWorkFlow 项目的开发工具脚本，用于提升开发效率和解决开发过程中的常见问题。

## 📁 工具列表

### 🔥 dev-server.js
**增强开发服务器**

- **功能**: 提供带有编码优化的热重载开发环境
- **使用**: `npm run dev:enhanced`
- **特性**:
  - 自动设置 UTF-8 编码环境
  - 实时文件变化监控
  - 进程自动重启
  - 错误处理和自动恢复
  - 中文显示优化

### 🔤 fix-encoding.js
**编码检查修复工具**

- **功能**: 检查和修复项目文件编码问题
- **使用**: `npm run fix:encoding`
- **特性**:
  - 智能检测文件编码格式
  - 识别 GBK/UTF-8 编码问题
  - 提供自动转换选项
  - 生成详细的编码报告
  - 支持批量处理

## 🛠️ 其他脚本

### dev.sh
原有的开发脚本

### builds.sh
构建相关脚本

### test.sh
测试脚本

## 📋 使用指南

### 启动开发环境
```bash
# 标准模式
npm run dev

# 增强模式（推荐）
npm run dev:enhanced

# 热重载模式
npm run dev:hot

# 监视模式
npm run dev:watch
```

### 编码问题处理
```bash
# 检查编码问题
npm run fix:encoding

# 手动设置终端编码（Windows）
chcp 65001
```

## 📝 开发建议

1. **优先使用增强模式**: `npm run dev:enhanced` 提供更好的开发体验
2. **定期检查编码**: 使用 `npm run fix:encoding` 确保文件编码统一
3. **保持工具更新**: 根据项目需要扩展和优化工具脚本
4. **文档同步**: 添加新工具时更新此文档

## 🔗 相关文档

- [热重载开发指南](../HOT_RELOAD_GUIDE.md)
- [项目介绍](../项目介绍.md)

---

💡 如需添加新的开发工具，请在此目录下创建脚本并更新本文档。 