/**
 * @file nodeConfigProvider.test.js
 * @description nodeConfigProvider 服务测试
 */

const {
  getAllClassConfigs,
  getAllDefaultFlowConfigs,
  getAllDefaultWorkConfigs,
  getClassConfig,
  getDefaultFlowConfig,
  getDefaultWorkConfig,
  canConnectNodes
} = require('../../../electron/core/configs/services/nodeConfigProvider');
const { NodeKey } = require('../../../electron/core/configs/models/enums');

/**
 * @description 测试 nodeConfigProvider 服务
 */
describe('nodeConfigProvider', () => {
  test('getClassConfig、getDefaultFlowConfig 和 getDefaultWorkConfig 应根据 NodeKey 返回配置', () => {
    const classConfig = getClassConfig(NodeKey.CHAT);
    expect(classConfig).toBeDefined();
    const flowConfig = getDefaultFlowConfig(NodeKey.CHAT);
    expect(flowConfig).toBeDefined();
    const workConfig = getDefaultWorkConfig(NodeKey.CHAT);
    expect(workConfig).toBeDefined();
    expect(getClassConfig('InvalidKey')).toBeUndefined();
    expect(getDefaultFlowConfig('InvalidKey')).toBeUndefined();
    expect(getDefaultWorkConfig('InvalidKey')).toBeUndefined();
  });

  test('getAllClassConfigs、getAllDefaultFlowConfigs 和 getAllDefaultWorkConfigs 应返回包含 CHAT 节点配置的对象', () => {
    const allClassConfigs = getAllClassConfigs();
    expect(allClassConfigs).toHaveProperty(NodeKey.CHAT);
    const allFlow = getAllDefaultFlowConfigs();
    expect(allFlow).toHaveProperty(NodeKey.CHAT);
    const allWork = getAllDefaultWorkConfigs();
    expect(allWork).toHaveProperty(NodeKey.CHAT);
  });

  test('canConnectNodes 应正确判断节点之间的连接合法性', () => {
    // StartNode 可以连接到 StartNode
    expect(canConnectNodes(NodeKey.START, NodeKey.START)).toBe(true);
    // ChatNode 到 PromptNode 不合法
    expect(canConnectNodes(NodeKey.CHAT, NodeKey.PROMPT)).toBe(false);
    // StartNode 到 ChatNode 合法
    expect(canConnectNodes(NodeKey.START, NodeKey.CHAT)).toBe(true);
    // ChatNode 到 StartNode 合法
    expect(canConnectNodes(NodeKey.CHAT, NodeKey.START)).toBe(true);
    // MergeNode 输入输出都为空，应返回 false
    expect(canConnectNodes(NodeKey.MERGE, NodeKey.CHAT)).toBe(false);
  });
}); 