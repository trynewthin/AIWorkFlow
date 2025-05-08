'use strict';

const { ModuleDbBase } = require('./module-db-base');

/**
 * 向量数据库服务
 * 提供文本向量的存储和检索功能
 */
class VectorDb extends ModuleDbBase {
  constructor(options = {}) {
    // 设置数据库名称和模块ID
    super({
      dbname: options.dbname || 'vector-store.db',
      moduleId: 'vector-module'
    });
    
    this.vectorTable = 'vectors';
    this._initTable();
  }

  /**
   * 初始化向量表
   * @private
   */
  _initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.vectorTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,           -- Original text
        vector BLOB NOT NULL,         -- Vector data (serialized)
        dimension INTEGER NOT NULL,   -- Vector dimension
        metadata TEXT,                -- Metadata (JSON format)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation time
      );
      
      -- 创建索引提高查询性能
      CREATE INDEX IF NOT EXISTS idx_vector_dimension ON ${this.vectorTable} (dimension);
    `;
    this.db.exec(sql);
  }

  /**
   * 存储向量
   * @param {string} text 原始文本
   * @param {Array<number>} vector 向量数据
   * @param {number} dimension 向量维度
   * @param {Object} metadata 元数据对象
   * @returns {number} 新记录ID
   */
  async saveVector(text, vector, dimension, metadata = {}) {
    const serializedVector = JSON.stringify(vector);
    const serializedMetadata = JSON.stringify(metadata);
    
    const stmt = this.db.prepare(
      `INSERT INTO ${this.vectorTable} (text, vector, dimension, metadata) VALUES (?, ?, ?, ?)`
    );
    const info = stmt.run(text, serializedVector, dimension, serializedMetadata);
    return info.lastInsertRowid;
  }

  /**
   * 根据ID获取向量
   * @param {number} id 记录ID
   * @returns {Object|null} 向量记录
   */
  async getVectorById(id) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.vectorTable} WHERE id = ?`
    );
    const result = stmt.get(id);
    
    if (result) {
      // 反序列化向量数据
      result.vector = JSON.parse(result.vector);
      result.metadata = JSON.parse(result.metadata);
    }
    
    return result;
  }
  
  /**
   * 获取所有向量
   * @returns {Array<Object>} 向量记录数组
   */
  async getAllVectors() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.vectorTable}`);
    const results = stmt.all();
    
    // 反序列化所有结果
    return results.map(result => {
      result.vector = JSON.parse(result.vector);
      result.metadata = JSON.parse(result.metadata);
      return result;
    });
  }
  
  /**
   * 删除向量
   * @param {number} id 记录ID
   * @returns {number} 删除的记录数
   */
  async deleteVector(id) {
    const stmt = this.db.prepare(
      `DELETE FROM ${this.vectorTable} WHERE id = ?`
    );
    const info = stmt.run(id);
    return info.changes;
  }
  
  /**
   * 计算两个向量之间的余弦相似度
   * @param {Array<number>} vector1 第一个向量
   * @param {Array<number>} vector2 第二个向量
   * @returns {number} 余弦相似度，值范围 [-1, 1]
   */
  cosineDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
      throw new Error('向量维度不匹配');
    }
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  /**
   * 向量相似度搜索
   * @param {Array<number>} queryVector 查询向量
   * @param {Object} options 搜索选项
   * @param {number} [options.limit=5] 返回结果数量限制
   * @param {number} [options.threshold=0.7] 相似度阈值
   * @returns {Array<Object>} 相似度排序后的结果
   */
  async searchSimilar(queryVector, options = {}) {
    const limit = options.limit || 5;
    const threshold = options.threshold || 0.7;
    
    // 获取所有向量
    const allVectors = await this.getAllVectors();
    
    // 计算相似度并过滤
    const results = allVectors
      .map(item => {
        const similarity = this.cosineDistance(queryVector, item.vector);
        return { ...item, similarity };
      })
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return results;
  }
}

VectorDb.toString = () => '[class VectorDb]';

// 导出类和便捷的单例获取方法
module.exports = {
  VectorDb,
  getVectorDb: (options) => VectorDb.getInstance(options)
}; 