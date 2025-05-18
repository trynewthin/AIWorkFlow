/**
 * @file electron/core/configs/models/enums.js
 * @description 项目中使用的通用枚举
 */

/**
 * @description 节点状态枚举
 * @exports Status
 * @enum {string}
 */
const Status = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * @description 节点键名枚举 (程序内部使用的节点类型标识)
 * @exports NodeKey
 * @enum {string}
 */
const NodeKey = {
  CHAT: 'ChatNode',
  CHUNK: 'ChunkNode',
  EMBEDDING: 'EmbeddingNode',
  END: 'EndNode',
  MEMORY: 'MemoryNode',
  MERGE: 'MergeNode',
  PROMPT: 'PromptNode',
  SEARCH: 'SearchNode',
  START: 'StartNode'
};

module.exports = {
  Status,
  NodeKey
}; 