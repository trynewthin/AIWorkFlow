/**
 * @file electron/model/nodes/startNode.js
 * @class StartNode
 * @description 开始节点：根据配置的目标管道类型创建初始管道
 */
const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline/Pipeline');
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');

class StartNode extends BaseNode {
  /**
   * @constructor
   * @description 构造开始节点实例
   * @param {Object} config - 配置对象（保留以兼容 BaseNode）
   */
  constructor(config = {}) {
    super(config);
  }

  /**
   * @method onInit
   * @description 初始化节点，在 BaseNode.init() 方法内部被调用
   * @override
   * @param {Object} classConfig - 节点类型的静态配置
   * @param {Object} flowConfig - 流程级配置
   * @param {Object} workConfig - 运行时配置
   */
  async onInit(classConfig, flowConfig, workConfig) {
    // 打印调试信息，帮助理解输入参数的结构
    console.log('StartNode: onInit 被调用');
    console.log('StartNode: classConfig =', JSON.stringify(classConfig));
    console.log('StartNode: flowConfig =', JSON.stringify(flowConfig));
    console.log('StartNode: workConfig =', JSON.stringify(workConfig));

    // 注意：onInit 方法不需要返回值或修改传入的参数
    // init() 方法已经将配置保存到 BaseNode 实例中
    // 只需要处理那些需要初始化的事物，例如注册处理器或创建资源
    // 在 BaseNode.process 方法中，我们将使用 this.getWorkConfig() 获取正确的配置
  }

  /**
   * @method process
   * @description 创建并返回包含初始输入数据的管道实例，或转换已有管道
   * @param {Pipeline|any} input - 管道实例或原始输入数据
   * @returns {Promise<Pipeline>} 包含初始数据的管道实例或修改后的管道
   */
  async process(input) {
    // 直接获取工作配置

    const workConfig = this.getWorkConfig();
    
    console.log(`StartNode.process: 工作配置`, workConfig);

    // 从配置中获取管道类型和数据类型
    const pipelineType = workConfig.pipelineType ;
    const dataType = workConfig.dataType ;
  
    console.log(`StartNode.process: 使用管道类型 ${pipelineType} 和数据类型 ${dataType}`,input);

    let outputPipeline;

    if (input instanceof Pipeline) {
      console.log(`StartNode.process: 输入是 Pipeline 实例，执行转换`);
      outputPipeline = Pipeline.convert(input, pipelineType, dataType);
    } else {
      console.log(`StartNode.process: 输入不是 Pipeline 实例，创建新管道`);
      // 如果输入不是 Pipeline 实例，我们假设它就是我们想要的数据体
      outputPipeline = Pipeline.of(pipelineType, dataType, input);
    }
    
    console.log(`StartNode.process: 转换/创建后的管道`, outputPipeline);
    return outputPipeline;
  }
}

module.exports = StartNode;
