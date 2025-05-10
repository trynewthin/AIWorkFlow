/**
 * Embedding 节点（基于 LangChain JS）
 */

// 导入 OpenAIEmbeddings 类
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

// Embedding 节点类
class EmbeddingNode {
  constructor(externalConfig = {}) {
    // 节点公共信息
    this.nodeInfo = {
      nodeId: externalConfig.nodeId || '',
      nodeName: externalConfig.nodeName || EmbeddingNode.nodeConfig.name,
      nextNodeId: externalConfig.nextNodeId || null,
      status: externalConfig.status || EmbeddingNode.Status.IDLE
    };

    // 模型配置
    this.modelName = externalConfig.modelName || EmbeddingNode.defaultConfig.modelName;
    this.modelOptions = externalConfig.modelOptions || {};
  }

  // 执行节点逻辑
  async execute(text) {
    this.setStatus(EmbeddingNode.Status.RUNNING);
    // 创建 embeddings 实例
    const embeddings = new OpenAIEmbeddings({ modelName: this.modelName, ...this.modelOptions });
    try {
      // 生成文本嵌入
      const vector = await embeddings.embedQuery(text);
      this.setStatus(EmbeddingNode.Status.COMPLETED);
      return vector;
    } catch (error) {
      this.setStatus(EmbeddingNode.Status.FAILED);
      throw error;
    }
  }

  // 设置状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // 获取状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // 设置模型名称
  setModelName(name) {
    this.modelName = name;
  }

  // 获取模型名称
  getModelName() {
    return this.modelName;
  }

  // 获取节点输入格式
  getInputType() {
    return EmbeddingNode.nodeConfig.input;
  }

  // 获取节点输出格式
  getOutputType() {
    return EmbeddingNode.nodeConfig.output;
  }
}

// 默认配置
EmbeddingNode.defaultConfig = {
  modelName: 'text-embedding-v3'
};

// 节点元数据
EmbeddingNode.nodeConfig = {
  type: 'model',
  tag: 'embedding',
  name: 'text-to-embedding-lc',
  description: '使用LangChain JS生成文本嵌入向量',
  input: 'text',
  output: 'embedding',
  version: '1.0.0'
};

// 状态枚举
EmbeddingNode.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// 导出节点类
module.exports = EmbeddingNode; 