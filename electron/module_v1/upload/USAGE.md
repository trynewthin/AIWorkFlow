# 文件存储服务模块

## 概述

这是一个跨模块的文件存储服务，为其他模块提供文件存储功能，并实现模块间的存储隔离。每个模块的文件存储在独立的目录中，互不干扰。

## 主要特性

- ✅ 模块级存储隔离
- ✅ 自动目录管理（按模块名/年月分类）
- ✅ 文件信息管理和查询
- ✅ 模块文件批量操作
- ✅ 存储统计功能
- ✅ 完全解耦，不依赖其他系统

## 数据库结构

### upload_files 表

```sql
CREATE TABLE upload_files (
  id TEXT PRIMARY KEY,              -- 文件唯一标识
  module_name TEXT NOT NULL,        -- 所属模块名称
  filename TEXT NOT NULL,           -- 原始文件名
  mimetype TEXT,                    -- 文件 MIME 类型
  size INTEGER NOT NULL,            -- 文件大小（字节）
  path TEXT NOT NULL,               -- 存储相对路径
  description TEXT,                 -- 文件描述
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP  -- 上传时间
);
```

## 存储目录结构

```
data/upload_v1/
├── knowledge/          # knowledge模块的文件
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── uuid1.pdf
│   │   │   └── uuid2.docx
│   │   └── 02/
│   │       └── uuid3.txt
│   └── 2025/
│       └── 01/
│           └── uuid4.md
├── workflow/           # workflow模块的文件
│   └── 2024/
│       └── 12/
│           ├── uuid5.json
│           └── uuid6.yaml
└── other_module/       # 其他模块的文件
    └── 2024/
        └── 12/
            └── uuid7.png
```

## 基本使用方法

### 1. 导入服务

```javascript
const { getFileStorageService } = require('./module_v1/upload');

// 创建文件存储服务实例
const fileStorage = getFileStorageService();
```

### 2. 存储文件

```javascript
// 为knowledge模块存储一个文档
async function storeDocument() {
  try {
    const uploadedFile = await fileStorage.storeFile('knowledge', {
      sourcePath: '/path/to/document.pdf',
      filename: 'user-manual.pdf',
      mimetype: 'application/pdf',
      description: '用户手册'
    });
  
    console.log('文件存储成功:', uploadedFile.id);
    console.log('存储路径:', uploadedFile.path);
  } catch (error) {
    console.error('文件存储失败:', error.message);
  }
}
```

### 3. 获取文件信息

```javascript
// 获取文件信息（带模块权限检查）
async function getFileInfo(fileId) {
  try {
    const fileInfo = await fileStorage.getFileInfo(fileId, 'knowledge');
    console.log('文件信息:', fileInfo.toJSON());
  } catch (error) {
    console.error('获取文件信息失败:', error.message);
  }
}
```

### 4. 列出模块文件

```javascript
// 列出knowledge模块的所有文件
async function listKnowledgeFiles() {
  try {
    const result = await fileStorage.listModuleFiles('knowledge', {
      page: 1,
      limit: 20,
      mimetype: 'application/pdf' // 可选：只列出PDF文件
    });
  
    console.log('文件列表:', result.files);
    console.log('总数:', result.total);
    console.log('分页信息:', { 
      page: result.page, 
      totalPages: result.totalPages 
    });
  } catch (error) {
    console.error('获取文件列表失败:', error.message);
  }
}
```

### 5. 删除文件

```javascript
// 删除单个文件（带模块权限检查）
async function deleteFile(fileId) {
  try {
    const success = await fileStorage.deleteFile(fileId, 'knowledge');
    console.log('删除结果:', success);
  } catch (error) {
    console.error('删除文件失败:', error.message);
  }
}

// 删除模块的所有文件
async function deleteAllKnowledgeFiles() {
  try {
    const deletedCount = await fileStorage.deleteModuleFiles('knowledge');
    console.log('删除了', deletedCount, '个文件');
  } catch (error) {
    console.error('批量删除失败:', error.message);
  }
}
```

### 6. 获取文件路径

```javascript
// 获取文件的物理路径（用于文件操作）
async function getFilePath(fileId) {
  try {
    const filePath = await fileStorage.getFilePath(fileId, 'knowledge');
    console.log('文件路径:', filePath);
  
    // 现在可以进行文件操作
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      console.log('文件存在');
    }
  } catch (error) {
    console.error('获取文件路径失败:', error.message);
  }
}
```

### 7. 存储统计

```javascript
// 获取指定模块的存储统计
async function getModuleStats() {
  try {
    const stats = await fileStorage.getModuleStorageStats('knowledge');
    console.log('knowledge模块统计:', {
      文件数量: stats.totalFiles,
      总大小: stats.formattedTotalSize
    });
  } catch (error) {
    console.error('获取统计失败:', error.message);
  }
}

// 获取所有模块的统计
async function getAllModuleStats() {
  try {
    const allStats = await fileStorage.getAllModuleStats();
    allStats.forEach(stat => {
      console.log(`${stat.moduleName}: ${stat.fileCount}个文件, ${stat.formattedTotalSize}`);
    });
  } catch (error) {
    console.error('获取统计失败:', error.message);
  }
}

// 获取全局统计
async function getGlobalStats() {
  try {
    const globalStats = await fileStorage.getGlobalStorageStats();
    console.log('全局统计:', {
      总文件数: globalStats.totalFiles,
      总大小: globalStats.formattedTotalSize
    });
  } catch (error) {
    console.error('获取统计失败:', error.message);
  }
}
```

## 在其他模块中的使用示例

### Knowledge模块中的使用

```javascript
// electron/module/knowledge/services/DocumentService.js
const { getFileStorageService } = require('../../module_v1/upload');

class DocumentService {
  constructor() {
    this.fileStorage = getFileStorageService();
    this.moduleName = 'knowledge';
  }

  async uploadDocument(documentPath, filename, description) {
    return await this.fileStorage.storeFile(this.moduleName, {
      sourcePath: documentPath,
      filename,
      mimetype: this._getMimeType(filename),
      description
    });
  }

  async getDocuments(page = 1, limit = 20) {
    return await this.fileStorage.listModuleFiles(this.moduleName, {
      page,
      limit,
      mimetype: 'application/pdf' // 只获取PDF文档
    });
  }

  async deleteDocument(fileId) {
    return await this.fileStorage.deleteFile(fileId, this.moduleName);
  }

  _getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
```

### Workflow模块中的使用

```javascript
// electron/module/workflow/services/ConfigService.js
const { getFileStorageService } = require('../../module_v1/upload');

class ConfigService {
  constructor() {
    this.fileStorage = getFileStorageService();
    this.moduleName = 'workflow';
  }

  async saveWorkflowConfig(configPath, workflowName) {
    return await this.fileStorage.storeFile(this.moduleName, {
      sourcePath: configPath,
      filename: `${workflowName}.json`,
      mimetype: 'application/json',
      description: `${workflowName} 工作流配置`
    });
  }

  async getWorkflowConfigs() {
    return await this.fileStorage.listModuleFiles(this.moduleName, {
      mimetype: 'application/json'
    });
  }

  async exportWorkflowConfig(fileId) {
    const filePath = await this.fileStorage.getFilePath(fileId, this.moduleName);
    // 读取并返回配置内容
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}
```

## 文件对象结构

```javascript
{
  id: "uuid",
  moduleName: "knowledge",
  filename: "document.pdf",
  mimetype: "application/pdf",
  size: 1024000,
  formattedSize: "1 MB",
  extension: "pdf",
  isImage: false,
  isDocument: true,
  description: "重要文档",
  uploadTime: "2024-01-01T00:00:00.000Z"
}
```

## 配置选项

```javascript
const fileStorage = getFileStorageService({
  maxFileSize: 100 * 1024 * 1024,    // 最大文件大小：100MB
  allowedMimeTypes: [],               // 允许的文件类型（空数组=允许所有）
  uploadDir: 'file_storage'           // 自定义存储目录名称
});
```

## 注意事项

1. **模块隔离**：每个模块的文件存储在独立目录中，确保数据隔离
2. **权限控制**：建议在调用时指定模块名称，服务会自动验证文件归属
3. **目录管理**：服务会自动创建和管理目录结构
4. **错误处理**：所有方法都包含完整的错误处理和日志记录
5. **性能优化**：支持分页查询和索引优化

## 最佳实践

1. **模块命名**：使用清晰的模块名称，如 'knowledge', 'workflow', 'user-data'
2. **权限检查**：在删除和获取文件时总是传入模块名称进行权限检查
3. **资源清理**：模块卸载时调用 `deleteModuleFiles()` 清理相关文件
4. **错误处理**：总是使用 try-catch 包装文件操作
5. **统计监控**：定期检查存储统计，避免磁盘空间问题
