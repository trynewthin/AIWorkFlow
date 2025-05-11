# 管道与节点执行框架

## 概述

本框架实现了基于管道 (Pipeline) 的节点 (Node) 链式执行能力，支持多种数据类型、多种管道类型，方便灵活组装节点处理流程。

## 管道 (Pipeline)

管道是数据传递的载体，包含多个具有相同类型的数据项。

### 特点

- 必须指定管道类型 (`pipelineType`)
- 数据项格式为 `{ type, data }`，不需要手动指定ID
- 支持按类型获取数据
- 支持链式调用

### 创建管道

```javascript
const Pipeline = require('../model/pipeline/Pipeline');
const PIPconfigs = require('../model/configs/PIPconfigs');
const IOConfigs = require('../model/configs/IOconfigs');

// 方法1：通过构造函数
const pipeline = new Pipeline(PIPconfigs.PipelineType.TEXT_PROCESSING);
pipeline.add(IOConfigs.DataType.TEXT, '这是一段测试文本');

// 方法2：通过静态方法
const pipeline = Pipeline.of(
  PIPconfigs.PipelineType.TEXT_PROCESSING, 
  IOConfigs.DataType.TEXT, 
  '这是一段测试文本'
);
```

### 常用方法

- `add(type, data)` - 添加数据项
- `getByType(type)` - 按类型获取数据项
- `setPipelineType(type)`/`getPipelineType()` - 管理管道类型
- `pipe(node)` - 管道式调用节点
- `clear()` - 清空管道

## 节点 (Node)

节点接收管道输入，处理后返回包含新数据的管道。

### 节点定义

所有节点都继承自 `BaseNode`，至少需要实现：
- `execute(data)` 方法 - 核心处理逻辑
- `nodeConfig` 静态属性 - 定义I/O和支持的管道类型

```javascript
// 示例节点配置
MyNode.nodeConfig = {
  type: 'model',
  tag: 'example',
  name: 'example-node',
  description: '示例节点',
  supportedInputPipelines: [
    PIPconfigs.PipelineType.TEXT_PROCESSING,
    PIPconfigs.PipelineType.CUSTOM
  ],
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.TEXT_PROCESSING,
    PIPconfigs.PipelineType.LLM
  ],
  supportedDataTypes: [IOConfigs.DataType.TEXT],
  version: '1.0.0'
};
```

### 执行机制

节点通过 `process` 方法接收和处理管道：
1. 检查管道类型是否在支持的输入管道类型列表中
2. 将整个管道传递给 `execute` 方法处理
3. 检查返回的管道类型是否在支持的输出管道类型列表中
4. 返回处理后的管道

## 使用示例

### 单节点调用

```javascript
const { PipelineType } = require('../model/configs/PIPconfigs');
const { DataType } = require('../model/configs/IOconfigs');
const Pipeline = require('../model/pipeline/Pipeline');
const ChatNode = require('../model/nodes/chat');

// 创建管道
const pipeline = Pipeline.of(PipelineType.CHAT, DataType.TEXT, '你好，世界！');

// 创建节点并处理
const chatNode = new ChatNode();
const resultPipeline = await pipeline.pipe(chatNode);

// 获取结果
const replies = resultPipeline.getByType(DataType.TEXT);
console.log(replies[replies.length - 1].data);
```

### 多节点链式调用

```javascript
const Pipeline = require('../model/pipeline/Pipeline');
const { PipelineType } = require('../model/configs/PIPconfigs');
const { DataType } = require('../model/configs/IOconfigs');
const PromptNode = require('../model/nodes/prompt');
const ChatNode = require('../model/nodes/chat');

// 创建初始管道
const pipeline = Pipeline.of(
  PipelineType.TEXT_PROCESSING, 
  DataType.TEXT, 
  '写一个hello world程序'
);

// 链式调用多个节点
const result = await pipeline
  .pipe(new PromptNode())  // 优化提示词
  .pipe(new ChatNode());   // 生成代码

// 获取最终结果
const finalResponses = result.getByType(DataType.TEXT);
console.log(finalResponses[finalResponses.length - 1].data);
```

## 自定义节点

创建自定义节点，只需继承 `BaseNode` 并实现 `execute` 方法：

```javascript
const BaseNode = require('./baseNode');
const PIPconfigs = require('../configs/PIPconfigs');
const IOConfigs = require('../configs/IOconfigs');

class MyCustomNode extends BaseNode {
  constructor(config = {}) {
    super(config);
  }

  async execute(pipeline) {
    // 实现核心处理逻辑
    // 从管道获取文本数据
    const textItems = pipeline.getByType(IOConfigs.DataType.TEXT);
    
    // 处理每条数据
    for (const item of textItems) {
      const result = `处理结果: ${item.data}`;
      // 将处理结果添加到管道
      pipeline.add(IOConfigs.DataType.TEXT, result);
    }
    
    return pipeline;
  }
}

// 定义节点元数据
MyCustomNode.nodeConfig = {
  type: 'custom',
  tag: 'mynode',
  name: 'my-custom-node',
  description: '自定义处理节点',
  supportedInputPipelines: [
    PIPconfigs.PipelineType.CUSTOM,
    PIPconfigs.PipelineType.TEXT_PROCESSING
  ],
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.CUSTOM,
    PIPconfigs.PipelineType.TEXT_PROCESSING
  ],
  supportedDataTypes: [IOConfigs.DataType.TEXT],
  version: '1.0.0'
};

module.exports = MyCustomNode; 