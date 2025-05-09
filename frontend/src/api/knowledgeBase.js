/**
 * 知识库管理API服务
 */
 
import { ipcApiRoute } from './index'
import { ipc } from '@/utils/ipcRenderer'

/**
 * 知识库管理API服务类
 */
class KnowledgeBaseApi {
  /**
   * 创建知识库
   * @param {Object} params 参数
   * @param {string} params.name 知识库名称
   * @param {string} params.description 知识库描述
   * @param {Object} params.config 知识库配置
   * @returns {Promise<Object>} 创建结果
   */
  static createKnowledgeBase(params) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.create, params);
  }
  
  /**
   * 获取知识库列表
   * @returns {Promise<Array>} 知识库列表
   */
  static getKnowledgeBaseList() {
    return ipc.invoke(ipcApiRoute.knowledgeBase.list);
  }
  
  /**
   * 获取知识库详情
   * @param {string} knowledgeBaseId 知识库ID
   * @returns {Promise<Object>} 知识库详情
   */
  static getKnowledgeBaseDetail(knowledgeBaseId) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.detail, { knowledgeBaseId });
  }
  
  /**
   * 更新知识库
   * @param {Object} params 参数
   * @param {string} params.knowledgeBaseId 知识库ID
   * @param {string} params.name 知识库名称
   * @param {string} params.description 知识库描述
   * @param {Object} params.config 知识库配置
   * @returns {Promise<Object>} 更新结果
   */
  static updateKnowledgeBase(params) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.update, params);
  }
  
  /**
   * 删除知识库
   * @param {string} knowledgeBaseId 知识库ID
   * @returns {Promise<Object>} 删除结果
   */
  static deleteKnowledgeBase(knowledgeBaseId) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.delete, { knowledgeBaseId });
  }
  
  /**
   * 清空知识库
   * @param {string} knowledgeBaseId 知识库ID
   * @returns {Promise<Object>} 清空结果
   */
  static clearKnowledgeBase(knowledgeBaseId) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.clear, { knowledgeBaseId });
  }
  
  /**
   * 添加文档到知识库
   * @param {Object} params 参数
   * @param {string} params.knowledgeBaseId 知识库ID
   * @param {string} params.text 文档文本内容
   * @param {Object} params.metadata 文档元数据
   * @returns {Promise<Object>} 添加结果
   */
  static addDocument(params) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.addDocument, params);
  }
  
  /**
   * 批量添加文档到知识库
   * @param {Object} params 参数
   * @param {string} params.knowledgeBaseId 知识库ID
   * @param {Array<Object>} params.documents 文档数组
   * @returns {Promise<Object>} 添加结果
   */
  static addDocuments(params) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.addDocuments, params);
  }
  
  /**
   * 取消进度回调
   * @param {string} callbackId 回调ID
   * @returns {Promise<Object>} 取消结果
   */
  static cancelProgressCallback(callbackId) {
    return ipc.invoke(ipcApiRoute.knowledgeBase.cancelProgress, { callbackId });
  }
  
  /**
   * 注册进度监听器
   * @param {string} callbackId 回调ID
   * @param {Function} callback 回调函数
   * @returns {Function} 取消监听函数
   */
  static registerProgressListener(callbackId, callback) {
    const channel = `knowledge-base-progress-${callbackId}`;
    
    // 注册事件监听
    ipc.on(channel, (event, progressData) => {
      callback(progressData);
    });
    
    // 返回取消监听的函数
    return () => {
      ipc.removeAllListeners(channel);
    };
  }
}

export default KnowledgeBaseApi; 