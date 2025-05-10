/**
 * 文本分块节点（基于 LangChain JS 加载器与分块策略）
 */

// 导入目录加载器、Markdown 加载器和分块器
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { MarkdownLoader } = require("langchain/document_loaders/fs/markdown");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

class ChunkNode {
  constructor(externalConfig = {}) {
    // 节点公共信息
    this.nodeInfo = {
      nodeId: externalConfig.nodeId || '',
      nodeName: externalConfig.nodeName || ChunkNode.nodeConfig.name,
      nextNodeId: externalConfig.nextNodeId || null,
      status: externalConfig.status || ChunkNode.Status.IDLE
    };
    // 分块配置
    this.chunkSize = externalConfig.chunkSize || ChunkNode.defaultConfig.chunkSize;
    this.chunkOverlap = externalConfig.chunkOverlap || ChunkNode.defaultConfig.chunkOverlap;
  }

  // 执行节点逻辑：加载文件并分块
  async execute(pathOrDir) {
    this.setStatus(ChunkNode.Status.RUNNING);
    try {
      const loader = new DirectoryLoader(pathOrDir, { 
        ".md": (filePath) => new MarkdownLoader(filePath)
      }, true);
      const documents = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap
      });
      const chunkedDocs = await splitter.splitDocuments(documents);
      const chunks = chunkedDocs.map(doc => doc.pageContent);
      this.setStatus(ChunkNode.Status.COMPLETED);
      return chunks;
    } catch (error) {
      this.setStatus(ChunkNode.Status.FAILED);
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

  // 获取节点输入类型
  getInputType() {
    return ChunkNode.nodeConfig.input;
  }

  // 获取节点输出类型
  getOutputType() {
    return ChunkNode.nodeConfig.output;
  }

  // 设置分块尺寸
  setChunkSize(size) {
    this.chunkSize = size;
  }

  // 获取分块尺寸
  getChunkSize() {
    return this.chunkSize;
  }

  // 设置分块重叠
  setChunkOverlap(overlap) {
    this.chunkOverlap = overlap;
  }

  // 获取分块重叠
  getChunkOverlap() {
    return this.chunkOverlap;
  }
}

// 默认配置
ChunkNode.defaultConfig = {
  chunkSize: 1000,
  chunkOverlap: 200
};

// 节点元数据
ChunkNode.nodeConfig = {
  type: 'model',
  tag: 'split',
  name: 'text-to-chunks-lc',
  description: '使用LangChain JS加载器和分块策略将文本或文件分割为多个块',
  input: 'path',
  output: 'text[]',
  version: '1.0.0'
};

// 状态枚举
ChunkNode.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// 导出节点类
module.exports = ChunkNode; 