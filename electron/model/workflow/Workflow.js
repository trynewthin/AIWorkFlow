/**
 * @class Workflow
 * @description 根据工作流配置构建和管理工作流实例
 */
const Step = require('./Step');
const { getWorkflowConfig } = require('./WorkflowConfig');

class Workflow {
  /**
   * @constructor
   * @param {string|Object} source - 工作流名称或工作流配置对象
   * @throws {Error} 未找到指定工作流时抛出
   */
  constructor(source) {
    // 工作流配置（从名称获取或直接使用对象）
    this.config = typeof source === 'string'
      ? getWorkflowConfig().getWorkflow(source)
      : source;

    if (!this.config) {
      throw new Error(`未找到工作流: ${source}`);
    }

    // 工作流基本信息
    this.name = this.config.name;
    this.description = this.config.description || '';
    
    // 初始化步骤集合
    this.steps = {};
    this._initSteps();
    
    // 当前步骤
    this.currentStepName = this.config.startStep;
    
    // 工作流执行状态
    this.status = Workflow.Status.READY;
    
    // 历史记录
    this.history = [];
  }

  /**
   * @method _initSteps
   * @description 初始化工作流中的所有步骤
   * @private
   */
  _initSteps() {
    const { steps } = this.config;
    
    for (const [stepName, stepConfig] of Object.entries(steps)) {
      this.steps[stepName] = new Step(stepConfig);
    }
  }

  /**
   * @method getCurrentStep
   * @description 获取当前步骤实例
   * @returns {Step|null} 当前步骤实例
   */
  getCurrentStep() {
    return this.currentStepName ? this.steps[this.currentStepName] : null;
  }

  /**
   * @method getStepByName
   * @description 根据名称获取步骤实例
   * @param {string} stepName - 步骤名称
   * @returns {Step|null} 步骤实例
   */
  getStepByName(stepName) {
    return this.steps[stepName] || null;
  }

  /**
   * @method moveToNext
   * @description 移动到指定的下一步
   * @param {string} nextStepName - 下一步名称
   * @returns {boolean} 是否成功移动
   */
  moveToNext(nextStepName) {
    const currentStep = this.getCurrentStep();
    
    // 如果没有当前步骤，无法移动
    if (!currentStep) {
      return false;
    }
    
    // 检查下一步是否为当前步骤的可能下一步
    const possibleNextSteps = currentStep.getNextSteps();
    if (!possibleNextSteps.includes(nextStepName)) {
      return false;
    }
    
    // 记录当前步骤到历史
    this.history.push({
      stepName: this.currentStepName,
      status: currentStep.getStatus(),
      timestamp: Date.now()
    });
    
    // 更新当前步骤
    this.currentStepName = nextStepName;
    
    return true;
  }

  /**
   * @method reset
   * @description 重置工作流到初始状态
   */
  reset() {
    // 重置所有步骤状态
    for (const step of Object.values(this.steps)) {
      step.setStatus(Step.Status.PENDING);
    }
    
    // 重置当前步骤
    this.currentStepName = this.config.startStep;
    
    // 重置状态和历史
    this.status = Workflow.Status.READY;
    this.history = [];
  }

  /**
   * @method setStatus
   * @description 设置工作流状态
   * @param {string} status - 工作流状态
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * @method getStatus
   * @description 获取工作流状态
   * @returns {string} 工作流状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * @method getHistory
   * @description 获取工作流执行历史
   * @returns {Array} 历史记录数组
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * @method toJSON
   * @description 将工作流序列化为JSON对象
   * @returns {Object} JSON对象
   */
  toJSON() {
    const stepsJson = {};
    for (const [name, step] of Object.entries(this.steps)) {
      stepsJson[name] = step.toJSON();
    }
    
    return {
      name: this.name,
      description: this.description,
      steps: stepsJson,
      currentStepName: this.currentStepName,
      status: this.status,
      history: this.history
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON对象创建工作流实例
   * @param {Object} json - JSON对象
   * @returns {Workflow} 工作流实例
   */
  static fromJSON(json) {
    // 创建基本工作流实例
    const workflow = new Workflow({
      name: json.name,
      description: json.description,
      steps: {}, // 稍后填充
      startStep: json.currentStepName
    });
    
    // 填充步骤
    for (const [name, stepJson] of Object.entries(json.steps)) {
      workflow.steps[name] = Step.fromJSON(stepJson);
    }
    
    // 恢复状态和历史
    workflow.status = json.status;
    workflow.history = json.history || [];
    
    return workflow;
  }
}

// 工作流状态枚举
Workflow.Status = {
  READY: 'ready',         // 工作流已准备好，等待执行
  RUNNING: 'running',       // 工作流正在执行
  PAUSED: 'paused',        // 工作流已暂停
  COMPLETED: 'completed',   // 工作流执行完成
  FAILED: 'failed',        // 工作流执行失败
  STOPPED: 'stopped'        // 工作流被用户停止 (新增)
};

module.exports = Workflow; 