/**
 * @file electron/pipeline/tools/Retrieval.js
 * @description 检索处理工具类
 */

const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const Pipeline = require('../../pipeline/Pipeline');

class RetrievalPipeTools {

    /**
     * 检索管道期望数据体
     */
    static RETRIEVALPIPE = [
        { "type": "text", "data": "..." },
        { "type": "retrieval", "data": [
            { "document": { "pageContent": "...", "metadata": {/*…*/} }, "score": 0.87 },
            { "document": { "pageContent": "...", "metadata": {/*…*/} }, "score": 0.72 }
          ]
        }
    ]

    /**
     * 读取检索数据
     * @param {Pipeline} pipeline - 检索管道实例
     * @returns {Array} 检索数据数组
     */
    static read(pipeline) {
        // 返回所有检索类型的数据项
        const allItems = pipeline.getAll();
        return allItems
            .filter(item => item.type === DataType.RETRIEVAL)
            .map(item => item.data);
    }

    /**
     * 读取用户输入的查询文本
     * @param {Pipeline} pipeline - 检索管道实例
     * @returns {string} 用户输入的查询文本
     */
    static readText(pipeline) {
        return pipeline.getByType(DataType.TEXT);
    }
    
    /**
     * 创建标准检索管道
     * @param {string} queryText - 原始查询文本
     * @param {Array} documents - 检索到的文档数组
     * @returns {Pipeline} 标准格式的检索管道
     */
    static createPipe(queryText, documents = []) {
        const pipe = new Pipeline(PipelineType.RETRIEVAL);
        
        // 添加原始查询文本
        pipe.add(DataType.TEXT, queryText);
        
        // 添加检索结果
        for (const doc of documents) {
            pipe.add(DataType.RETRIEVAL, doc);
        }
        
        return pipe;
    }
    
    /**
     * 格式化检索结果为字符串
     * @param {Pipeline} pipeline - 检索管道实例
     * @param {Object} options - 格式化选项
     * @param {boolean} options.includeMetadata - 是否包含元数据信息，默认false
     * @param {boolean} options.includeScores - 是否包含相似度分数，默认false
     * @returns {string} 格式化后的文本
     */
    static formatAsText(pipeline, options = {}) {
        const { includeMetadata = false, includeScores = false } = options;
        const docs = this.read(pipeline);
        const query = this.readText(pipeline);
        
        let result = `查询: ${query}\n\n检索结果:\n`;
        
        if (!docs || docs.length === 0) {
            return result + "未找到相关文档。";
        }
        
        docs.forEach((doc, index) => {
            result += `\n---文档 ${index + 1}---\n${doc.pageContent}\n`;
            
            if (includeScores && doc.score !== undefined) {
                result += `相关度: ${(doc.score * 100).toFixed(2)}%\n`;
            }
            
            if (includeMetadata && doc.metadata) {
                result += `元数据: ${JSON.stringify(doc.metadata)}\n`;
            }
        });
        
        return result;
    }
}

module.exports = RetrievalPipeTools;
