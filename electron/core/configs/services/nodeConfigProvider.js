/**
 * @file electron/core/configs/services/nodeConfigProvider.js
 * @description 提供访问节点配置数据的服务函数
 */

// 从 models 层导入新的 nodeConfigurations 数据结构
const { nodeConfigurations } = require('../models/nodeConfigs');
// 导入 PipelineType 以进行连接校验
const { PipelineType } = require('../models/pipelineTypes');

/**
 * @description 获取所有节点的静态配置
 * @returns {Record<string, object>} 
 */
function getAllClassConfigs() {
  const allClassConfigs = {};
  for (const nodeKey in nodeConfigurations) {
    if (nodeConfigurations[nodeKey].classConfig) {
      allClassConfigs[nodeKey] = nodeConfigurations[nodeKey].classConfig;
    }
  }
  return allClassConfigs;
}

/**
 * @description 获取所有节点的默认流程配置
 * @returns {Record<string, object>} 
 */
function getAllDefaultFlowConfigs() {
  const allDefaultFlowConfigs = {};
  for (const nodeKey in nodeConfigurations) {
    if (nodeConfigurations[nodeKey].defaultFlowConfig) {
      allDefaultFlowConfigs[nodeKey] = nodeConfigurations[nodeKey].defaultFlowConfig;
    }
  }
  return allDefaultFlowConfigs;
}

/**
 * @description 获取所有节点的默认运行时配置
 * @returns {Record<string, object>} 
 */
function getAllDefaultWorkConfigs() {
  const allDefaultWorkConfigs = {};
  for (const nodeKey in nodeConfigurations) {
    if (nodeConfigurations[nodeKey].defaultWorkConfig) {
      allDefaultWorkConfigs[nodeKey] = nodeConfigurations[nodeKey].defaultWorkConfig;
    }
  }
  return allDefaultWorkConfigs;
}

/**
 * @description 根据节点类型 (nodeKey, 例如 'ChatNode') 获取其 classConfig
 * @param {string} nodeKey - 节点的键名 (例如 'ChatNode')
 * @returns {object | undefined}
 */
function getClassConfig(nodeKey) {
  return nodeConfigurations[nodeKey]?.classConfig;
}

/**
 * @description 根据节点类型 (nodeKey) 获取其 defaultFlowConfig
 * @param {string} nodeKey
 * @returns {object | undefined}
 */
function getDefaultFlowConfig(nodeKey) {
  return nodeConfigurations[nodeKey]?.defaultFlowConfig;
}

/**
 * @description 根据节点类型 (nodeKey) 获取其 defaultWorkConfig
 * @param {string} nodeKey
 * @returns {object | undefined}
 */
function getDefaultWorkConfig(nodeKey) {
  return nodeConfigurations[nodeKey]?.defaultWorkConfig;
}

/**
 * @description 检查从源节点到目标节点的连接是否合法
 * @param {string} sourceNodeKey - 源节点的键 (应为 NodeKey 枚举值)
 * @param {string} targetNodeKey - 目标节点的键 (应为 NodeKey 枚举值)
 * @returns {boolean} 如果连接合法则返回 true，否则返回 false
 */
function canConnectNodes(sourceNodeKey, targetNodeKey) {
  const sourceClassConfig = getClassConfig(sourceNodeKey);
  const targetClassConfig = getClassConfig(targetNodeKey);

  if (!sourceClassConfig || !targetClassConfig) {
    // console.warn(`配置未找到，无法检查连接: ${sourceNodeKey} -> ${targetNodeKey}`);
    return false; 
  }

  const sourceOutputs = sourceClassConfig.supportedOutputPipelines;
  const targetInputs = targetClassConfig.supportedInputPipelines;

  if (!Array.isArray(sourceOutputs) || !Array.isArray(targetInputs)) {
    // console.warn(`supportedOutputPipelines 或 supportedInputPipelines 不是数组: ${sourceNodeKey} -> ${targetNodeKey}`);
    return false; 
  }

  // 情况1: 源节点可以输出到任何类型 (ALL)，且目标节点有输入定义
  if (sourceOutputs.includes(PipelineType.ALL) && targetInputs.length > 0) {
    return true;
  }

  // 情况2: 目标节点可以从任何类型输入 (ALL)，且源节点有输出定义
  if (targetInputs.includes(PipelineType.ALL) && sourceOutputs.length > 0) {
    return true;
  }
  
  // 情况4: 检查直接的类型匹配
  for (const outputType of sourceOutputs) {
    if (outputType === PipelineType.ALL) continue; // ALL 类型已在前面处理
    if (targetInputs.includes(outputType)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  getAllClassConfigs,
  getAllDefaultFlowConfigs,
  getAllDefaultWorkConfigs,
  getClassConfig,
  getDefaultFlowConfig,
  getDefaultWorkConfig,
  canConnectNodes
}; 