/**
 * @class Step
 * @description 工作流单个步骤模型，对应一个节点的执行
 */
class Step {
  /**
   * @constructor
   * @param {Object} options - 步骤配置选项
   * @param {string} options.name - 步骤名称（用于标识）
   * @param {string} options.nodeName - 对应节点名称
   * @param {Object} options.params - 节点执行参数
   * @param {string[]} options.next - 可能的下一步步骤名称列表
   * @param {Object} options.conditions - 条件映射，决定执行哪个下一步
   */
  constructor(options = {}) {
    this.name = options.name || '';
    this.nodeName = options.nodeName || '';
    this.params = options.params || {};
    this.next = options.next || [];
    this.conditions = options.conditions || {};
    this.status = Step.Status.PENDING;
  }

  /**
   * @method getNodeName
   * @description 获取步骤对应的节点名称
   * @returns {string} 节点名称
   */
  getNodeName() {
    return this.nodeName;
  }

  /**
   * @method getParams
   * @description 获取节点执行参数
   * @returns {Object} 参数对象
   */
  getParams() {
    return this.params;
  }

  /**
   * @method getNextSteps
   * @description 获取可能的下一步列表
   * @returns {string[]} 下一步步骤名称列表
   */
  getNextSteps() {
    return this.next;
  }

  /**
   * @method determineNextStep
   * @description 根据执行结果确定下一步
   * @param {*} result - 节点执行结果
   * @returns {string|null} 下一步步骤名称，如果没有下一步则返回null
   */
  determineNextStep(result) {
    // 如果没有配置下一步，则返回null
    if (!this.next || this.next.length === 0) {
      return null;
    }

    // 如果只有一个下一步且没有条件，直接返回
    if (this.next.length === 1 && Object.keys(this.conditions).length === 0) {
      return this.next[0];
    }

    // 根据条件确定下一步
    for (const [conditionKey, nextStepName] of Object.entries(this.conditions)) {
      try {
        // 使用 Function 构造器替代 eval
        // conditionKey 应该是类似 "result.success === true" 或 "result.value > 10" 的字符串
        // 注意：这里的 result 变量名与函数的参数名一致
        const conditionFunction = new Function('result', `return ${conditionKey};`);
        if (conditionFunction(result)) {
          // 确保条件对应的 nextStepName 存在于 this.next 数组中
          if (this.next.includes(nextStepName)) {
            return nextStepName;
          } else {
            console.warn(`条件 '${conditionKey}' 指向的步骤 '${nextStepName}' 不在步骤的 next 列表中，将忽略此条件。`);
          }
        }
      } catch (error) {
        console.error(`条件评估错误: '${conditionKey}' for result:`, result, error);
      }
    }

    // 如果没有条件匹配或条件评估出错，默认返回第一个下一步
    // (前提是 this.next[0] 必须是一个有效的步骤名，这应由WorkflowConfig校验)
    return this.next[0];
  }

  /**
   * @method setStatus
   * @description 设置步骤状态
   * @param {string} status - 步骤状态
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * @method getStatus
   * @description 获取步骤状态
   * @returns {string} 步骤状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * @method toJSON
   * @description 将步骤序列化为JSON对象
   * @returns {Object} JSON对象
   */
  toJSON() {
    return {
      name: this.name,
      nodeName: this.nodeName,
      params: this.params,
      next: this.next,
      conditions: this.conditions,
      status: this.status
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON对象创建步骤实例
   * @param {Object} json - JSON对象
   * @returns {Step} 步骤实例
   */
  static fromJSON(json) {
    return new Step(json);
  }
}

// 步骤状态枚举
Step.Status = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

module.exports = Step; 