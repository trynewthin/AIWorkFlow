/**
 * @file electron/pipeline/tools/Text.js
 * @description 文本处理工具类
 */

const Pipeline = require('../Pipeline');
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');

class TextPipeTools extends Pipeline {

    /**
     * 文本管道期望数据体
     */
    static TEXTPIPE = [{
        type: DataType.TEXT,
        data: null
    }]

    /**
     * 读取文本
     * @param {Pipeline} pipeline - 文本管道实例
     * @returns {string} 文本内容
     */
    static read(pipeline) {
        if (!pipeline || !(pipeline instanceof Pipeline)) {
            throw new Error('参数必须是一个有效的 Pipeline 实例');
        }

        if (pipeline.getPipelineType() !== PipelineType.TEXT) {
            throw new Error('管道类型必须为 TEXT');
        }

        return pipeline.getByType(DataType.TEXT);
    }
    
}

module.exports = TextPipeTools;
