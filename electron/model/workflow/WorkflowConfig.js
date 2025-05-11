/**
 * @class WorkflowConfig
 * @description 工作流配置管理，负责定义和获取工作流配置
 */
const { PipelineType } = require('../pipeline/Piptype');
const DataType = require('../pipeline/Datatype');
const { validateWorkflowConfig, validateStepNode, validateStepNextLinks } = require('../utils/workflowValidator');
const deepClone = require('../utils/deepClone');
const { getWorkflowConfigDb } = require('../../database');
const { v4: uuidv4 } = require('uuid');

class WorkflowConfig {
  constructor() {
    // 工作流定义集合
    this.workflows = {};
    // 工作流步骤顺序集合 { workflowName: [stepName1, stepName2, ...] }
    this.stepsOrder = {}; 
    
    // 从数据库加载已保存的工作流配置
    this._loadFromDb();
    
    // 初始化预设工作流配置（仅当不存在时）
    this._initDefaultWorkflows();
  }

  /**
   * @method _loadFromDb
   * @description 从数据库加载工作流配置
   * @private
   */
  _loadFromDb() {
    try {
      const workflowConfigDb = getWorkflowConfigDb();
      const dbConfigs = workflowConfigDb.getAllWorkflowConfigs();
      
      for (const [name, config] of Object.entries(dbConfigs)) {
        // 原地修改this.workflows和this.stepsOrder, 不触发验证和事件
        this.workflows[name] = config;
        this.stepsOrder[name] = config.stepsOrder || Object.keys(config.steps);
      }
    } catch (error) {
      console.error('从数据库加载工作流配置失败:', error);
    }
  }

  /**
   * @method _initDefaultWorkflows
   * @description 初始化默认工作流配置
   * @private
   */
  _initDefaultWorkflows() {
    // 示例工作流：文本到向量的处理流程
    const textToVectorWorkflow = {
      name: 'text_to_vector',
      description: '文本到向量的处理流程',
      steps: {
        'start': { name: 'start', nodeName: 'pipeline-start-node', params: { pipelineType: PipelineType.TEXT_PROCESSING, dataType: DataType.TEXT }, next: ['chunking'] },
        'chunking': { name: 'chunking', nodeName: 'text-to-chunks-lc', params: { chunkSize: 1000, chunkOverlap: 200 }, next: ['embedding'] },
        'embedding': { name: 'embedding', nodeName: 'text-to-embedding-lc', params: { modelName: 'text-embedding-v3' }, next: ['end_vector'] },
        'end_vector': { name: 'end_vector', nodeName: 'pipeline-end-node', params: { dataType: DataType.EMBEDDING }, next: [] }
      },
      startStep: 'start',
      stepsOrder: ['start', 'chunking', 'embedding', 'end_vector'] // 确保stepsOrder也被初始化
    };
    // validateWorkflowConfig需要节点服务实例来验证，这里不传入，后续在service层添加验证
    // 仅当持久化配置不存在时才加载默认工作流
    if (!this.workflows['text_to_vector']) {
      this.workflows['text_to_vector'] = textToVectorWorkflow;
      this.stepsOrder['text_to_vector'] = textToVectorWorkflow.stepsOrder;
    }

    // 示例工作流：问答处理流程
    const qaWorkflow = {
      name: 'qa_workflow',
      description: '问答处理流程',
      steps: {
        'start_qa': { name: 'start_qa', nodeName: 'pipeline-start-node', params: { pipelineType: PipelineType.CHAT, dataType: DataType.TEXT }, next: ['retrieve_docs'] },
        'retrieve_docs': { name: 'retrieve_docs', nodeName: 'text-to-retrieve-hnsw', params: { topK: 5 }, next: ['generate_answer'] },
        'generate_answer': { name: 'generate_answer', nodeName: 'chat-completion-lc', params: {}, next: ['format_answer'] },
        'format_answer': { name: 'format_answer', nodeName: 'pipeline-end-node', params: { dataType: DataType.TEXT }, next: [] }
      },
      startStep: 'start_qa',
      stepsOrder: ['start_qa', 'retrieve_docs', 'generate_answer', 'format_answer'] // 确保stepsOrder也被初始化
    };
    if (!this.workflows['qa_workflow']) {
      this.workflows['qa_workflow'] = qaWorkflow;
      this.stepsOrder['qa_workflow'] = qaWorkflow.stepsOrder;
    }
  }

  /**
   * @method _persistWorkflow
   * @description 将工作流配置持久化到数据库
   * @private
   * @param {string} name - 工作流名称
   * @param {Object} config - 工作流配置
   */
  _persistWorkflow(name, config) {
    try {
      const workflowConfigDb = getWorkflowConfigDb();
      workflowConfigDb.saveWorkflowConfig(name, config);
    } catch (error) {
      console.error(`持久化工作流 ${name} 失败:`, error);
    }
  }

  /**
   * @method getWorkflowNames
   * @description 获取所有工作流名称
   * @returns {string[]} 工作流名称列表
   */
  getWorkflowNames() {
    return Object.keys(this.workflows);
  }

  /**
   * @method getWorkflow
   * @description 获取指定名称的工作流配置
   * @param {string} name - 工作流名称
   * @returns {Object|null} 工作流配置对象
   */
  getWorkflow(name) {
    const workflow = this.workflows[name];
    if (!workflow) return null;
    // 返回深拷贝
    return deepClone({
      ...workflow,
      stepsOrder: [...(this.stepsOrder[name] || Object.keys(workflow.steps))]
    });
  }

  /**
   * @method getAllWorkflows
   * @description 获取所有工作流配置
   * @returns {Object} 所有工作流配置的映射表
   */
  getAllWorkflows() {
    const result = {};
    for (const name in this.workflows) {
      result[name] = this.getWorkflow(name); 
    }
    return result; // getWorkflow已经深拷贝
  }

  /**
   * @method addWorkflow
   * @description 添加或更新工作流配置
   * @param {string} name - 工作流名称
   * @param {Object} config - 工作流配置对象
   * @param {Object} nodeService - 节点服务实例，用于校验节点
   */
  addWorkflow(name, config, nodeService) {
    // 校验工作流配置，确保提供节点服务实例
    if (!nodeService) {
      throw new Error('添加或更新工作流时必须提供节点服务实例');
    }
    validateWorkflowConfig(config, nodeService);
    
    // 确保config.stepsOrder存在，如果不存在则使用steps的键名
    if (!config.stepsOrder || !Array.isArray(config.stepsOrder)) {
      config.stepsOrder = Object.keys(config.steps);
    }
    
    this.workflows[name] = config;
    this.stepsOrder[name] = config.stepsOrder;
    
    // 确保 startStep 是 stepsOrder 的第一个元素，如果不是，调整
    if (this.stepsOrder[name].length > 0 && this.stepsOrder[name][0] !== config.startStep) {
        const startStepIndex = this.stepsOrder[name].indexOf(config.startStep);
        if (startStepIndex > 0) {
            this.stepsOrder[name].splice(startStepIndex, 1);
            this.stepsOrder[name].unshift(config.startStep);
        } else if (config.startStep && !this.stepsOrder[name].includes(config.startStep)) {
            // 如果 startStep 不在当前 order 中但存在于 steps，则将其置于首位
            this.stepsOrder[name].unshift(config.startStep);
        }
    }
    
    // 持久化到数据库
    this._persistWorkflow(name, {
      ...config,
      stepsOrder: this.stepsOrder[name]
    });
  }

  /**
   * @method removeWorkflow
   * @description 移除指定工作流配置
   * @param {string} name - 工作流名称
   * @returns {boolean} 是否成功移除
   */
  removeWorkflow(name) {
    if (this.workflows[name]) {
      delete this.workflows[name];
      // 同时删除stepsOrder
      delete this.stepsOrder[name];
      
      // 从数据库中删除
      try {
        const workflowConfigDb = getWorkflowConfigDb();
        workflowConfigDb.removeWorkflowConfig(name);
      } catch (error) {
        console.error(`从数据库删除工作流 ${name} 失败:`, error);
      }
      
      return true;
    }
    return false;
  }

  /**
   * @method getSteps
   * @description 获取指定工作流的所有步骤配置
   * @param {string} workflowName - 工作流名称
   * @returns {Object|null} 步骤配置对象，键为步骤名称，值为步骤配置；如果工作流不存在则返回 null
   */
  getSteps(workflowName) {
    const workflow = this.getWorkflow(workflowName); // getWorkflow 已经返回深拷贝
    return workflow ? workflow.steps : null; // steps 也是深拷贝的一部分
  }

  /**
   * @method addStep
   * @description 向指定工作流中添加新步骤
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 新步骤的名称
   * @param {Object} stepConfig - 新步骤的配置 (包含 nodeName, params, next, conditions)
   * @param {Object} [options] - 可选参数
   * @param {string} [options.after] - 将新步骤插入到此步骤之后
   * @param {string} [options.before] - 将新步骤插入到此步骤之前
   * @param {Object} nodeService - 节点服务实例，用于校验节点
   * @returns {boolean} 是否成功添加
   * @throws {Error} 如果工作流不存在、步骤名已存在、nodeName 无效或 next 步骤不存在
   */
  addStep(workflowName, stepName, stepConfig, options = {}, nodeService) {
    if (!this.workflows[workflowName]) {
      throw new Error(`工作流 "${workflowName}" 不存在`);
    }
    const targetWorkflow = this.workflows[workflowName];
    const targetStepsOrder = this.stepsOrder[workflowName];

    if (targetWorkflow.steps[stepName]) {
      throw new Error(`工作流 "${workflowName}" 中已存在名为 "${stepName}" 的步骤`);
    }
    
    if (nodeService) {
      validateStepNode(workflowName, targetWorkflow.steps, stepConfig.nodeName, nodeService);
      validateStepNextLinks(workflowName, targetWorkflow.steps, stepConfig.next);
    }

    targetWorkflow.steps[stepName] = { name: stepName, ...stepConfig };

    // 更新 stepsOrder
    if (options.after && targetStepsOrder.includes(options.after)) {
      const index = targetStepsOrder.indexOf(options.after);
      targetStepsOrder.splice(index + 1, 0, stepName);
    } else if (options.before && targetStepsOrder.includes(options.before)) {
      const index = targetStepsOrder.indexOf(options.before);
      targetStepsOrder.splice(index, 0, stepName);
    } else {
      targetStepsOrder.push(stepName); // 默认添加到末尾
    }
    
    if (targetStepsOrder.length === 1 && (!targetWorkflow.startStep || !targetWorkflow.steps[targetWorkflow.startStep])) {
        targetWorkflow.startStep = stepName;
    }
    // 如果 startStep 不是 order 的第一个，修正它 (理论上 addStep 后 startStep 应有效且在 order 中)
    if (targetWorkflow.startStep && targetStepsOrder[0] !== targetWorkflow.startStep) {
        const idx = targetStepsOrder.indexOf(targetWorkflow.startStep);
        if (idx > 0) {
            targetStepsOrder.splice(idx, 1);
            targetStepsOrder.unshift(targetWorkflow.startStep);
        }
    }
    
    // 持久化更新
    this._persistWorkflow(workflowName, {
      ...targetWorkflow,
      stepsOrder: targetStepsOrder
    });

    return true;
  }

  /**
   * @method updateStep
   * @description 更新工作流中指定步骤的配置
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 要更新的步骤名称
   * @param {Object} newConfig - 新的步骤配置 (nodeName, params, next, conditions 可选更新)
   * @param {Object} nodeService - 节点服务实例，用于校验节点
   * @returns {boolean} 是否成功更新
   * @throws {Error} 如果工作流或步骤不存在
   */
  updateStep(workflowName, stepName, newConfig, nodeService) {
    if (!this.workflows[workflowName]) {
      throw new Error(`工作流 "${workflowName}" 不存在`);
    }
    if (!this.workflows[workflowName].steps[stepName]) {
      throw new Error(`工作流 "${workflowName}" 中步骤 "${stepName}" 不存在`);
    }
    
    if (nodeService) {
      // 校验 newConfig.nodeName (如果提供)
      if (newConfig.nodeName) {
        validateStepNode(workflowName, this.workflows[workflowName].steps, newConfig.nodeName, nodeService);
      }
      // 校验 newConfig.next (如果提供)
      if (newConfig.next) {
        validateStepNextLinks(workflowName, this.workflows[workflowName].steps, newConfig.next);
      }
    }

    this.workflows[workflowName].steps[stepName] = { 
      ...this.workflows[workflowName].steps[stepName], 
      ...newConfig 
    };
    
    // 持久化更新
    this._persistWorkflow(workflowName, {
      ...this.workflows[workflowName],
      stepsOrder: this.stepsOrder[workflowName]
    });
    
    return true;
  }

  /**
   * @method removeStep
   * @description 从工作流中移除指定步骤
   * @param {string} workflowName - 工作流名称
   * @param {string} stepName - 要移除的步骤名称
   * @returns {boolean} 是否成功移除
   * @throws {Error} 如果工作流或步骤不存在
   */
  removeStep(workflowName, stepName) {
    const workflow = this.workflows[workflowName];
    const currentStepsOrder = this.stepsOrder[workflowName];

    if (!workflow) {
      throw new Error(`工作流 "${workflowName}" 不存在`);
    }
    if (!workflow.steps[stepName]) {
      throw new Error(`工作流 "${workflowName}" 中步骤 "${stepName}" 不存在`);
    }

    delete workflow.steps[stepName];
    // 从 stepsOrder 中移除
    const index = currentStepsOrder.indexOf(stepName);
    if (index > -1) {
      currentStepsOrder.splice(index, 1);
    }

    if (workflow.startStep === stepName) {
      workflow.startStep = currentStepsOrder.length > 0 ? currentStepsOrder[0] : null;
    }
    
    for (const sName in workflow.steps) {
        const step = workflow.steps[sName];
        if (step.next && step.next.includes(stepName)) {
            step.next = step.next.filter(n => n !== stepName);
        }
    }
    
    // 持久化更新
    this._persistWorkflow(workflowName, {
      ...workflow,
      stepsOrder: currentStepsOrder
    });
    
    return true;
  }
  
  /**
   * @method reorderSteps
   * @description 重新排序工作流中的步骤 (简单示例，可能需要更完善的实现)
   * @param {string} workflowName - 工作流名称
   * @param {string[]} orderedStepNames - 步骤名称的有序数组
   * @returns {boolean} 是否成功
   * @throws {Error} 如果工作流不存在或步骤名称不匹配
   */
  reorderSteps(workflowName, orderedStepNames) {
    const workflow = this.workflows[workflowName];
    if (!workflow) {
      throw new Error(`工作流 "${workflowName}" 不存在`);
    }

    const currentStepNamesSet = new Set(Object.keys(workflow.steps));
    const orderedStepNamesSet = new Set(orderedStepNames);

    if (orderedStepNames.length !== currentStepNamesSet.size || 
        !orderedStepNames.every(name => currentStepNamesSet.has(name)) ||
        !Object.keys(workflow.steps).every(name => orderedStepNamesSet.has(name))) {
      throw new Error('提供的步骤名称与现有步骤不匹配、数量不一致或包含未知步骤');
    }
    
    this.stepsOrder[workflowName] = [...orderedStepNames]; // 直接使用新的顺序

    // 更新 startStep，确保它是 order 的第一个
    if (this.stepsOrder[workflowName].length > 0) {
        const newStartStep = this.stepsOrder[workflowName][0];
        if (workflow.steps[newStartStep]) { // 再次确认新的 startStep 仍然有效
             workflow.startStep = newStartStep;
        } else {
            // 理论上不应发生，因为上面已经校验过所有名称都存在于 currentStepNamesSet
            // 但作为保险，如果新的第一个步骤无效，则尝试找 order 中第一个有效的，或清空
            workflow.startStep = this.stepsOrder[workflowName].find(s => workflow.steps[s]) || null;
        }
    } else {
        workflow.startStep = null; // 如果排序后为空，则无 startStep
    }
    
    // 持久化更新
    this._persistWorkflow(workflowName, {
      ...workflow,
      stepsOrder: this.stepsOrder[workflowName]
    });

    return true; 
  }

  /**
   * @method getStepsByNodeName
   * @description 根据节点名称获取所有使用该节点的步骤
   * @param {string} nodeName - 节点名称
   * @returns {Object[]} 使用该节点的步骤列表
   */
  getStepsByNodeName(nodeName) {
    const result = [];
    
    for (const [workflowName, workflow] of Object.entries(this.workflows)) {
      const { steps } = workflow;
      
      for (const [stepName, step] of Object.entries(steps)) {
        if (step.nodeName === nodeName) {
          result.push({
            workflowName,
            stepName,
            ...step
          });
        }
      }
    }
    
    return result;
  }

  /**
   * @method generateUniqueId
   * @description 生成全局唯一的工作流ID
   * @returns {string} 唯一ID
   */
  generateUniqueId() {
    return uuidv4();
  }

  /**
   * @method getInstance
   * @description 获取WorkflowConfig单例实例
   * @returns {WorkflowConfig} 单例实例
   */
  static getInstance() {
    if (!WorkflowConfig._instance) {
      WorkflowConfig._instance = new WorkflowConfig();
    }
    return WorkflowConfig._instance;
  }
}

// 单例实例
WorkflowConfig._instance = null;

// 导出实例获取函数
function getWorkflowConfig() {
  return WorkflowConfig.getInstance();
}

module.exports = {
  WorkflowConfig,
  getWorkflowConfig
}; 