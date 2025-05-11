/**
 * @module 工作流服务
 * @description 提供工作流的管理和执行接口
 */
const { Workflow, Engine, getWorkflowConfig } = require('../../model/workflow');
const nodeService = require('../node');
const { logger } = require('ee-core/log');
const deepClone = require('../../model/utils/deepClone');

/**
 * @class WorkflowService
 * @description 工作流服务类，封装工作流相关业务逻辑
 */
class WorkflowService {
  constructor() {
    // 运行中的工作流引擎实例集合
    this.runningEngines = new Map();
  }

  /**
   * @description 获取所有工作流配置列表
   * @returns {Array<Object>} 工作流配置列表
   */
  getWorkflowList() {
    const workflowConfigInstance = getWorkflowConfig();
    const workflowNames = workflowConfigInstance.getWorkflowNames();
    // getWorkflow 已经返回深拷贝，这里对 map 结果的数组进行一次深拷贝
    return deepClone(workflowNames.map(name => {
      const workflow = workflowConfigInstance.getWorkflow(name);
      return {
        name: workflow.name,
        description: workflow.description || '',
        startStep: workflow.startStep,
        stepCount: Object.keys(workflow.steps).length,
        stepsOrder: workflow.stepsOrder // 从深拷贝的 workflow 对象中获取
      };
    }));
  }

  /**
   * @description 根据名称获取工作流详细配置
   * @param {string} name - 工作流名称
   * @returns {Object|null} 工作流配置对象
   */
  getWorkflowConfig(name) {
    // getWorkflowConfig().getWorkflow() 已经返回深拷贝
    return getWorkflowConfig().getWorkflow(name);
  }

  /**
   * @description 创建新工作流配置
   * @param {string} name - 工作流名称
   * @param {Object} config - 工作流配置
   * @returns {boolean} 是否创建成功
   */
  createWorkflow(name, config) {
    const workflowConfigInstance = getWorkflowConfig();
    
    // 确保传入的 name 与 config.name 一致，或以 config.name 为准
    if (config.name && config.name !== name) {
        logger.warn(`创建工作流时提供的名称 "${name}" 与配置中的名称 "${config.name}" 不一致，将使用配置中的名称。`);
        name = config.name;
    } else if (!config.name) {
        config.name = name; // 如果配置中没有name，则使用传入的name
    }

    if (workflowConfigInstance.getWorkflow(name)) {
      logger.warn(`创建工作流失败: 名称 ${name} 已存在`);
      return false;
    }
    
    workflowConfigInstance.addWorkflow(name, config, nodeService);
    logger.info(`工作流 ${name} 创建成功`);
    return true;
  }

  /**
   * @description 更新工作流配置
   * @param {string} name - 工作流名称
   * @param {Object} config - 新的工作流配置
   * @returns {boolean} 是否更新成功
   */
  updateWorkflow(name, config) {
    const workflowConfigInstance = getWorkflowConfig();
    
    if (config.name && config.name !== name) {
        logger.warn(`更新工作流时提供的名称 "${name}" 与配置中的名称 "${config.name}" 不一致，将使用配置中的名称更新。`);
        // 如果要支持重命名，则需要先删除旧的，再添加新的，或者 WorkflowConfig 支持 rename
        // 当前简单处理：只更新名为 name 的工作流内容，config.name 只是用于校验
    } else if (!config.name) {
        config.name = name;
    }

    if (!workflowConfigInstance.getWorkflow(name)) {
      logger.warn(`更新工作流失败: 未找到 ${name}`);
      return false;
    }
    
    workflowConfigInstance.addWorkflow(name, config, nodeService); // addWorkflow 兼具更新功能
    logger.info(`工作流 ${name} 更新成功`);
    return true;
  }

  /**
   * @description 删除工作流配置
   * @param {string} name - 工作流名称
   * @returns {boolean} 是否删除成功
   */
  deleteWorkflow(name) {
    return getWorkflowConfig().removeWorkflow(name);
  }

  /**
   * @description 执行工作流
   * @param {string} name - 工作流名称
   * @param {*} input - 工作流输入数据
   * @returns {Promise<Object>} 包含工作流ID和执行状态的对象
   */
  async executeWorkflow(name, input) {
    try {
      const workflowConfigInstance = getWorkflowConfig(); // 获取 WorkflowConfig 单例
      const wfConfig = workflowConfigInstance.getWorkflow(name); // 从单例获取配置
      if (!wfConfig) {
        throw new Error(`工作流配置 "${name}" 未找到`);
      }
      // 使用 wfConfig (包含 stepsOrder) 创建 Workflow 实例
      const workflow = new Workflow(wfConfig); 
      
      // 使用UUID生成唯一引擎ID
      const engineId = `${name}_${workflowConfigInstance.generateUniqueId()}`;
      const engine = new Engine(workflow, { nodeService });
      
      this._registerEngineEvents(engineId, engine);
      this.runningEngines.set(engineId, engine);
      
      // 定义清理函数
      const cleanupEngine = () => {
        if (this.runningEngines.has(engineId)) {
          // 移除所有事件监听器，避免内存泄漏
          engine.removeAllListeners();
          
          this.runningEngines.delete(engineId);
          logger.info(`工作流引擎 [${engineId}] 已清理.`);
        }
      };

      // 监听完成和错误事件以进行清理
      engine.once('complete', cleanupEngine);
      engine.once('error', cleanupEngine);
      // 考虑到用户可能主动停止工作流，也监听 stop 事件
      engine.once('stop', cleanupEngine); 

      // 异步执行，不等待其完成
      engine.start(input).catch(error => {
        // 此处的 catch 主要是为了记录启动过程中的同步错误，或者如果 start() 本身不是完全异步的。
        // 大部分的执行错误会通过 engine 的 'error' 事件触发。
        logger.error(`工作流引擎启动或执行期间发生意外错误 [${engineId}]: ${error.message}`);
        // 确保即使发生此类错误也尝试清理
        cleanupEngine(); 
      }); // 移除 .finally 以避免与事件监听冲突
      
      return {
        engineId,
        workflowName: name,
        status: engine.getStatus(),
        workflowStatus: workflow.getStatus() // 添加工作流状态
      };
    } catch (error) {
      logger.error(`启动工作流失败 [${name}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * @description 获取工作流执行状态
   * @param {string} engineId - 工作流引擎ID
   * @returns {Object|null} 工作流执行状态信息
   */
  getWorkflowStatus(engineId) {
    const engine = this.runningEngines.get(engineId);
    if (!engine) {
      return null;
    }
    
    return {
      engineId,
      workflowName: engine.workflow.name,
      engineStatus: engine.getStatus(),  // 引擎状态
      workflowStatus: engine.workflow.getStatus(),  // 工作流状态
      currentStep: engine.workflow.currentStepName,
      context: deepClone(engine.getContext())  // 使用统一的deepClone
    };
  }

  /**
   * @description 控制工作流执行
   * @param {string} engineId - 工作流引擎ID
   * @param {string} action - 控制动作：pause, resume, stop
   * @returns {boolean} 操作是否成功
   */
  controlWorkflow(engineId, action) {
    const engine = this.runningEngines.get(engineId);
    if (!engine) {
      return false;
    }
    
    switch (action) {
      case 'pause':
        return engine.pause();
      case 'resume':
        return engine.resume();
      case 'stop':
        return engine.stop();
      default:
        return false;
    }
  }

  /**
   * @description 获取所有正在运行的工作流信息
   * @returns {Array<Object>} 工作流状态信息列表
   */
  getRunningWorkflows() {
    const result = [];
    for (const [engineId, engine] of this.runningEngines.entries()) {
      result.push({
        engineId,
        workflowName: engine.workflow.name,
        engineStatus: engine.getStatus(),  // 引擎状态
        workflowStatus: engine.workflow.getStatus(),  // 工作流状态
        currentStep: engine.workflow.currentStepName,
        // 使用统一的deepClone处理复杂对象
        context: deepClone(engine.getContext()), 
        // workflow.config 包含 stepsOrder
        config: deepClone(engine.workflow.config) 
      });
    }
    
    return result;
  }

  /**
   * @description 注册工作流引擎事件处理
   * @private
   * @param {string} engineId - 工作流引擎ID 
   * @param {Engine} engine - 工作流引擎实例
   */
  _registerEngineEvents(engineId, engine) {
    // 步骤开始事件
    engine.on('stepStart', (data) => {
      logger.info(`工作流步骤开始 [${engineId}] ${data.workflow}.${data.step}`);
    });
    
    // 步骤完成事件
    engine.on('stepComplete', (data) => {
      logger.info(`工作流步骤完成 [${engineId}] ${data.workflow}.${data.step}`);
    });
    
    // 步骤错误事件
    engine.on('stepError', (data) => {
      logger.error(`工作流步骤错误 [${engineId}] ${data.workflow}.${data.step}: ${data.error}`);
    });
    
    // 工作流完成事件 (注意：这里的 complete 是 engine 的，不是 workflow 的)
    engine.on('complete', (data) => {
      logger.info(`工作流引擎执行完成 [${engineId}] ${data.workflow}`);
      // 注意：清理操作已移至 executeWorkflow 中通过 once 监听
    });
    
    // 工作流错误事件
    engine.on('error', (data) => {
      logger.error(`工作流引擎执行错误 [${engineId}] ${data.workflow}: ${data.error}`);
      // 注意：清理操作已移至 executeWorkflow 中通过 once 监听
    });

    // 引擎状态变更事件 (可选)
    engine.on('statusChange', (data) => {
      logger.debug(`工作流引擎状态变更 [${engineId}] ${data.workflow}: ${data.status}`);
    });

    // 用户停止事件 (可选, 如果 engine 触发此事件)
    engine.on('stop', (data) => {
        logger.info(`工作流引擎被停止 [${engineId}] ${data.workflow}`);
        // 注意：清理操作已移至 executeWorkflow 中通过 once 监听
    });
  }

  /**
   * @description 获取工作流的所有步骤
   * @param {string} workflowName - 工作流名称
   * @returns {Object|null} 步骤对象或null
   */
  getSteps(workflowName) {
    const workflowConfig = getWorkflowConfig();
    const steps = workflowConfig.getSteps(workflowName);
    if (!steps) {
      throw new Error(`工作流 "${workflowName}" 不存在或没有步骤`);
    }
    return steps;
  }

  /**
   * @description 向工作流添加新步骤
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 新步骤的名称
   * @param {Object} stepConfig - (包含 nodeName, params, next, conditions)
   * @param {Object} [options] - 可选参数 { after?: string, before?: string }
   * @returns {boolean} 是否成功
   */
  addStep(workflowName, stepName, stepConfig, options = {}) {
    const workflowConfigInstance = getWorkflowConfig();

    // 确保 stepConfig 包含 name，且与 stepName 一致
    if (!stepConfig.name) stepConfig.name = stepName;
    else if (stepConfig.name !== stepName) {
        throw new Error(`添加步骤时提供的步骤名称 "${stepName}" 与步骤配置中的名称 "${stepConfig.name}" 不一致。`);
    }

    // 调用 WorkflowConfig 的 addStep，它内部有更细致的校验
    return workflowConfigInstance.addStep(workflowName, stepName, stepConfig, options, nodeService);
  }

  /**
   * @description 更新工作流中的步骤配置
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 步骤名称
   * @param {Object} newConfig - 新的步骤配置
   * @returns {boolean} 是否成功
   */
  updateStep(workflowName, stepName, newConfig) {
    const workflowConfigInstance = getWorkflowConfig();

    return workflowConfigInstance.updateStep(workflowName, stepName, newConfig, nodeService);
  }

  /**
   * @description 从工作流移除步骤
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 步骤名称
   * @returns {boolean} 是否成功
   */
  removeStep(workflowName, stepName) {
    const workflowConfig = getWorkflowConfig();
    // 校验逻辑已在 model 层处理，此处可直接调用
    return workflowConfig.removeStep(workflowName, stepName);
  }

  /**
   * @description 重新排序工作流中的步骤
   * @param {string} workflowName - 工作流名称
   * @param {string[]} orderedStepNames - 步骤名称的有序数组
   * @returns {boolean} 是否成功
   */
  reorderSteps(workflowName, orderedStepNames) {
    const workflowConfig = getWorkflowConfig();
    // 校验逻辑已在 model 层处理
    return workflowConfig.reorderSteps(workflowName, orderedStepNames);
  }
}

// 创建并导出工作流服务单例
module.exports = new WorkflowService(); 