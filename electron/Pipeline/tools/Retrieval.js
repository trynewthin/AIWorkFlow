/**
 * @file electron/pipeline/tools/Retrieval.js
 * @description 检索处理工具类
 */

const { Pipeline, DataType } = require('../../coreconfigs/models/pipelineTypes');
const { Pipeline } = require('../../coreconfigs/models/pipelineTypes');

class RetrievalPipeTools extends Pipeline {

    /**
     * 检索管道期望数据体
     */
    static RETRIEVALPIPE = [
        { "type": "text",      "data": "用户输入的查询文本" },
        { "type": "retrieval", "data": [
            { "document": { "pageContent": "...", "metadata": {/*…*/} }, "score": 0.87 },
            { "document": { "pageContent": "...", "metadata": {/*…*/} }, "score": 0.72 }
          ]
        }
    ]

    /**
     * 读取检索数据
     * @param {Pipeline} pipeline - 检索管道实例
     * @returns {Array} 检索数据
     */
    static read(pipeline) {
        return pipeline.getByType(DataType.RETRIEVAL);
    }

    /**
     * 读取用户输入的查询文本
     * @param {Pipeline} pipeline - 检索管道实例
     * @returns {string} 用户输入的查询文本
     */
    static readText(pipeline) {
        return pipeline.getByType(DataType.TEXT);
    }
    
}

module.exports = RetrievalPipeTools;
