/**
 * 文本分块节点（基于 LangChain JS 加载器与分块策略）
 */

// 导入目录加载器和文本加载器，以支持Markdown文件读取
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const BaseNode = require('./baseNode');
const PIPconfigs = require('../configs/PIPconfigs');
const IOConfigs = require('../configs/IOconfigs');
const fs = require('fs');
const path = require('path');

class ChunkNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // 分块配置
    this.chunkSize = config.chunkSize || ChunkNode.defaultConfig.chunkSize;
    this.chunkOverlap = config.chunkOverlap || ChunkNode.defaultConfig.chunkOverlap;
  }

  // 执行分块：基于 Pipeline 流处理路径或目录
  async execute(pipeline) {
    // TODO: 设置状态为运行中
    this.setStatus(ChunkNode.Status.RUNNING);
    try {
      // TODO: 获取路径数据
      const pathItems = pipeline.getByType(IOConfigs.DataType.PATH);
      if (pathItems.length === 0) {
        throw new Error('未找到路径数据，无法执行分块');
      }
      for (const item of pathItems) {
        const pathOrDir = item.data;
        // TODO: 加载文档
        const stats = fs.statSync(pathOrDir);
        let documents;
        if (stats.isFile()) {
          // TODO: 加载单个文件
          const loader = new TextLoader(pathOrDir);
          documents = await loader.load();
        } else if (stats.isDirectory()) {
          // TODO: 加载目录文件
          const loader = new DirectoryLoader(pathOrDir, {
            '.md': (filePath) => new TextLoader(filePath),
            '.txt': (filePath) => new TextLoader(filePath),
            '.json': (filePath) => new TextLoader(filePath),
            '.html': (filePath) => new TextLoader(filePath),
          }, true);
          documents = await loader.load();
        } else {
          throw new Error(`路径 ${pathOrDir} 既不是文件也不是目录`);
        }
        // TODO: 分块处理
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const chunkedDocs = await splitter.splitDocuments(documents);
        // TODO: 添加分块结果
        for (const doc of chunkedDocs) {
          pipeline.add(IOConfigs.DataType.TEXT, doc.pageContent);
        }
      }
      // TODO: 设置状态为完成
      this.setStatus(ChunkNode.Status.COMPLETED);
      // TODO: 更新输出管道类型为 文本处理
      pipeline.setPipelineType(PIPconfigs.PipelineType.TEXT_PROCESSING);
      return pipeline;
    } catch (error) {
      // TODO: 设置状态为失败
      this.setStatus(ChunkNode.Status.FAILED);
      console.error('ChunkNode 执行失败:', error);
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

  // TODO: 返回自定义配置，用于序列化
  getCustomConfig() {
    return {
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap
    };
  }

  // TODO: 设置自定义配置，用于反序列化
  setCustomConfig(config) {
    if (config.chunkSize != null) this.setChunkSize(config.chunkSize);
    if (config.chunkOverlap != null) this.setChunkOverlap(config.chunkOverlap);
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
  // 支持的输入管道类型
  supportedInputPipelines: [
    PIPconfigs.PipelineType.FILE,
    PIPconfigs.PipelineType.DOCUMENT_PROCESSING,
    PIPconfigs.PipelineType.TEXT_PROCESSING
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PIPconfigs.PipelineType.TEXT_PROCESSING
  ],
  version: '1.0.0'
};

// 导出节点类
module.exports = ChunkNode; 