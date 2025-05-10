/**
 * Embedding 节点（基于 LangChain JS）
 */

// 导入 OpenAIEmbeddings 类
const { OpenAIEmbeddings } = require("@langchain/openai");
const BaseNode = require('./baseNode');

// Embedding 节点类
class EmbeddingNode extends BaseNode {
  constructor(externalConfig = {}) {
    super(externalConfig);

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

  // 设置模型名称
  setModelName(name) {
    this.modelName = name;
  }

  // 获取模型名称
  getModelName() {
    return this.modelName;
  }

  // 输入/输出类型及状态相关方法已提取至基类 BaseNode
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

// 导出节点类
module.exports = EmbeddingNode; 