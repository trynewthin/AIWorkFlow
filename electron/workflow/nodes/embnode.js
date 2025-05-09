/**
 * 文本向量节点
 */

// 导入 OpenAI 库
'use strict';
const OpenAIImport = require("openai");
const OpenAI = OpenAIImport.default || OpenAIImport;

// 文本向量节点类
class EmbNode {
  constructor(externalConfig = {}) {
    // 节点公共配置
    this.nodeInfo = {
      nodeId: externalConfig.nodeId || '',
      nodeName: externalConfig.nodeName || 'new embedding node',
      nextNodeId: externalConfig.nextNodeId || null,
      status: externalConfig.status || EmbNode.StatusEnum.IDLE
    };

    this.embeddingConfig = {
      model: EmbNode.aiConfig.defaultModel,
      dimension: EmbNode.aiConfig.defaultDimension,
      encodingFormat: EmbNode.aiConfig.defaultEncodingFormat
    };
  }

  // 节点执行逻辑
  async execute(input = '') {
    // 更新节点状态为运行中
    this.setStatus(EmbNode.StatusEnum.RUNNING);
    
    const openai = new OpenAI({
      apiKey: EmbNode.aiConfig.apiKey,
      baseURL: EmbNode.aiConfig.apiUrl
    });

    try {
      const completion = await openai.embeddings.create({
        model: this.embeddingConfig.model,
        input: input,
        dimensions: this.embeddingConfig.dimension,
        encoding_format: this.embeddingConfig.encodingFormat
      });
      // 更新节点状态为已完成
      this.setStatus(EmbNode.StatusEnum.COMPLETED);
      // 返回向量表示
      return completion.data[0].embedding;
    } catch (error) {
      // 如果发生错误，更新节点状态为失败
      this.setStatus(EmbNode.StatusEnum.FAILED);
      throw error;
    }
  }

  // 设置节点状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // 获取节点状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // 获取节点接受的输入格式
  getInputType() {
    return EmbNode.nodeConfig.input;
  }

  // 获取节点输出的格式
  getOutputType() {
    return EmbNode.nodeConfig.output;
  }

  // 设置向量模型
  setEmbeddingModel(model) {
    this.embeddingConfig.model = model;
  }

  // 设置向量维度
  setEmbeddingDimension(dimension) {
    this.embeddingConfig.dimension = dimension;
  }

  // 获取向量模型
  getEmbeddingModel() {
    return this.embeddingConfig.model;
  }

  // 获取向量维度
  getEmbeddingDimension() {
    return this.embeddingConfig.dimension;
  }
}

// 节点自有配置
EmbNode.nodeConfig = {
  type: 'normal',
  tag: 'embedding',
  name: 'text-to-embedding',
  description: '将文本输入转换为向量表示的节点，适用于文本向量化的任务',
  input: 'text',
  output: 'embedding',
  version: '1.0.0'
};

// 节点AI配置
EmbNode.aiConfig = {
  defaultModel: 'text-embedding-v3',
  defaultDimension: 1024,
  defaultEncodingFormat: 'float',
  apiKey: 'sk-b1ed8552feff467ba5b453af61200db8',
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
};

// 节点状态枚举，作为 EmbNode 的成员类
EmbNode.StatusEnum = {
  IDLE: 'idle', // 空闲
  RUNNING: 'running', // 运行中
  COMPLETED: 'completed', // 已完成
  FAILED: 'failed', // 失败
  PENDING: 'pending' // 待执行
};

// 导出节点类
module.exports = EmbNode;