/**
 * @class MergeNode
 * @description 合并多个 Pipeline，并设置合并后管道类型
 */
const BaseNode = require('./baseNode');
const { PipelineType } = require('../pipeline/Piptype');

class MergeNode extends BaseNode {
  /**
   * @constructor
   * @param {Object} config - 配置对象
   * @param {string} [config.outputType] - 合并后输出的管道类型
   * @param {number} [config.mergeCount] - 执行合并所需的管道数量阈值
   * @param {boolean} [config.immediateMerge] - 是否立即合并，或等待达到 mergeCount
   */
  constructor(config = {}) {
    super(config);
    // 合并后管道类型
    this.outputType = config.outputType || PipelineType.CUSTOM;
    // 合并数量阈值
    this.mergeCount = config.mergeCount != null ? config.mergeCount : 2;
    // 是否立即合并，只要接收到数据就直接合并
    this.immediateMerge = config.immediateMerge != null ? config.immediateMerge : true;

    // 注册默认的未支持类型处理器（主要用于 execute 调用路径，如果发生）
    this.registerHandler('*', this._defaultUnsupportedHandler.bind(this));
  }

  /**
   * @description 执行合并，将后续管道的数据合并到第一个管道，并设置新的管道类型
   * @param {Array<Pipeline>} pipelines - 要合并的 Pipeline 实例数组
   * @returns {Promise<Pipeline>} 合并后的 Pipeline 实例
   * @throws {Error} 如果未开启立即合并且管道数量不足时抛出
   */
  async process(pipelines) {
    this.setStatus(MergeNode.Status.RUNNING);
    // 阻塞合并：如果未开启立即合并模式且数量不足，则抛出
    if (!this.immediateMerge && pipelines.length < this.mergeCount) {
      throw new Error(`合并节点需要 ${this.mergeCount} 条管道，实际接收 ${pipelines.length} 条`);
    }
    const [first, ...rest] = pipelines;
    // 遍历其他管道，将所有数据项添加到第一个管道
    for (const p of rest) {
      p.getAll().forEach(item => {
        first.add(item.type, item.data);
      });
    }
    // 设置合并后管道类型
    first.setPipelineType(this.outputType);
    this.setStatus(MergeNode.Status.COMPLETED);
    return first;
  }

  /**
   * @private
   * @description 处理不支持的管道类型，默认抛出错误 (主要用于 execute 调用路径)。
   * @param {Pipeline} pipeline - 输入的管道实例。
   * @throws {Error} 当接收到不支持的管道类型时抛出。
   * @returns {Promise<Pipeline>}
   */
  async _defaultUnsupportedHandler(pipeline) {
    const pipelineType = pipeline.getPipelineType();
    throw new Error(`节点 ${this.constructor.nodeConfig.name} (ID: ${this.nodeInfo.nodeId}) 不支持通过 execute 处理 ${pipelineType} 类型的管道。请使用 process(pipelines) 处理。`);
  }

  /**
   * @description 返回自定义配置，用于序列化
   * @returns {Object} 自定义配置对象
   */
  getCustomConfig() {
    return {
      outputType: this.outputType,
      mergeCount: this.mergeCount,
      immediateMerge: this.immediateMerge
    };
  }

  /**
   * @description 设置自定义配置，用于反序列化
   * @param {Object} config - 配置对象
   */
  setCustomConfig(config) {
    if (config.outputType) this.outputType = config.outputType;
    if (config.mergeCount != null) this.mergeCount = config.mergeCount;
    if (config.immediateMerge != null) this.immediateMerge = config.immediateMerge;
  }

  /**
   * @description 设置合并数量阈值
   * @param {number} count - 合并数量
   */
  setMergeCount(count) {
    this.mergeCount = count;
  }

  /**
   * @description 获取合并数量阈值
   * @returns {number} 合并数量
   */
  getMergeCount() {
    return this.mergeCount;
  }

  /**
   * @description 增加合并数量阈值
   */
  incrementMergeCount() {
    this.mergeCount++;
  }

  /**
   * @description 减少合并数量阈值，最小为 1
   */
  decrementMergeCount() {
    if (this.mergeCount > 1) this.mergeCount--;
  }

  /**
   * @description 设置立即合并模式
   * @param {boolean} flag - 是否立即合并
   */
  setImmediateMerge(flag) {
    this.immediateMerge = flag;
  }

  /**
   * @description 获取立即合并模式
   * @returns {boolean} 是否立即合并
   */
  getImmediateMerge() {
    return this.immediateMerge;
  }
}

// 继承状态枚举
MergeNode.Status = BaseNode.Status;

// 节点元数据
MergeNode.nodeConfig = {
  type: 'utility',
  tag: 'merge',
  name: 'pipeline-merge-node',
  description: '合并多个 Pipeline，并设置合并后管道类型',
  // 不限制输入管道类型
  supportedInputPipelines: [],
  // 不限制输出管道类型
  supportedOutputPipelines: [],
  version: '1.0.0'
};

module.exports = MergeNode; 