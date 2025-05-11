// TODO: 定义管道数据类型枚举
const DataType = {
  /** 通用数据，由 StartNode 输出 */
  DATA: 'data',
  /** 文件或目录路径，由 StartNode 输出 */
  PATH: 'path',
  /** 文本字符串，由 ChunkNode/PromptNode/ChatNode 输出 */
  TEXT: 'text',
  /** 文本字符串数组 */
  TEXTS: 'texts',
  /** 单个文档对象，包含 pageContent 和 metadata，由 ChunkNode 输出 */
  DOCUMENT: 'document',
  /** 文档对象数组，由 ChunkNode 输出 */
  DOCUMENTS: 'documents',
  /** 单个文本块，由 ChunkNode 输出 */
  CHUNK: 'chunk',
  /** 文本块数组，由 ChunkNode 输出 */
  CHUNKS: 'chunks',
  /** 单个嵌入向量，由 EmbeddingNode 输出 */
  EMBEDDING: 'embedding',
  /** 嵌入向量数组，由 EmbeddingNode 输出 */
  EMBEDDINGS: 'embeddings',
  /** HNSW 索引实例，由 HNSWDb 输出 */
  HNSW_INDEX: 'hnsw_index',
  /** 检索结果数组，由 SearchNode 输出，包含 pageContent、metadata、score */
  SEARCH_RESULTS: 'search_results'
};

module.exports = DataType;
