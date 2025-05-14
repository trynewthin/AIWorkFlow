/**
 * @file pipelineConfigService.test.js
 * @description pipelineConfigService 服务测试
 */

const { isValidPipelineType, getAllPipelineTypes } = require('../../../electron/core/configs/services/pipelineConfigService');
const { PipelineType } = require('../../../electron/core/configs/models/pipelineTypes');

/**
 * @description 测试 pipelineConfigService 服务
 */
describe('pipelineConfigService', () => {
  test('getAllPipelineTypes 应返回所有管道类型', () => {
    const types = getAllPipelineTypes();
    expect(types).toEqual(Object.values(PipelineType));
  });

  test('isValidPipelineType 对有效类型返回 true， 对无效类型返回 false', () => {
    Object.values(PipelineType).forEach(type => {
      expect(isValidPipelineType(type)).toBe(true);
    });
    expect(isValidPipelineType('invalid')).toBe(false);
  });
}); 