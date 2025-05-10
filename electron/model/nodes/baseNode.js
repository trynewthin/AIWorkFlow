/**
 * @class BaseNode
 * @description 节点基类，封装公共属性和方法
 */
class BaseNode {
  constructor(externalConfig = {}) {
    // TODO: 节点公共信息
    this.nodeInfo = {
      nodeId: externalConfig.nodeId || '',
      nodeName: externalConfig.nodeName || this.constructor.nodeConfig.name,
      nextNodeId: externalConfig.nextNodeId || null,
      status: externalConfig.status || this.constructor.Status.IDLE
    };
  }

  // TODO: 设置节点状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // TODO: 获取节点状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // TODO: 获取节点输入类型
  getInputType() {
    return this.constructor.nodeConfig.input;
  }

  // TODO: 获取节点输出类型
  getOutputType() {
    return this.constructor.nodeConfig.output;
  }
}

// TODO: 节点状态枚举
BaseNode.Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

module.exports = BaseNode; 