/**
 * @class ChunkNode
 * @description 文本分块节点（基于 LangChain JS 加载器与分块策略）
 */

// 导入目录加载器和文本加载器，以支持Markdown文件读取
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const BaseNode = require('./baseNode');
const { PipelineType } = require('../pipeline/Piptype');
const DataType = require('../pipeline/Datatype');
const fs = require('fs');
const path = require('path');

class ChunkNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {number} [config.chunkSize] - 分块大小
   * @param {number} [config.chunkOverlap] - 分块重叠大小
   */
  constructor(config = {}) {
    super(config);
    // 分块配置
    this.chunkSize = config.chunkSize || ChunkNode.defaultConfig.chunkSize;
    this.chunkOverlap = config.chunkOverlap || ChunkNode.defaultConfig.chunkOverlap;

    // 注册支持的管道类型处理器
    this.registerHandler(PipelineType.FILE, this._handleChunking.bind(this));
    this.registerHandler(PipelineType.DOCUMENT_PROCESSING, this._handleChunking.bind(this));
    this.registerHandler(PipelineType.TEXT_PROCESSING, this._handleChunking.bind(this));
    // 注册默认的未支持类型处理器
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @private
   * @description 执行分块：基于 Pipeline 流处理路径或目录
   * @param {Pipeline} pipeline - 输入的管道实例
   * @returns {Promise<Pipeline>} 处理后的管道实例
   */
  async _handleChunking(pipeline) {
    this.setStatus(ChunkNode.Status.RUNNING);
    try {
      const pathItems = pipeline.getByType(DataType.PATH);
      if (pathItems.length === 0) {
        throw new Error('未找到路径数据，无法执行分块');
      }
      for (const item of pathItems) {
        const pathOrDir = item.data;
        const stats = fs.statSync(pathOrDir);
        let documents;
        if (stats.isFile()) {
          const loader = new TextLoader(pathOrDir);
          documents = await loader.load();
        } else if (stats.isDirectory()) {
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
        
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const chunkedDocs = await splitter.splitDocuments(documents);
        
        for (const doc of chunkedDocs) {
          // 添加包含元数据的文档块，保留来源信息
          pipeline.add(DataType.DOCUMENTS, doc);
          // 添加仅包含文本内容的块，以便后续仅处理 TEXT 类型数据
          pipeline.add(DataType.TEXT, doc.pageContent);
        }
      }
      
      this.setStatus(ChunkNode.Status.COMPLETED);
      // 更新输出管道类型为 文本处理
      pipeline.setPipelineType(PipelineType.TEXT_PROCESSING);
      return pipeline;
    } catch (error) {
      this.setStatus(ChunkNode.Status.FAILED);
      console.error('ChunkNode 执行失败:', error);
      throw error;
    }
  }

  /**
   * @private
   * @description 处理不支持的管道类型，默认抛出错误。
   * @param {Pipeline} pipeline - 输入的管道实例。
   * @throws {Error} 当接收到不支持的管道类型时抛出。
   * @returns {Promise<Pipeline>}
   */
  async _defaultUnsupportedHandler(pipeline) {
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持处理 ${pipelineType} 类型的管道。`);
  }

  /**
   * @description 设置分块尺寸
   * @param {number} size - 分块大小
   */
  setChunkSize(size) {
    this.chunkSize = size;
  }

  /**
   * @description 获取分块尺寸
   * @returns {number} 分块大小
   */
  getChunkSize() {
    return this.chunkSize;
  }

  /**
   * @description 设置分块重叠
   * @param {number} overlap - 分块重叠大小
   */
  setChunkOverlap(overlap) {
    this.chunkOverlap = overlap;
  }

  /**
   * @description 获取分块重叠
   * @returns {number} 分块重叠大小
   */
  getChunkOverlap() {
    return this.chunkOverlap;
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
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
    PipelineType.FILE,
    PipelineType.DOCUMENT_PROCESSING,
    PipelineType.TEXT_PROCESSING
  ],
  // 支持的输出管道类型
  supportedOutputPipelines: [
    PipelineType.TEXT_PROCESSING
  ],
  version: '1.0.0'
};

// 导出节点类
module.exports = ChunkNode; 