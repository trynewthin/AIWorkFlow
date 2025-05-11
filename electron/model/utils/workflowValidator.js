/**
 * @module workflowValidator
 * @description 校验工作流配置格式与步骤引用合法性
 */

/**
 * @param {Object} config - 待校验的工作流配置
 * @param {Object} nodeService - 节点服务实例，用于校验nodeName
 * @throws {Error} 配置校验失败时抛出
 */
function validateWorkflowConfig(config, nodeService) {
  if (!config) {
    throw new Error('工作流配置不能为空');
  }
  if (!config.name || typeof config.name !== 'string' || config.name.trim() === '') {
    throw new Error('工作流名称(name)必须为非空字符串');
  }
  if (!config.steps || typeof config.steps !== 'object' || Object.keys(config.steps).length === 0) {
    throw new Error('工作流步骤(steps)必须为非空对象');
  }
  if (!config.startStep || typeof config.startStep !== 'string' || !config.steps[config.startStep]) {
    throw new Error('工作流起始步骤(startStep)必须在步骤(steps)中定义');
  }

  // 对stepsOrder进行校验
  if (config.stepsOrder) {
    if (!Array.isArray(config.stepsOrder)) {
      throw new Error('工作流步骤顺序(stepsOrder)必须是数组');
    }
    
    const stepKeys = new Set(Object.keys(config.steps));
    const stepsOrderSet = new Set(config.stepsOrder);
    
    // 检查stepsOrder是否包含所有步骤
    if (stepKeys.size !== stepsOrderSet.size) {
      throw new Error('工作流步骤顺序(stepsOrder)与步骤数量不一致');
    }
    
    // 检查stepsOrder中是否有不存在的步骤
    for (const stepName of config.stepsOrder) {
      if (!stepKeys.has(stepName)) {
        throw new Error(`工作流步骤顺序(stepsOrder)中包含未定义的步骤: ${stepName}`);
      }
    }
  }

  for (const stepName in config.steps) {
    const stepConfig = config.steps[stepName];
    if (!stepConfig || typeof stepConfig !== 'object') {
      throw new Error(`步骤 '${stepName}' 的配置必须是一个对象`);
    }
    if (stepConfig.name !== stepName) {
      throw new Error(`步骤 '${stepName}' 的配置中的name属性与其键名不一致`);
    }
    if (!stepConfig.nodeName || typeof stepConfig.nodeName !== 'string') {
      throw new Error(`步骤 '${stepName}' 必须包含一个有效的节点名称(nodeName)`);
    }
    // 校验 nodeName 是否在 nodeService 中有效
    if (nodeService && typeof nodeService.getNodeConfigByName === 'function') {
      if (!nodeService.getNodeConfigByName(stepConfig.nodeName)) {
        throw new Error(`步骤 '${stepName}' 的节点 '${stepConfig.nodeName}' 未在节点服务中注册`);
      }
    } else if (nodeService) {
      // 提醒 nodeService 可能未正确传入或方法不存在
      console.warn('[workflowValidator] nodeService 未正确传入或getNodeConfigByName方法不存在，跳过nodeName校验');
    }

    if (!stepConfig.next || !Array.isArray(stepConfig.next)) {
      throw new Error(`步骤 '${stepName}' 必须包含一个下一步(next)数组`);
    }
    // 校验 next 中的步骤是否存在于 workflow.steps
    for (const nextStepName of stepConfig.next) {
      if (!config.steps[nextStepName]) {
        throw new Error(`步骤 '${stepName}' 的下一步 '${nextStepName}' 未在工作流步骤中定义`);
      }
    }

    if (stepConfig.params && typeof stepConfig.params !== 'object') {
        throw new Error(`步骤 '${stepName}' 的参数(params)如果提供，必须是一个对象`);
    }
    if (stepConfig.conditions && typeof stepConfig.conditions !== 'object') {
        throw new Error(`步骤 '${stepName}' 的条件(conditions)如果提供，必须是一个对象`);
    }
  }
}

/**
 * @param {string} workflowName - 工作流名称 (用于错误信息)
 * @param {Object} steps - 当前工作流的所有步骤配置
 * @param {string} nodeName - 步骤中引用的节点名称
 * @param {Object} nodeService - 节点服务实例
 * @throws {Error} 节点名称无效时抛出
 */
function validateStepNode(workflowName, steps, nodeName, nodeService) {
  if (!nodeService || typeof nodeService.getNodeConfigByName !== 'function') {
    // 这是一个内部校验函数，nodeService 应该是可用的
    throw new Error('[validateStepNode] nodeService 无效或方法缺失，无法校验节点');
  }
  if (!nodeService.getNodeConfigByName(nodeName)) {
    throw new Error(`工作流 '${workflowName}' 中的步骤引用的节点 '${nodeName}' 未在节点服务中注册`);
  }
}

/**
 * @param {string} workflowName - 工作流名称 (用于错误信息)
 * @param {Object} steps - 当前工作流的所有步骤配置
 * @param {Array<string>} nextStepNames - 某步骤配置的 next 数组
 * @throws {Error} next 数组中包含无效步骤名时抛出
 */
function validateStepNextLinks(workflowName, steps, nextStepNames) {
  if (!Array.isArray(nextStepNames)) return; // next 不是数组则不校验（由 validateWorkflowConfig 处理）
  for (const nextStepName of nextStepNames) {
    if (!steps[nextStepName]) {
      throw new Error(`工作流 '${workflowName}' 中的步骤引用的下一步 '${nextStepName}' 未在该工作流中定义`);
    }
  }
}

module.exports = {
  validateWorkflowConfig,
  validateStepNode,
  validateStepNextLinks
}; 