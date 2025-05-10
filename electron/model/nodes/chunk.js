/**
 * 文本分块节点（基于 LangChain JS 加载器与分块策略）
 */

// 导入目录加载器和文本加载器，以支持Markdown文件读取
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const BaseNode = require('./baseNode');
const fs = require('fs');
const path = require('path');

class ChunkNode extends BaseNode {
  constructor(externalConfig = {}) {
    super(externalConfig);
    // 分块配置
    this.chunkSize = externalConfig.chunkSize || ChunkNode.defaultConfig.chunkSize;
    this.chunkOverlap = externalConfig.chunkOverlap || ChunkNode.defaultConfig.chunkOverlap;
  }

  // 执行节点逻辑：加载文件并分块
  async execute(pathOrDir) {
    this.setStatus(ChunkNode.Status.RUNNING);
    try {
      let documents;
      
      // 判断路径是文件还是目录
      const stats = fs.statSync(pathOrDir);
      
      if (stats.isFile()) {
        // 如果是文件，直接使用 TextLoader
        console.log(`加载单个文件: ${pathOrDir}`);
        const loader = new TextLoader(pathOrDir);
        documents = await loader.load();
      } else if (stats.isDirectory()) {
        // 如果是目录，使用 DirectoryLoader
        console.log(`加载目录中的文件: ${pathOrDir}`);
        const loader = new DirectoryLoader(pathOrDir, {
          ".md": (filePath) => new TextLoader(filePath),
          ".txt": (filePath) => new TextLoader(filePath),
          ".json": (filePath) => new TextLoader(filePath),
          ".html": (filePath) => new TextLoader(filePath),
        }, true);
        documents = await loader.load();
      } else {
        throw new Error(`路径 ${pathOrDir} 既不是文件也不是目录`);
      }
      
      // 分块处理
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
      console.error('ChunkNode执行失败:', error);
      throw error;
    }
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

// 导出节点类
module.exports = ChunkNode; 