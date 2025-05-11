/**
 * @class Engine
 * @description 工作流执行引擎，负责调度和执行工作流中的各个步骤
 */
const { EventEmitter } = require('events');
const Workflow = require('./Workflow');
const Step = require('./Step');

class Engine extends EventEmitter {
  /**
   * @constructor
   * @param {Workflow} workflow - 待执行的工作流实例
   * @param {Object} options - 引擎配置选项
   * @param {Object} options.nodeService - 节点服务实例，用于创建节点实例
   */
  constructor(workflow, options = {}) {
    super();
    
    if (!workflow || !(workflow instanceof Workflow)) {
      throw new Error('必须提供有效的工作流实例');
    }

    // 工作流实例
    this.workflow = workflow;
    
    // 节点服务实例，通过它创建节点实例
    this.nodeService = options.nodeService;
    if (!this.nodeService) {
      throw new Error('必须提供节点服务实例');
    }
    
    // 执行状态
    this.status = Engine.Status.IDLE;
    
    // 当前执行上下文（保存执行过程中的共享数据）
    this.context = {
      input: null,     // 输入数据
      output: null,    // 当前输出
      stepResults: {}  // 各步骤结果的映射表
    };
    
    // 取消标志
    this._cancelRequested = false;
  }

  /**
   * @method start
   * @description 从工作流的起始步骤开始执行
   * @param {*} input - 工作流输入数据
   * @returns {Promise<Object>} 工作流执行结果
   */
  async start(input) {
    if (this.status === Engine.Status.RUNNING) {
      throw new Error('工作流引擎已在运行中');
    }
    
    try {
      // 重置引擎状态
      this._reset();
      
      // 设置输入数据
      this.context.input = input;
      
      // 更新状态为运行中
      this._setStatus(Engine.Status.RUNNING);
      
      // 触发开始事件
      this.emit('start', { workflow: this.workflow.name });
      
      // 获取并执行当前步骤，直到完成或出错
      const result = await this._executeWorkflow();
      
      // 如果执行成功完成，设置状态为已完成
      if (this.status !== Engine.Status.FAILED) {
        this._setStatus(Engine.Status.COMPLETED);
      }
      
      // 触发完成事件
      this.emit('complete', { 
        workflow: this.workflow.name, 
        result 
      });
      
      return result;
    } catch (error) {
      // 设置状态为失败
      this._setStatus(Engine.Status.FAILED);
      
      // 触发错误事件
      this.emit('error', { 
        workflow: this.workflow.name, 
        error: error.message, 
        stack: error.stack 
      });
      
      throw error;
    }
  }

  /**
   * @method pause
   * @description 暂停当前执行
   * @returns {boolean} 是否成功暂停
   */
  pause() {
    if (this.status !== Engine.Status.RUNNING) {
      return false;
    }
    
    this._setStatus(Engine.Status.PAUSED);
    this.emit('pause', { workflow: this.workflow.name });
    return true;
  }

  /**
   * @method resume
   * @description 恢复执行
   * @returns {boolean} 是否成功恢复
   */
  resume() {
    if (this.status !== Engine.Status.PAUSED) {
      return false;
    }
    
    this._setStatus(Engine.Status.RUNNING);
    this.emit('resume', { workflow: this.workflow.name });
    return true;
  }

  /**
   * @method stop
   * @description 停止执行
   * @returns {boolean} 是否成功停止
   */
  stop() {
    if (this.status !== Engine.Status.RUNNING && this.status !== Engine.Status.PAUSED) {
      return false;
    }
    
    this._cancelRequested = true;
    this._setStatus(Engine.Status.STOPPED);
    this.emit('stop', { workflow: this.workflow.name });
    return true;
  }

  /**
   * @method getStatus
   * @description 获取引擎当前状态
   * @returns {string} 引擎状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * @method getContext
   * @description 获取当前执行上下文
   * @returns {Object} 执行上下文
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * @method _executeWorkflow
   * @description 执行工作流的核心逻辑
   * @private
   * @returns {Promise<Object>} 工作流执行结果
   */
  async _executeWorkflow() {
    let result = null;
    
    // 从起始步骤开始执行
    let currentStep = this.workflow.getCurrentStep();
    
    // 循环执行，直到没有下一步或者被取消
    while (currentStep && !this._cancelRequested) {
      // 等待状态为 RUNNING，处理暂停逻辑
      await this._waitForRunningStatus();
      
      if (this._cancelRequested) {
        break;
      }

      try {
        // 执行当前步骤
        const stepResult = await this._executeStep(currentStep);
        
        // 保存步骤结果
        this.context.stepResults[currentStep.name] = stepResult;
        this.context.output = stepResult; // 更新当前输出
        
        // 根据结果确定下一步
        const nextStepName = currentStep.determineNextStep(stepResult);
        
        if (nextStepName) {
          // 移动到下一步
          const moveSuccess = this.workflow.moveToNext(nextStepName);
          if (!moveSuccess) {
            throw new Error(`无法移动到下一步: ${nextStepName}`);
          }
          currentStep = this.workflow.getCurrentStep();
        } else {
          // 工作流正常结束，没有下一步
          break;
        }
      } catch (error) {
        // 设置步骤状态为失败
        currentStep.setStatus(Step.Status.FAILED);
        
        // 触发步骤错误事件
        this.emit('stepError', {
          workflow: this.workflow.name,
          step: currentStep.name,
          error: error.message
        });
        
        // 抛出错误终止执行
        throw error;
      }
    }
    
    // 如果因为取消而退出循环
    if (this._cancelRequested) {
      this._setStatus(Engine.Status.STOPPED);
      return this.context.output;
    }
    
    // 正常完成
    return this.context.output;
  }

  /**
   * @method _executeStep
   * @description 执行单个工作流步骤
   * @private
   * @param {Step} step - 待执行的步骤实例
   * @returns {Promise<*>} 步骤执行结果
   */
  async _executeStep(step) {
    // 更新步骤状态为运行中
    step.setStatus(Step.Status.RUNNING);
    
    // 触发步骤开始事件
    this.emit('stepStart', {
      workflow: this.workflow.name,
      step: step.name
    });
    
    try {
      // 获取节点名称和参数
      const nodeName = step.getNodeName();
      const params = step.getParams();
      
      // 使用节点服务创建节点实例
      const nodeInstance = this.nodeService.createNodeInstance(nodeName, params);
      
      // 确定输入数据（默认使用上一步输出或原始输入）
      const input = this.context.output !== null 
        ? this.context.output 
        : this.context.input;
      
      // 执行节点处理逻辑
      const result = await nodeInstance.process(input);
      
      // 更新步骤状态为已完成
      step.setStatus(Step.Status.COMPLETED);
      
      // 触发步骤完成事件
      this.emit('stepComplete', {
        workflow: this.workflow.name,
        step: step.name,
        result
      });
      
      return result;
    } catch (error) {
      // 更新步骤状态为失败
      step.setStatus(Step.Status.FAILED);
      
      // 触发步骤错误事件
      this.emit('stepError', {
        workflow: this.workflow.name,
        step: step.name,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * @method _waitForRunningStatus
   * @description 等待引擎状态变为 RUNNING
   * @private
   * @returns {Promise<void>}
   */
  async _waitForRunningStatus() {
    // 如果已经是 RUNNING 状态，立即返回
    if (this.status === Engine.Status.RUNNING) {
      return;
    }
    
    // 如果不是 PAUSED 状态，则无需等待
    if (this.status !== Engine.Status.PAUSED) {
      return;
    }
    
    // 创建 Promise，在状态变为 RUNNING 时解析
    return new Promise((resolve) => {
      const checkStatus = () => {
        if (this.status === Engine.Status.RUNNING || this._cancelRequested) {
          resolve();
        } else {
          setTimeout(checkStatus, 100); // 每100ms检查一次状态
        }
      };
      
      checkStatus();
    });
  }

  /**
   * @method _setStatus
   * @description 设置引擎状态
   * @private
   * @param {string} status - 新状态
   */
  _setStatus(status) {
    this.status = status;
    this.workflow.setStatus(this._mapEngineStatusToWorkflowStatus(status));
    
    // 触发状态变更事件
    this.emit('statusChange', {
      workflow: this.workflow.name,
      status
    });
  }

  /**
   * @method _mapEngineStatusToWorkflowStatus
   * @description 将引擎状态映射到工作流状态
   * @private
   * @param {string} engineStatus - 引擎状态
   * @returns {string} 工作流状态
   */
  _mapEngineStatusToWorkflowStatus(engineStatus) {
    const statusMap = {
      [Engine.Status.IDLE]: Workflow.Status.READY,
      [Engine.Status.RUNNING]: Workflow.Status.RUNNING,
      [Engine.Status.PAUSED]: Workflow.Status.PAUSED,
      [Engine.Status.COMPLETED]: Workflow.Status.COMPLETED,
      [Engine.Status.FAILED]: Workflow.Status.FAILED,
      [Engine.Status.STOPPED]: Workflow.Status.STOPPED
    };
    
    return statusMap[engineStatus] || Workflow.Status.READY;
  }

  /**
   * @method _reset
   * @description 重置引擎状态和上下文
   * @private
   */
  _reset() {
    this.status = Engine.Status.IDLE;
    this._cancelRequested = false;
    this.context = {
      input: null,
      output: null,
      stepResults: {}
    };
    this.workflow.reset();
  }
}

// 引擎状态枚举
Engine.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STOPPED: 'stopped'
};

module.exports = Engine; 