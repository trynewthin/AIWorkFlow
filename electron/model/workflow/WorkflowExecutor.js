/**
 * @file WorkflowExecutor.js
 * @description 工作流执行器，负责加载和执行工作流
 */

const { logger } = require('ee-core/log');
const Pipeline = require('../pipeline/Pipeline');
const { getNodeFactory } = require('./NodeFactory');
const WorkflowManager = require('./WorkflowManager');
const { DataType, PipelineType } = require('../../config/pipeline/index');

/**
 * @class WorkflowExecutor
 * @description 工作流执行器，负责加载工作流并按节点顺序执行
 */
class WorkflowExecutor {
  /**
   * @constructor
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    /** @type {WorkflowManager} 工作流管理器 */
    this.workflowManager = options.workflowManager || new WorkflowManager();
    
    /** @type {import('./NodeFactory').NodeFactory} 节点工厂 */
    this.nodeFactory = options.nodeFactory || getNodeFactory();
    
    /** @type {Object} 执行器默认配置 */
    this.defaultConfig = {
      maxSteps: 100,   // 最大执行步数，防止无限循环
      timeout: 30000,  // 执行超时时间 (毫秒)
      failOnError: true // 出错时是否中断执行
    };
  }

  /**
   * @method execute
   * @description 执行指定工作流
   * @param {string} workflowId 工作流ID
   * @param {Pipeline|Object} input 输入数据，Pipeline实例或原始数据
   * @param {Object} [executionOptions={}] 执行选项
   * @returns {Promise<Pipeline>} 执行结果
   */
  async execute(workflowId, input, executionOptions = {}) {
    try {
      // 获取工作流定义
      const workflow = await this.workflowManager.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`工作流不存在: ${workflowId}`);
      }

      // 合并工作流配置和执行选项
      const config = {
        ...this.defaultConfig,
        ...workflow.config,
        ...executionOptions
      };

      // 获取工作流的所有节点
      const nodes = workflow.getSortedNodes();
      if (nodes.length === 0) {
        logger.warn(`[WorkflowExecutor] 工作流 ${workflowId} 没有节点`);
        return this._createInitialPipeline(input);
      }

      // 初始化管道
      let currentPipeline = this._createInitialPipeline(input);
      
      logger.info(`[WorkflowExecutor] 开始执行工作流: ${workflowId}, 节点数量: ${nodes.length}`);

      // 执行每个节点
      for (let i = 0; i < nodes.length && i < config.maxSteps; i++) {
        const node = nodes[i];
        
        try {
          logger.info(`[WorkflowExecutor] 执行节点: ${node.id} (${node.type}), 顺序: ${node.order_index}`);
          
          // 创建并初始化节点实例
          const nodeInstance = await this.nodeFactory.createNode(
            node.type,
            node.flow_config,
            node.work_config
          );
          
          // 执行节点
          const outputPipeline = await nodeInstance.process(currentPipeline);
          
          // 更新当前管道
          currentPipeline = outputPipeline;
          
          logger.info(`[WorkflowExecutor] 节点 ${node.id} 执行完成`);
        } catch (error) {
          logger.error(`[WorkflowExecutor] 节点 ${node.id} 执行失败: ${error.message}`);
          
          if (config.failOnError) {
            throw new Error(`工作流执行中断于节点 ${node.id}: ${error.message}`);
          }
          
          // 如果配置为不中断执行，则继续使用当前管道执行下一个节点
        }
      }
      
      logger.info(`[WorkflowExecutor] 工作流 ${workflowId} 执行完成`);
      return currentPipeline;
    } catch (error) {
      logger.error(`[WorkflowExecutor] 执行工作流失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @private
   * @method _createInitialPipeline
   * @description 根据输入创建初始管道
   * @param {Pipeline|Object|string|null} input - 输入数据
   * @returns {Pipeline} 初始管道
   */
  _createInitialPipeline(input) {
    // 如果输入已经是 Pipeline 实例，直接返回
    if (input && typeof input.getPipelineType === 'function') {
      return input;
    }
    
    // 根据输入类型创建 Pipeline
    if (typeof input === 'string') {
      // 文本输入转为 PROMPT 管道
      return Pipeline.of(PipelineType.PROMPT, DataType.TEXT, input);
    } else if (typeof input === 'object' && input !== null) {
      // 对象输入
      if (Array.isArray(input) && input.length > 0 && input[0].role) {
        // 检测类似 [{ role: 'user', content: '...' }] 的消息数组格式，转为 CHAT 管道
        const pipeline = new Pipeline(PipelineType.CHAT);
        input.forEach(msg => {
          pipeline.add(DataType.TEXT, msg.content);
          pipeline.add(DataType.METADATA, { role: msg.role });
        });
        return pipeline;
      } else {
        // 普通对象转为 CUSTOM 管道
        return Pipeline.of(PipelineType.CUSTOM, DataType.OBJECT, input);
      }
    }
    
    // 默认创建空的 PROMPT 管道
    return new Pipeline(PipelineType.PROMPT);
  }
}

// 导出 WorkflowExecutor 类和一个获取单例的函数
let instance = null;

/**
 * 获取 WorkflowExecutor 单例
 * @param {Object} [options] - 配置选项
 * @returns {WorkflowExecutor} WorkflowExecutor 单例
 */
function getWorkflowExecutor(options = {}) {
  if (!instance) {
    instance = new WorkflowExecutor(options);
  }
  return instance;
}

module.exports = {
  WorkflowExecutor,
  getWorkflowExecutor
}; 