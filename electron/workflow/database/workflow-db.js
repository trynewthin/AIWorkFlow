'use strict';

/**
 * @file workflow-db.js
 * @description 工作流数据库服务，提供工作流及其节点的管理功能
 */

const { randomUUID } = require('crypto');
const { ModuleDbBase } = require('../../core/module-db-base');
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
    this.conversationTable = 'conversation'; // 添加对话轮次表名
    this.messageTable = 'conversation_message'; // 添加对话内容表名
    
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
      
      // 创建对话轮次表
      const conversationTableSql = `
        CREATE TABLE IF NOT EXISTS ${this.conversationTable} (
          id TEXT PRIMARY KEY,
          workflow_id TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workflow_id) REFERENCES ${this.workflowTable}(id) ON DELETE CASCADE
        );
      `;
      this.db.exec(conversationTableSql);
      
      // 创建对话内容表
      const messageTableSql = `
        CREATE TABLE IF NOT EXISTS ${this.messageTable} (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES ${this.conversationTable}(id) ON DELETE CASCADE
        );
      `;
      this.db.exec(messageTableSql);
      
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
   * @param {Object} data 更新数据
   * @param {string} [data.name] 工作流名称
   * @param {string} [data.description] 工作流描述
   * @param {Object} [data.config] 工作流配置
   * @param {string} [data.entry_node_id] 入口节点ID
   * @returns {number} 更新的记录数
   */
  async updateWorkflow(id, data = {}) {
    try {
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
      
      if (updateFields.length === 0) {
        return 0;
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);
      
      const sql = `UPDATE ${this.workflowTable} SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(sql);
      const info = stmt.run(...updateValues);
      
      logger.info(`[WorkflowDb] 更新工作流成功: ${id}`);
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 更新工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteWorkflow
   * @description 删除工作流
   * @param {string} id 工作流ID
   * @returns {number} 删除的记录数
   */
  async deleteWorkflow(id) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.workflowTable} WHERE id = ?`
      );
      
      const info = stmt.run(id);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 删除工作流成功: ${id}`);
      } else {
        logger.warn(`[WorkflowDb] 工作流不存在: ${id}`);
      }
      
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  // ========== 节点相关操作 ==========
  
  /**
   * @method addNode
   * @description 添加工作流节点
   * @param {Object} node 节点数据
   * @param {string} [node.id] 可选的自定义ID，不提供则自动生成
   * @param {string} node.workflow_id 工作流ID
   * @param {string} node.type 节点类型
   * @param {Object} [node.flow_config={}] 流程配置
   * @param {Object} [node.work_config={}] 工作配置
   * @param {number} node.order_index 节点顺序索引
   * @returns {string} 节点ID
   */
  async addNode({ id, workflow_id, type, flow_config = {}, work_config = {}, order_index }) {
    try {
      const nodeId = id || randomUUID();
      const stmt = this.db.prepare(
        `INSERT INTO ${this.nodeTable} (id, workflow_id, type, flow_config, work_config, order_index) VALUES (?, ?, ?, ?, ?, ?)`
      );
      
      stmt.run(
        nodeId,
        workflow_id,
        type,
        JSON.stringify(flow_config),
        JSON.stringify(work_config),
        order_index
      );
      
      logger.info(`[WorkflowDb] 添加节点成功: ${nodeId}`);
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
   * @returns {Array<Object>} 节点列表
   */
  async getWorkflowNodes(workflowId) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.nodeTable} WHERE workflow_id = ? ORDER BY order_index`
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
   * @param {Object} data 更新数据
   * @param {string} [data.type] 节点类型
   * @param {Object} [data.flow_config] 流程配置
   * @param {Object} [data.work_config] 工作配置
   * @param {number} [data.order_index] 节点顺序索引
   * @returns {number} 更新的记录数
   */
  async updateNode(id, data = {}) {
    try {
      const updateFields = [];
      const updateValues = [];
      
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      
      if (data.flow_config !== undefined) {
        updateFields.push('flow_config = ?');
        updateValues.push(JSON.stringify(data.flow_config));
      }
      
      if (data.work_config !== undefined) {
        updateFields.push('work_config = ?');
        updateValues.push(JSON.stringify(data.work_config));
      }
      
      if (data.order_index !== undefined) {
        updateFields.push('order_index = ?');
        updateValues.push(data.order_index);
      }
      
      if (updateFields.length === 0) {
        return 0;
      }
      
      updateValues.push(id);
      
      const sql = `UPDATE ${this.nodeTable} SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(sql);
      const info = stmt.run(...updateValues);
      
      logger.info(`[WorkflowDb] 更新节点成功: ${id}`);
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 更新节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteNode
   * @description 删除节点
   * @param {string} id 节点ID
   * @returns {number} 删除的记录数
   */
  async deleteNode(id) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.nodeTable} WHERE id = ?`
      );
      
      const info = stmt.run(id);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 删除节点成功: ${id}`);
      } else {
        logger.warn(`[WorkflowDb] 节点不存在: ${id}`);
      }
      
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除节点失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method moveNode
   * @description 移动节点位置
   * @param {string} id 节点ID  
   * @param {number} newIndex 新的位置索引
   * @returns {number} 更新的记录数
   */
  async moveNode(id, newIndex) {
    try {
      // 获取节点信息
      const node = await this.getNode(id);
      if (!node) {
        throw new Error(`节点不存在: ${id}`);
      }
      
      const oldIndex = node.order_index;
      const workflowId = node.workflow_id;
      
      // 如果位置没有变化，直接返回
      if (oldIndex === newIndex) {
        return 0;
      }
      
      // 使用事务处理
      const transaction = this.db.transaction(() => {
        if (oldIndex < newIndex) {
          // 向后移动：将中间的节点前移
          const updateStmt = this.db.prepare(
            `UPDATE ${this.nodeTable} SET order_index = order_index - 1 
             WHERE workflow_id = ? AND order_index > ? AND order_index <= ?`
          );
          updateStmt.run(workflowId, oldIndex, newIndex);
        } else {
          // 向前移动：将中间的节点后移
          const updateStmt = this.db.prepare(
            `UPDATE ${this.nodeTable} SET order_index = order_index + 1 
             WHERE workflow_id = ? AND order_index >= ? AND order_index < ?`
          );
          updateStmt.run(workflowId, newIndex, oldIndex);
        }
        
        // 更新目标节点的位置
        const moveStmt = this.db.prepare(
          `UPDATE ${this.nodeTable} SET order_index = ? WHERE id = ?`
        );
        moveStmt.run(newIndex, id);
      });
      
      transaction();
      
      logger.info(`[WorkflowDb] 移动节点成功: ${id} 从 ${oldIndex} 到 ${newIndex}`);
      return 1;
    } catch (error) {
      logger.error(`[WorkflowDb] 移动节点失败: ${error.message}`);
      throw error;
    }
  }
  
  // ========== 工作流用户关联相关操作 ==========
  
  /**
   * @method addWorkflowUserRelation
   * @description 添加工作流用户关联
   * @param {string} workflowId 工作流ID
   * @param {number} userId 用户ID
   * @returns {number} 新插入记录的ID
   */
  async addWorkflowUserRelation(workflowId, userId) {
    try {
      // 检查关联是否已存在
      const existingStmt = this.db.prepare(
        `SELECT id FROM ${this.workflowUserTable} WHERE workflow_id = ? AND user_id = ?`
      );
      const existing = existingStmt.get(workflowId, userId);
      
      if (existing) {
        logger.warn(`[WorkflowDb] 工作流用户关联已存在: workflow=${workflowId}, user=${userId}`);
        return existing.id;
      }
      
      const stmt = this.db.prepare(
        `INSERT INTO ${this.workflowUserTable} (workflow_id, user_id) VALUES (?, ?)`
      );
      
      const info = stmt.run(workflowId, userId);
      
      logger.info(`[WorkflowDb] 添加工作流用户关联成功: workflow=${workflowId}, user=${userId}`);
      return info.lastInsertRowid;
    } catch (error) {
      logger.error(`[WorkflowDb] 添加工作流用户关联失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getWorkflowUser
   * @description 获取工作流关联的用户
   * @param {string} workflowId 工作流ID
   * @returns {Object|null} 用户信息
   */
  async getWorkflowUser(workflowId) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.workflowUserTable} WHERE workflow_id = ?`
      );
      
      const relation = stmt.get(workflowId);
      return relation || null;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流用户关联失败: ${error.message}`);
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
         JOIN ${this.workflowUserTable} wu ON w.id = wu.workflow_id 
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
      logger.error(`[WorkflowDb] 获取用户工作流失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteWorkflowUserRelation
   * @description 删除工作流用户关联
   * @param {string} workflowId 工作流ID
   * @param {number} userId 用户ID
   * @returns {number} 删除的记录数
   */
  async deleteWorkflowUserRelation(workflowId, userId) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.workflowUserTable} WHERE workflow_id = ? AND user_id = ?`
      );
      
      const info = stmt.run(workflowId, userId);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 删除工作流用户关联成功: workflow=${workflowId}, user=${userId}`);
      }
      
      return info.changes;
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
      logger.error(`[WorkflowDb] 检查工作流所有者失败: ${error.message}`);
      throw error;
    }
  }
  
  // ========== 对话相关操作 ==========
  
  /**
   * @method createConversation
   * @description 创建新对话
   * @param {Object} conversation 对话数据
   * @param {string} [conversation.id] 可选的自定义ID，不提供则自动生成
   * @param {string} conversation.workflow_id 工作流ID
   * @returns {string} 对话ID
   */
  async createConversation({ id, workflow_id }) {
    try {
      const conversationId = id || randomUUID();
      const stmt = this.db.prepare(
        `INSERT INTO ${this.conversationTable} (id, workflow_id) VALUES (?, ?)`
      );
      
      stmt.run(conversationId, workflow_id);
      
      logger.info(`[WorkflowDb] 创建对话成功: ${conversationId}`);
      return conversationId;
    } catch (error) {
      logger.error(`[WorkflowDb] 创建对话失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getConversation
   * @description 获取对话信息
   * @param {string} id 对话ID
   * @returns {Object|null} 对话信息，不存在则返回 null
   */
  async getConversation(id) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.conversationTable} WHERE id = ?`
      );
      
      return stmt.get(id) || null;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取对话失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getWorkflowConversations
   * @description 获取工作流的所有对话
   * @param {string} workflowId 工作流ID
   * @returns {Array<Object>} 对话列表
   */
  async getWorkflowConversations(workflowId) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.conversationTable} WHERE workflow_id = ? ORDER BY created_at DESC`
      );
      
      return stmt.all(workflowId);
    } catch (error) {
      logger.error(`[WorkflowDb] 获取工作流对话失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteConversation
   * @description 删除对话
   * @param {string} id 对话ID
   * @returns {number} 删除的记录数
   */
  async deleteConversation(id) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.conversationTable} WHERE id = ?`
      );
      
      const info = stmt.run(id);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 删除对话成功: ${id}`);
      } else {
        logger.warn(`[WorkflowDb] 对话不存在: ${id}`);
      }
      
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除对话失败: ${error.message}`);
      throw error;
    }
  }
  
  // ========== 消息相关操作 ==========
  
  /**
   * @method addMessage
   * @description 添加消息
   * @param {Object} message 消息数据
   * @param {string} [message.id] 可选的自定义ID，不提供则自动生成
   * @param {string} message.conversation_id 对话ID
   * @param {string} message.content 消息内容
   * @returns {string} 消息ID
   */
  async addMessage({ id, conversation_id, content }) {
    try {
      const messageId = id || randomUUID();
      const stmt = this.db.prepare(
        `INSERT INTO ${this.messageTable} (id, conversation_id, content) VALUES (?, ?, ?)`
      );
      
      stmt.run(messageId, conversation_id, content);
      
      // 更新对话的更新时间
      const updateConversationStmt = this.db.prepare(
        `UPDATE ${this.conversationTable} SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      );
      updateConversationStmt.run(conversation_id);
      
      logger.info(`[WorkflowDb] 添加消息成功: ${messageId}`);
      return messageId;
    } catch (error) {
      logger.error(`[WorkflowDb] 添加消息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getMessage
   * @description 获取消息信息
   * @param {string} id 消息ID
   * @returns {Object|null} 消息信息，不存在则返回 null
   */
  async getMessage(id) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.messageTable} WHERE id = ?`
      );
      
      return stmt.get(id) || null;
    } catch (error) {
      logger.error(`[WorkflowDb] 获取消息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method getConversationMessages
   * @description 获取对话的所有消息
   * @param {string} conversationId 对话ID
   * @returns {Array<Object>} 消息列表
   */
  async getConversationMessages(conversationId) {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.messageTable} WHERE conversation_id = ? ORDER BY created_at ASC`
      );
      
      return stmt.all(conversationId);
    } catch (error) {
      logger.error(`[WorkflowDb] 获取对话消息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method updateMessage
   * @description 更新消息内容
   * @param {string} id 消息ID
   * @param {string} content 新的消息内容
   * @returns {number} 更新的记录数
   */
  async updateMessage(id, content) {
    try {
      const stmt = this.db.prepare(
        `UPDATE ${this.messageTable} SET content = ? WHERE id = ?`
      );
      
      const info = stmt.run(content, id);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 更新消息成功: ${id}`);
      } else {
        logger.warn(`[WorkflowDb] 消息不存在: ${id}`);
      }
      
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 更新消息失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * @method deleteMessage
   * @description 删除消息
   * @param {string} id 消息ID
   * @returns {number} 删除的记录数
   */
  async deleteMessage(id) {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.messageTable} WHERE id = ?`
      );
      
      const info = stmt.run(id);
      
      if (info.changes > 0) {
        logger.info(`[WorkflowDb] 删除消息成功: ${id}`);
      } else {
        logger.warn(`[WorkflowDb] 消息不存在: ${id}`);
      }
      
      return info.changes;
    } catch (error) {
      logger.error(`[WorkflowDb] 删除消息失败: ${error.message}`);
      throw error;
    }
  }
}

WorkflowDb.toString = () => '[class WorkflowDb]';

/**
 * 获取工作流数据库实例
 * @param {Object} [options] 配置选项
 * @returns {WorkflowDb}
 */
function getWorkflowDb(options = {}) {
  return WorkflowDb.getInstance(options);
}

module.exports = {
  WorkflowDb,
  getWorkflowDb
}; 