/**
 * @file WorkflowExecutor.js
 * @description 工作流执行器，负责加载和执行工作流
 */

const { logger } = require('ee-core/log');
const Pipeline = require('../../pipeline/Pipeline'); // Adjusted path
const { getNodeFactory } = require('../../node/services/NodeFactory'); // Adjusted path
const { getWorkflowManager } = require('./WorkflowManager'); // Will be in the same 'models' directory
const { DataType, PipelineType } = require('../../coreconfigs'); // 指向 electron/core/configs/index.js
const { NodeKey } = require('../../coreconfigs/models/enums'); // 添加导入 NodeKey 枚举

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
    this.workflowManager = options.workflowManager || getWorkflowManager();
    
    /** @type {import('../../node/services/NodeFactory').NodeFactory} 节点工厂 */ // Adjusted path for import type
    this.nodeFactory = options.nodeFactory || getNodeFactory();
    
    /** @type {Object} 执行器默认配置 */
    this.defaultConfig = {
      maxSteps: 100,   // 最大执行步数，防止无限循环
      timeout: 30000,  // 执行超时时间 (毫秒)
      failOnError: true, // 出错时是否中断执行
      validateStartEnd: true, // 是否校验首尾节点类型
      recordConversation: false, // 是否记录对话
      recordNodeExecution: false, // 是否记录节点执行过程
      recordIntermediateResults: false // 是否记录中间结果
    };
  }

  /**
   * @method validateWorkflowNodes
   * @description 校验工作流节点，确保第一个节点是开始节点，最后一个节点是结束节点
   * @param {Array} nodes - 排序后的节点列表
   * @throws {Error} 如果校验不通过，抛出错误
   */
  validateWorkflowNodes(nodes) {
    if (!nodes || nodes.length < 2) {
      throw new Error('工作流必须至少包含开始节点和结束节点');
    }

    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    // 检查第一个节点是否为开始节点
    if (firstNode.type.toLowerCase() !== NodeKey.START.toLowerCase()) {
      throw new Error(`工作流必须以开始节点(${NodeKey.START})开始，当前首节点类型: ${firstNode.type}`);
    }

    // 检查最后一个节点是否为结束节点
    if (lastNode.type.toLowerCase() !== NodeKey.END.toLowerCase()) {
      throw new Error(`工作流必须以结束节点(${NodeKey.END})结束，当前尾节点类型: ${lastNode.type}`);
    }
  }

  /**
   * @method execute
   * @description 执行指定工作流
   * @param {string} workflowId 工作流ID
   * @param {Pipeline|Object} input 输入数据，Pipeline实例或原始数据
   * @param {Object} [executionOptions={}] 执行选项
   * @param {boolean} [executionOptions.recordConversation=false] 是否记录对话
   * @param {string} [executionOptions.conversationId] 对话轮次ID
   * @param {boolean} [executionOptions.recordNodeExecution=false] 是否记录节点执行过程
   * @param {boolean} [executionOptions.recordIntermediateResults=false] 是否记录中间结果
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

      // 校验工作流节点
      if (config.validateStartEnd) {
        try {
          this.validateWorkflowNodes(nodes);
        } catch (error) {
          logger.error(`[WorkflowExecutor] 工作流 ${workflowId} 校验失败: ${error.message}`);
          throw error;
        }
      }

      // 初始化管道
      let currentPipeline = this._createInitialPipeline(input);
      
      logger.info(`[WorkflowExecutor] 开始执行工作流: ${workflowId}, 节点数量: ${nodes.length}`);

      // 获取对话服务（如果需要记录对话）
      let conversationService = null;
      if (config.recordConversation && config.conversationId) {
        try {
          conversationService = require('../../workflow/services/ConversationService').getConversationService();
        } catch (error) {
          logger.warn(`[WorkflowExecutor] 无法加载对话服务: ${error.message}`);
        }
      }

      // 执行每个节点
      for (let i = 0; i < nodes.length && i < config.maxSteps; i++) {
        const node = nodes[i];
        
        try {
          logger.info(`[WorkflowExecutor] 执行节点: ${node.id} (${node.type}), 顺序: ${node.order_index}`);
          
          // 记录节点执行开始
          if (conversationService && config.recordNodeExecution) {
            await conversationService.addSystemMessage(
              config.conversationId, 
              `开始执行节点: ${node.type} (${node.id})`
            );
          }
          
          // 创建并初始化节点实例
          const nodeInstance = await this.nodeFactory.createNode(
            node.type,
            node.flow_config,
            node.work_config
          );
          
          // 执行节点
          const outputPipeline = await nodeInstance.process(currentPipeline);
          
          // 记录中间结果
          if (conversationService && config.recordIntermediateResults) {
            const outputContent = this._formatPipelineForLogging(outputPipeline);
            await conversationService.addSystemMessage(
              config.conversationId, 
              `节点 ${node.id} (${node.type}) 输出:\n${outputContent}`
            );
          }
          
          // 更新当前管道
          currentPipeline = outputPipeline;
          
          // 记录节点执行完成
          if (conversationService && config.recordNodeExecution) {
            await conversationService.addSystemMessage(
              config.conversationId, 
              `节点 ${node.id} (${node.type}) 执行完成`
            );
          }
          
          logger.info(`[WorkflowExecutor] 节点 ${node.id} 执行完成`);
        } catch (error) {
          logger.error(`[WorkflowExecutor] 节点 ${node.id} 执行失败: ${error.message}`);
          
          // 记录错误
          if (conversationService) {
            await conversationService.addSystemMessage(
              config.conversationId, 
              `节点 ${node.id} (${node.type}) 执行错误: ${error.message}`
            );
          }
          
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
    if (input !== null && typeof input === 'object') {
      const keys = Object.keys(input);
      console.log(`WorkflowExecutor._createInitialPipeline: 输入`,input);
      return Pipeline.of(PipelineType.CUSTOM, DataType.ANY, input[keys[0]]);
    }

    return Pipeline.of(PipelineType.CUSTOM, DataType.ANY, input);
  }
  
  /**
   * @private
   * @method _formatPipelineForLogging
   * @description 格式化Pipeline对象用于日志记录
   * @param {Pipeline} pipeline Pipeline对象
   * @returns {string} 格式化后的字符串
   */
  _formatPipelineForLogging(pipeline) {
    try {
      if (!pipeline) {
        return '[空管道]';
      }
      
      let result = `管道类型: ${pipeline.type}, 数据类型: ${pipeline.dataType}\n`;
      
      if (pipeline.data === undefined || pipeline.data === null) {
        result += '数据: null';
      } else if (typeof pipeline.data === 'object') {
        result += `数据:\n${JSON.stringify(pipeline.data, null, 2)}`;
      } else {
        result += `数据: ${pipeline.data}`;
      }
      
      return result;
    } catch (error) {
      logger.warn(`[WorkflowExecutor] 格式化Pipeline失败: ${error.message}`);
      return '[无法格式化的Pipeline]';
    }
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