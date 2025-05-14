/**
 * @file electron/model/nodes/ChunkNode.js
 * @description 文本分块节点，使用LangChain JS进行文本分块
 */
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PipelineType, DataType } = require('../../config/pipeline');
const BaseNode = require('./baseNode');
const { Status } = require('../../config/nodes');
const Pipeline = require('../pipeline/Pipeline');

class ChunkNode extends BaseNode {
  /**
   * @constructor
   * @description 构造函数
   */
  constructor() {
    super();
  }

  /**
   * @method onInit
   * @description BaseNode 初始化完成后的钩子函数。
   * @async
   */
  async onInit() {
    const workConfig = this.getWorkConfig();
    
    // 初始化文本分块器
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: workConfig.chunkSize || 1000,
      chunkOverlap: workConfig.chunkOverlap || 200,
      separators: workConfig.separators || ["\n\n", "\n", " ", ""]
    });

    this.registerHandler(PipelineType.PROMPT, this._handlePromptForChunking.bind(this));
    this.registerHandler(PipelineType.CUSTOM, this._handleCustomForChunking.bind(this));
  }

  /**
   * @private
   * @method _handlePromptForChunking
   * @description 处理 PROMPT 类型的输入管道以进行分块。
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例。
   * @returns {Promise<Pipeline>} 处理后的 Pipeline 实例。
   * @async
   */
  async _handlePromptForChunking(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING });
    try {
      // 从pipeline获取文本内容
      const textItems = pipeline.getByType(DataType.TEXT);
      if (textItems.length === 0) {
        throw new Error('未找到文本数据，无法进行分块');
      }

      // 创建输出管道
      const outputPipeline = new Pipeline(PipelineType.CHUNK);
      
      // 逐个处理文本
      for (let i = 0; i < textItems.length; i++) {
        const text = textItems[i].data;
        const metadata = textItems[i].metadata || {};
        
        // 使用LangChain分块器进行文本分块
        const chunks = await this.splitter.splitText(text);
        
        // 将分块结果添加到输出管道
        chunks.forEach((chunk, chunkIndex) => {
          outputPipeline.add(DataType.CHUNK, {
            text: chunk,
            metadata: {
              ...metadata,
              chunkIndex,
              originalTextIndex: i,
              totalChunks: chunks.length
            }
          });
        });
      }

      this.updateFlowConfig({ status: Status.COMPLETED });
      return outputPipeline;
    } catch (error) {
      console.error('ChunkNode._handlePromptForChunking 失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message });
      throw error;
    }
  }

  /**
   * @private
   * @method _handleCustomForChunking
   * @description 处理 CUSTOM 类型的输入管道以进行分块。
   * @param {Pipeline} pipeline - 输入的 Pipeline 实例。
   * @returns {Promise<Pipeline>} 处理后的 Pipeline 实例。
   * @async
   */
  async _handleCustomForChunking(pipeline) {
    this.updateFlowConfig({ status: Status.RUNNING });
    try {
      // 从custom pipeline获取可能的文档或文本内容
      const textItems = pipeline.getByType(DataType.TEXT) || [];
      const documents = pipeline.getByType(DataType.DOCUMENT) || [];
      
      if (textItems.length === 0 && documents.length === 0) {
        throw new Error('未找到文本或文档数据，无法进行分块');
      }

      // 创建输出管道
      const outputPipeline = new Pipeline(PipelineType.CHUNK);
      
      // 处理文本项
      for (let i = 0; i < textItems.length; i++) {
        const text = textItems[i].data;
        const metadata = textItems[i].metadata || {};
        
        const chunks = await this.splitter.splitText(text);
        
        chunks.forEach((chunk, chunkIndex) => {
          outputPipeline.add(DataType.CHUNK, {
            text: chunk,
            metadata: {
              ...metadata,
              chunkIndex,
              originalTextIndex: i,
              totalChunks: chunks.length,
              type: 'text'
            }
          });
        });
      }
      
      // 处理文档项
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i].data;
        const content = doc.pageContent || doc.content || doc.text || '';
        const docMetadata = doc.metadata || {};
        
        const chunks = await this.splitter.splitText(content);
        
        chunks.forEach((chunk, chunkIndex) => {
          outputPipeline.add(DataType.CHUNK, {
            text: chunk,
            metadata: {
              ...docMetadata,
              chunkIndex,
              originalDocIndex: i,
              totalChunks: chunks.length,
              type: 'document'
            }
          });
        });
      }

      this.updateFlowConfig({ status: Status.COMPLETED });
      return outputPipeline;
    } catch (error) {
      console.error('ChunkNode._handleCustomForChunking 失败:', error);
      this.updateFlowConfig({ status: Status.FAILED, error: error.message });
      throw error;
    }
  }
}

module.exports = ChunkNode; 