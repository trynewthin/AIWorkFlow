/**
 * @file PipelineFactory.js
 * @description 管道工厂，负责创建管道实例并校验类型
 */

const BasePipeline = require('../models/BasePipeline');
const TextPipeline = require('../models/TextPipeline');
const { isValidPipelineType } = require('../../coreconfigs/services/pipelineConfigService');
const { PipelineType } = require('../../coreconfigs');

/**
 * 管道工厂类，统一管理管道实例的创建
 * @class PipelineFactory
 */
class PipelineFactory {
  /**
   * 创建管道实例
   * @param {string} pipelineType - 管道类型
   * @returns {BasePipeline} 管道实例
   * @throws {Error} 管道类型非法时抛出
   */
  static createPipeline(pipelineType) {
    if (!isValidPipelineType(pipelineType)) {
      throw new Error(`无效的管道类型: ${pipelineType}`);
    }
    if (pipelineType === PipelineType.TEXT) {
      return new TextPipeline(pipelineType);
    }
    return new BasePipeline(pipelineType);
  }
}

module.exports = PipelineFactory; 