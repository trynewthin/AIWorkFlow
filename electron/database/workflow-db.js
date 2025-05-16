'use strict';

/**
 * @file workflow-db.js
 * @description 工作流数据库服务，提供工作流及其节点的管理功能
 */

const { randomUUID } = require('crypto');
const { ModuleDbBase } = require('./module-db-base');
const { logger } = require('ee-core/log');

/**
 * 工作流数据库服务
 * 提供工作流表和节点表的管理功能
 */
class WorkflowDb extends ModuleDbBase {
  /**
   * @constructor
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    // 设置数据库名称和模块ID
    super({
      dbname: options.dbname || 'workflow-data.db',
      moduleId: 'workflow-module'
    });
    
    // 表名定义
    this.workflowTable = 'workflow';
    this.nodeTable = 'workflow_node';
    this.workflowUserTable = 'workflow_user'; // 添加工作流用户关联表名
    
    // 初始化表结构
    this._initTable();
  }

  /**
   * @private
   * @method _initTable
   * @description 初始化工作流相关表结构
   */
  _initTable() {
    try {
      // 创建工作流表
      const workflowTableSql = `
        CREATE TABLE IF NOT EXISTS ${this.workflowTable} (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          config TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          entry_node_id TEXT
        );
      `;
      this.db.exec(workflowTableSql);
      
      // 创建工作流节点表
      const nodeTableSql = `
        CREATE TABLE IF NOT EXISTS ${this.nodeTable} (
          id TEXT PRIMARY KEY,
          workflow_id TEXT NOT NULL,
          type TEXT NOT NULL,
          flow_config TEXT NOT NULL,
          work_config TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          FOREIGN KEY (workflow_id) REFERENCES ${this.workflowTable}(id) ON DELETE CASCADE
        );
      `;
      this.db.exec(nodeTableSql);
      
      // 创建工作流与用户关联表
      const workflowUserTableSql = `
        CREATE TABLE IF NOT EXISTS ${this.workflowUserTable} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workflow_id TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workflow_id) REFERENCES ${this.workflowTable}(id) ON DELETE CASCADE
        );
      `;
      this.db.exec(workflowUserTableSql);
      
      logger.info(`[WorkflowDb] 工作流相关表结构初始化完成`);
    } catch (error) {
      logger.error(`[WorkflowDb] 表结构初始化失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method createWorkflow
   * @description 创建新工作流
   * @param {Object} workflow 工作流数据
   * @param {string} [workflow.id] 可选的自定义ID，不提供则自动生成
   * @param {string} workflow.name 工作流名称
   * @param {string} [workflow.description] 工作流描述
   * @param {Object} [workflow.config={}] 工作流配置
   * @returns {string} 工作流ID
   */
  async createWorkflow({ id, name, description = '', config = {} }) {
    try {
      const workflowId = id || randomUUID();
      const stmt = this.db.prepare(
        `INSERT INTO ${this.workflowTable} (id, name, description, config) VALUES (?, ?, ?, ?)`
      );
      
      stmt.run(
        workflowId,
        name,
        description,
        JSON.stringify(config)
      );
      
      logger.info(`[WorkflowDb] 创建工作流成功: ${workflowId}`);
      return workflowId;
    } catch (error) {
      logger.error(`[WorkflowDb] 创建工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getWorkflow
   * @description 获取工作流信息
   * @param {string} id 工作流ID
   * @returns {Object|null} 工作流信息，不存在则返回 null
   */
  async getWorkflow(id) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.workflowTable} WHERE id = ?`
      );
      
      const workflow = stmt.get(id);
      
      if (!workflow) {
        return null;
      }
      
      // 解析JSON字段
      workflow.config = JSON.parse(workflow.config || '{}');
      
      return workflow;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method listWorkflows
   * @description 获取所有工作流列表
   * @returns {Array<Object>} 工作流列表
   */
  async listWorkflows() {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.workflowTable} ORDER BY created_at DESC`
      );
      
      const workflows = stmt.all();
      
      // 解析JSON字段
      workflows.forEach(workflow => {
        workflow.config = JSON.parse(workflow.config || '{}');
      });
      
      return workflows;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流列表失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method updateWorkflow
   * @description 更新工作流信息
   * @param {string} id 工作流ID
   * @param {Object} data 需要更新的字段
   * @param {string} [data.name] 工作流名称
   * @param {string} [data.description] 工作流描述
   * @param {Object} [data.config] 工作流配置
   * @param {string} [data.entry_node_id] 入口节点ID (为多向流预留)
   * @returns {boolean} 更新成功返回 true，工作流不存在返回 false
   */
  async updateWorkflow(id, data = {}) {
    try {
      const workflow = await this.getWorkflow(id);
      if (!workflow) {
        logger.warn(`[WorkflowDb] 更新工作流失败: 工作流不存在 ${id}`);
        return false;
      }
      
      const updateFields = [];
      const updateValues = [];
      
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      
      if (data.config !== undefined) {
        updateFields.push('config = ?');
        updateValues.push(JSON.stringify(data.config));
      }
      
      if (data.entry_node_id !== undefined) {
        updateFields.push('entry_node_id = ?');
        updateValues.push(data.entry_node_id);
      }
      
      // 更新时间戳
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (updateFields.length === 0) {
        return true; // 没有字段需要更新
      }
      
      updateValues.push(id); // WHERE id = ?
      
      const sql = `UPDATE ${this.workflowTable} SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...updateValues);
      
      logger.info(`[WorkflowDb] 更新工作流成功: ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`[WorkflowDb] 更新工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteWorkflow
   * @description 删除工作流及其所有节点
   * @param {string} id 工作流ID
   * @returns {boolean} 删除成功返回 true，工作流不存在返回 false
   */
  async deleteWorkflow(id) {
    try {
      const workflow = await this.getWorkflow(id);
      if (!workflow) {
        logger.warn(`[WorkflowDb] 删除工作流失败: 工作流不存在 ${id}`);
        return false;
      }
      
      // 由于设置了外键级联删除，删除工作流时会自动删除所有关联节点和用户关联记录
      const stmt = this.db.prepare(
        `DELETE FROM ${this.workflowTable} WHERE id = ?`
      );
      
      const result = stmt.run(id);
      
      logger.info(`[WorkflowDb] 删除工作流成功: ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method addNode
   * @description 向工作流添加节点
   * @param {Object} node 节点数据
   * @param {string} [node.id] 可选的自定义节点ID，不提供则自动生成
   * @param {string} node.workflow_id 工作流ID
   * @param {string} node.type 节点类型
   * @param {Object} [node.flow_config={}] 节点流程级配置
   * @param {Object} [node.work_config={}] 节点运行时配置
   * @param {number} [node.order_index] 节点顺序索引，不提供则添加到末尾
   * @returns {string} 节点ID
   */
  async addNode({ id, workflow_id, type, flow_config = {}, work_config = {}, order_index }) {
    try {
      // 检查工作流是否存在
      const workflow = await this.getWorkflow(workflow_id);
      if (!workflow) {
        throw new Error(`工作流不存在: ${workflow_id}`);
      }
      
      const nodeId = id || randomUUID();
      
      // 如果未指定顺序，则查询当前最大顺序并加1
      let nodeOrderIndex = order_index;
      if (nodeOrderIndex === undefined) {
        const maxOrderStmt = this.db.prepare(
          `SELECT MAX(order_index) as max_order FROM ${this.nodeTable} WHERE workflow_id = ?`
        );
        const result = maxOrderStmt.get(workflow_id);
        nodeOrderIndex = (result.max_order !== null ? result.max_order : -1) + 1;
      } else {
        // 如果指定了顺序，则需要将该位置及之后的节点顺序向后移动
        const updateOrderStmt = this.db.prepare(
          `UPDATE ${this.nodeTable} SET order_index = order_index + 1 
           WHERE workflow_id = ? AND order_index >= ?`
        );
        updateOrderStmt.run(workflow_id, nodeOrderIndex);
      }
      
      // 插入新节点
      const stmt = this.db.prepare(
        `INSERT INTO ${this.nodeTable} (id, workflow_id, type, flow_config, work_config, order_index) 
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      
      stmt.run(
        nodeId,
        workflow_id,
        type,
        JSON.stringify(flow_config),
        JSON.stringify(work_config),
        nodeOrderIndex
      );
      
      logger.info(`[WorkflowDb] 添加节点成功: ${nodeId} 到工作流 ${workflow_id}, 顺序: ${nodeOrderIndex}`);
      return nodeId;
    } catch (error) {
      logger.error(`[WorkflowDb] 添加节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getNode
   * @description 获取节点信息
   * @param {string} id 节点ID
   * @returns {Object|null} 节点信息，不存在则返回 null
   */
  async getNode(id) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.nodeTable} WHERE id = ?`
      );
      
      const node = stmt.get(id);
      
      if (!node) {
        return null;
      }
      
      // 解析JSON字段
      node.flow_config = JSON.parse(node.flow_config || '{}');
      node.work_config = JSON.parse(node.work_config || '{}');
      
      return node;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getWorkflowNodes
   * @description 获取工作流的所有节点
   * @param {string} workflowId 工作流ID
   * @returns {Array<Object>} 节点列表，按 order_index 升序排列
   */
  async getWorkflowNodes(workflowId) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.nodeTable} WHERE workflow_id = ? ORDER BY order_index ASC`
      );
      
      const nodes = stmt.all(workflowId);
      
      // 解析JSON字段
      nodes.forEach(node => {
        node.flow_config = JSON.parse(node.flow_config || '{}');
        node.work_config = JSON.parse(node.work_config || '{}');
      });
      
      return nodes;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method updateNode
   * @description 更新节点信息
   * @param {string} id 节点ID
   * @param {Object} data 需要更新的字段
   * @param {Object} [data.flow_config] 节点流程级配置
   * @param {Object} [data.work_config] 节点运行时配置
   * @returns {boolean} 更新成功返回 true，节点不存在返回 false
   */
  async updateNode(id, data = {}) {
    try {
      const node = await this.getNode(id);
      if (!node) {
        logger.warn(`[WorkflowDb] 更新节点失败: 节点不存在 ${id}`);
        return false;
      }
      
      const updateFields = [];
      const updateValues = [];
      
      if (data.flow_config !== undefined) {
        updateFields.push('flow_config = ?');
        updateValues.push(JSON.stringify(data.flow_config));
      }
      
      if (data.work_config !== undefined) {
        updateFields.push('work_config = ?');
        updateValues.push(JSON.stringify(data.work_config));
      }
      
      if (updateFields.length === 0) {
        return true; // 没有字段需要更新
      }
      
      updateValues.push(id); // WHERE id = ?
      
      const sql = `UPDATE ${this.nodeTable} SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...updateValues);
      
      logger.info(`[WorkflowDb] 更新节点成功: ${id}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`[WorkflowDb] 更新节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteNode
   * @description 删除节点并调整其他节点的顺序
   * @param {string} id 节点ID
   * @returns {boolean} 删除成功返回 true，节点不存在返回 false
   */
  async deleteNode(id) {
    try {
      const node = await this.getNode(id);
      if (!node) {
        logger.warn(`[WorkflowDb] 删除节点失败: 节点不存在 ${id}`);
        return false;
      }
      
      const { workflow_id, order_index } = node;
      
      // 开始事务
      this.db.prepare('BEGIN TRANSACTION').run();
      
      try {
        // 删除节点
        const deleteStmt = this.db.prepare(
          `DELETE FROM ${this.nodeTable} WHERE id = ?`
        );
        deleteStmt.run(id);
        
        // 调整后续节点的顺序
        const updateOrderStmt = this.db.prepare(
          `UPDATE ${this.nodeTable} SET order_index = order_index - 1 
           WHERE workflow_id = ? AND order_index > ?`
        );
        updateOrderStmt.run(workflow_id, order_index);
        
        // 提交事务
        this.db.prepare('COMMIT').run();
        
        logger.info(`[WorkflowDb] 删除节点成功: ${id}`);
        return true;
      } catch (error) {
        // 回滚事务
        this.db.prepare('ROLLBACK').run();
        throw error;
      }
    } catch (error) {
      logger.error(`[WorkflowDb] 删除节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method moveNode
   * @description 移动节点到新的位置
   * @param {string} id 节点ID
   * @param {number} newIndex 新的顺序索引
   * @returns {boolean} 移动成功返回 true，节点不存在返回 false
   */
  async moveNode(id, newIndex) {
    try {
      const node = await this.getNode(id);
      if (!node) {
        logger.warn(`[WorkflowDb] 移动节点失败: 节点不存在 ${id}`);
        return false;
      }
      
      const { workflow_id, order_index: oldIndex } = node;
      
      if (oldIndex === newIndex) {
        return true; // 位置未变，无需操作
      }
      
      // 开始事务
      this.db.prepare('BEGIN TRANSACTION').run();
      
      try {
        if (newIndex > oldIndex) {
          // 向后移动：将中间节点的顺序向前移动一位
          const updateStmt = this.db.prepare(
            `UPDATE ${this.nodeTable} SET order_index = order_index - 1 
             WHERE workflow_id = ? AND order_index > ? AND order_index <= ?`
          );
          updateStmt.run(workflow_id, oldIndex, newIndex);
        } else {
          // 向前移动：将中间节点的顺序向后移动一位
          const updateStmt = this.db.prepare(
            `UPDATE ${this.nodeTable} SET order_index = order_index + 1 
             WHERE workflow_id = ? AND order_index >= ? AND order_index < ?`
          );
          updateStmt.run(workflow_id, newIndex, oldIndex);
        }
        
        // 更新当前节点的顺序
        const nodeUpdateStmt = this.db.prepare(
          `UPDATE ${this.nodeTable} SET order_index = ? WHERE id = ?`
        );
        nodeUpdateStmt.run(newIndex, id);
        
        // 提交事务
        this.db.prepare('COMMIT').run();
        
        logger.info(`[WorkflowDb] 移动节点成功: ${id} 从 ${oldIndex} 到 ${newIndex}`);
        return true;
      } catch (error) {
        // 回滚事务
        this.db.prepare('ROLLBACK').run();
        throw error;
      }
    } catch (error) {
      logger.error(`[WorkflowDb] 移动节点失败: ${error.message}`);
      throw error;
    }
  }

  // ===== 工作流用户关联相关操作 =====

  /**
   * @method addWorkflowUserRelation
   * @description 添加工作流与用户的关联
   * @param {string} workflowId 工作流ID
   * @param {number} userId 用户ID
   * @returns {number} 新插入关联记录的ID
   */
  async addWorkflowUserRelation(workflowId, userId) {
    try {
      // 检查工作流是否存在
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`工作流不存在: ${workflowId}`);
      }

      // 检查关联是否已存在
      const existStmt = this.db.prepare(
        `SELECT id FROM ${this.workflowUserTable} WHERE workflow_id = ? AND user_id = ?`
      );
      const existRelation = existStmt.get(workflowId, userId);
      
      // 如果关联已存在，直接返回关联ID
      if (existRelation) {
        return existRelation.id;
      }
      
      // 创建新关联
      const stmt = this.db.prepare(
        `INSERT INTO ${this.workflowUserTable} (workflow_id, user_id) VALUES (?, ?)`
      );
      
      const info = stmt.run(workflowId, userId);
      
      logger.info(`[WorkflowDb] 添加工作流用户关联成功: 工作流 ${workflowId}, 用户 ${userId}`);
      return info.lastInsertRowid;
    } catch (error) {
      logger.error(`[WorkflowDb] 添加工作流用户关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getWorkflowUser
   * @description 获取工作流所属用户
   * @param {string} workflowId 工作流ID
   * @returns {number|null} 用户ID，不存在则返回null
   */
  async getWorkflowUser(workflowId) {
    try {
      const stmt = this.db.prepare(
        `SELECT user_id FROM ${this.workflowUserTable} WHERE workflow_id = ? LIMIT 1`
      );
      
      const relation = stmt.get(workflowId);
      
      return relation ? relation.user_id : null;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流所属用户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method getUserWorkflows
   * @description 获取用户的所有工作流
   * @param {number} userId 用户ID
   * @returns {Array<Object>} 工作流列表
   */
  async getUserWorkflows(userId) {
    try {
      const stmt = this.db.prepare(
        `SELECT w.* FROM ${this.workflowTable} w
         INNER JOIN ${this.workflowUserTable} wu ON w.id = wu.workflow_id
         WHERE wu.user_id = ?
         ORDER BY w.created_at DESC`
      );
      
      const workflows = stmt.all(userId);
      
      // 解析JSON字段
      workflows.forEach(workflow => {
        workflow.config = JSON.parse(workflow.config || '{}');
      });
      
      return workflows;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取用户工作流列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method deleteWorkflowUserRelation
   * @description 删除工作流与用户的关联
   * @param {string} workflowId 工作流ID
   * @param {number} userId 用户ID
   * @returns {boolean} 删除成功返回true
   */
  async deleteWorkflowUserRelation(workflowId, userId) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.workflowUserTable} WHERE workflow_id = ? AND user_id = ?`
      );
      
      const result = stmt.run(workflowId, userId);
      
      logger.info(`[WorkflowDb] 删除工作流用户关联成功: 工作流 ${workflowId}, 用户 ${userId}`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除工作流用户关联失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * @method isWorkflowOwner
   * @description 检查用户是否为工作流的所有者
   * @param {string} workflowId 工作流ID
   * @param {number} userId 用户ID
   * @returns {boolean} 是否为所有者
   */
  async isWorkflowOwner(workflowId, userId) {
    try {
      const stmt = this.db.prepare(
        `SELECT COUNT(*) as count FROM ${this.workflowUserTable} 
         WHERE workflow_id = ? AND user_id = ?`
      );
      
      const result = stmt.get(workflowId, userId);
      
      return result.count > 0;
    } catch (error) {
      logger.error(`[WorkflowDb] 检查工作流所有权失败: ${error.message}`);
      throw error;
    }
  }
}

// 静态类名
WorkflowDb.toString = () => '[class WorkflowDb]';

// 单例实例
let instance = null;

/**
 * 获取工作流数据库服务的单例
 * @param {Object} [options] 配置选项
 * @returns {WorkflowDb} 工作流数据库服务实例
 */
function getWorkflowDb(options = {}) {
  if (!instance) {
    instance = new WorkflowDb(options);
  }
  return instance;
}

// 导出类和便捷的单例获取方法
module.exports = {
  WorkflowDb,
  getWorkflowDb
}; 