/**
 * @class MergeNode
 * @description 合并多个 Pipeline，并设置合并后管道类型
 */
const BaseNode = require('./baseNode');
const PIPconfigs = require('../configs/PIPconfigs');

class MergeNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    // 合并后管道类型
    this.outputType = config.outputType || PIPconfigs.PipelineType.CUSTOM;
    // 合并数量阈值
    this.mergeCount = config.mergeCount != null ? config.mergeCount : 2;
    // 是否立即合并，只要接收到数据就直接合并
    this.immediateMerge = config.immediateMerge != null ? config.immediateMerge : true;
  }

  /**
   * 执行合并，将后续管道的数据合并到第一个管道，并设置新的管道类型
   * @param {Array<Pipeline>} pipelines - 要合并的 Pipeline 实例数组
   * @returns {Pipeline} 合并后的 Pipeline 实例
   */
  async process(pipelines) {
    // TODO: 设置状态为运行中
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
    // TODO: 设置状态为完成
    this.setStatus(MergeNode.Status.COMPLETED);
    return first;
  }

  /**
   * 返回自定义配置，用于序列化
   */
  getCustomConfig() {
    return {
      outputType: this.outputType,
      mergeCount: this.mergeCount,
      immediateMerge: this.immediateMerge
    };
  }

  /**
   * 设置自定义配置，用于反序列化
   */
  setCustomConfig(config) {
    if (config.outputType) this.outputType = config.outputType;
    if (config.mergeCount != null) this.mergeCount = config.mergeCount;
    if (config.immediateMerge != null) this.immediateMerge = config.immediateMerge;
  }

  // 设置合并数量阈值
  setMergeCount(count) {
    this.mergeCount = count;
  }

  // 获取合并数量阈值
  getMergeCount() {
    return this.mergeCount;
  }

  // 增加合并数量阈值
  incrementMergeCount() {
    this.mergeCount++;
  }

  // 减少合并数量阈值
  decrementMergeCount() {
    if (this.mergeCount > 1) this.mergeCount--;
  }

  // 设置立即合并模式
  setImmediateMerge(flag) {
    this.immediateMerge = flag;
  }

  // 获取立即合并模式
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