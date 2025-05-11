/**
 * 工作流状态管理
 */
import { reactive, readonly, computed, ref } from 'vue';
import { 
  getWorkflowList, 
  getWorkflowDetail, 
  saveWorkflow, 
  deleteWorkflow, 
  runWorkflow,
  getWorkflowStatus,
  controlWorkflow
} from '@/api/workflow';
import useNotificationStore from '@/utils/notification';

// 工作流状态
const state = reactive({
  workflowList: [],
  currentWorkflow: null,
  executionStatus: null,
  activeEngines: {},  // 存储活跃的工作流引擎状态
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  }
});

// 状态监控定时器
const statusPollingTimer = ref(null);

// 通知服务
const { notify } = useNotificationStore();

/**
 * 工作流状态映射
 * 将后端状态映射到前端显示状态
 */
const statusMap = {
  'ready': 'draft',        // 准备就绪 -> 草稿
  'running': 'running',    // 运行中 -> 运行中
  'paused': 'paused',      // 已暂停 -> 已暂停
  'completed': 'published', // 已完成 -> 已发布
  'failed': 'failed',      // 失败 -> 失败
  'stopped': 'stopped'     // 已停止 -> 已停止
};

/**
 * 转换工作流状态为前端显示状态
 * @param {String} backendStatus - 后端工作流状态
 * @returns {String} 前端显示状态
 */
function mapStatus(backendStatus) {
  return statusMap[backendStatus] || 'draft';
}

/**
 * 获取工作流列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 */
async function fetchList(params = {}) {
  try {
    state.loading = true;
    
    // 更新分页参数
    if (params.page) state.pagination.page = params.page;
    if (params.pageSize) state.pagination.pageSize = params.pageSize;
    
    const result = await getWorkflowList(params);
    
    if (result && result.data) {
      // 转换状态
      state.workflowList = Array.isArray(result.data) ? result.data.map(workflow => ({
        ...workflow,
        id: workflow.name,  // 确保ID字段
        status: mapStatus(workflow.status),
        updatedAt: workflow.updatedAt || new Date().toISOString()
      })) : [];
      
      state.pagination.total = state.workflowList.length;
    } else {
      state.workflowList = [];
      state.pagination.total = 0;
    }
  } catch (error) {
    console.error('获取工作流列表失败:', error);
    state.error = error.message || '获取工作流列表失败';
    notify('获取工作流列表失败');
  } finally {
    state.loading = false;
  }
}

/**
 * 获取工作流详情
 * @param {String} id - 工作流ID
 */
async function fetchDetail(id) {
  try {
    state.loading = true;
    const result = await getWorkflowDetail(id);
    
    if (result && result.data) {
      // 转换数据结构
      state.currentWorkflow = {
        ...result.data,
        id: result.data.name,
        status: mapStatus(result.data.status),
        updatedAt: result.data.updatedAt || new Date().toISOString()
      };
    } else {
      state.currentWorkflow = null;
      notify('未找到工作流详情');
    }
  } catch (error) {
    console.error('获取工作流详情失败:', error);
    state.error = error.message || '获取工作流详情失败';
    notify('获取工作流详情失败');
  } finally {
    state.loading = false;
  }
}

/**
 * 创建或更新工作流
 * @param {Object} workflow - 工作流数据
 */
async function saveWorkflowData(workflow) {
  try {
    state.loading = true;
    
    // 确保必要字段
    const workflowData = {
      ...workflow,
      name: workflow.name || workflow.id,
    };
    
    const result = await saveWorkflow(workflowData);
    
    if (result && result.data) {
      // 更新列表数据
      const updatedWorkflow = {
        ...result.data,
        id: result.data.name,
        status: mapStatus(result.data.status),
        updatedAt: new Date().toISOString()
      };
      
      const index = state.workflowList.findIndex(item => item.id === updatedWorkflow.id);
      if (index !== -1) {
        state.workflowList[index] = updatedWorkflow;
      } else {
        state.workflowList.push(updatedWorkflow);
      }
      
      notify('工作流保存成功');
      return updatedWorkflow;
    } else {
      throw new Error('保存工作流失败: 服务器未返回有效数据');
    }
  } catch (error) {
    console.error('保存工作流失败:', error);
    state.error = error.message || '保存工作流失败';
    notify('保存工作流失败');
    throw error;
  } finally {
    state.loading = false;
  }
}

/**
 * 删除工作流
 * @param {String} id - 工作流ID
 */
async function removeWorkflow(id) {
  try {
    state.loading = true;
    const result = await deleteWorkflow(id);
    
    if (result && result.code === 0) {
      // 从列表中移除
      const index = state.workflowList.findIndex(item => item.id === id);
      if (index !== -1) {
        state.workflowList.splice(index, 1);
      }
      notify('工作流删除成功');
    } else {
      throw new Error(result?.message || '删除工作流失败');
    }
  } catch (error) {
    console.error('删除工作流失败:', error);
    state.error = error.message || '删除工作流失败';
    notify('删除工作流失败');
    throw error;
  } finally {
    state.loading = false;
  }
}

/**
 * 执行工作流
 * @param {String} id - 工作流ID
 * @param {Object} input - 工作流输入
 */
async function executeWorkflow(id, input = {}) {
  try {
    state.executionStatus = 'running';
    notify('工作流开始执行');
    
    const result = await runWorkflow(id, input);
    
    if (result && result.data && result.data.engineId) {
      const { engineId } = result.data;
      
      // 保存引擎状态
      state.activeEngines[engineId] = {
        engineId,
        workflowName: id,
        status: 'running',
        startTime: new Date().toISOString()
      };
      
      // 开始状态监控
      startStatusPolling(engineId);
      
      return result.data;
    } else {
      throw new Error('工作流执行失败: 未获取到引擎ID');
    }
  } catch (error) {
    console.error('执行工作流失败:', error);
    state.executionStatus = 'failed';
    state.error = error.message || '执行工作流失败';
    notify('执行工作流失败');
    throw error;
  }
}

/**
 * 开始状态轮询
 * @param {String} engineId - 工作流引擎ID
 */
function startStatusPolling(engineId) {
  if (statusPollingTimer.value) {
    clearInterval(statusPollingTimer.value);
  }
  
  // 每 3 秒查询一次状态
  statusPollingTimer.value = setInterval(async () => {
    try {
      const result = await getWorkflowStatus(engineId);
      
      if (result && result.data) {
        // 更新引擎状态
        state.activeEngines[engineId] = {
          ...state.activeEngines[engineId],
          ...result.data,
          lastUpdated: new Date().toISOString()
        };
        
        // 如果工作流已完成、失败或停止，停止轮询
        const status = result.data.workflowStatus;
        if (['completed', 'failed', 'stopped'].includes(status)) {
          stopStatusPolling();
          
          // 通知用户
          const statusText = status === 'completed' ? '完成' : 
                             status === 'failed' ? '失败' : '停止';
          notify(`工作流执行已${statusText}`);
          
          // 更新执行状态
          state.executionStatus = status;
          
          // 更新工作流列表
          fetchList();
        }
      }
    } catch (error) {
      console.error('获取工作流状态失败:', error);
      // 如果连续多次失败，可以停止轮询
    }
  }, 3000);
}

/**
 * 停止状态轮询
 */
function stopStatusPolling() {
  if (statusPollingTimer.value) {
    clearInterval(statusPollingTimer.value);
    statusPollingTimer.value = null;
  }
}

/**
 * 控制工作流执行
 * @param {String} engineId - 工作流引擎ID
 * @param {String} action - 控制动作
 */
async function controlWorkflowExecution(engineId, action) {
  try {
    if (!state.activeEngines[engineId]) {
      throw new Error('找不到指定的工作流实例');
    }
    
    const result = await controlWorkflow(engineId, action);
    
    if (result && result.code === 0) {
      // 更新引擎状态
      if (action === 'pause') {
        state.activeEngines[engineId].status = 'paused';
      } else if (action === 'resume') {
        state.activeEngines[engineId].status = 'running';
      } else if (action === 'stop') {
        state.activeEngines[engineId].status = 'stopped';
        // 停止轮询
        stopStatusPolling();
      }
      
      notify(`工作流${action === 'pause' ? '已暂停' : 
              action === 'resume' ? '已恢复' : 
              '已停止'}`);
              
      return true;
    } else {
      throw new Error(result?.message || `工作流${action}失败`);
    }
  } catch (error) {
    console.error(`工作流${action}失败:`, error);
    notify(`工作流${action}失败`);
    return false;
  }
}

/**
 * 重置当前工作流
 */
function resetCurrentWorkflow() {
  state.currentWorkflow = null;
}

// 计算属性
const publishedWorkflows = computed(() => 
  state.workflowList.filter(workflow => workflow.status === 'published')
);

const draftWorkflows = computed(() => 
  state.workflowList.filter(workflow => workflow.status === 'draft')
);

const runningWorkflows = computed(() => 
  Object.values(state.activeEngines).filter(engine => 
    engine.status === 'running' || engine.status === 'paused'
  )
);

// 导出工作流状态管理
export default function useWorkflowStore() {
  return {
    // 状态
    state: readonly(state),
    publishedWorkflows,
    draftWorkflows,
    runningWorkflows,
    
    // 方法
    fetchList,
    fetchDetail,
    saveWorkflowData,
    removeWorkflow,
    executeWorkflow,
    resetCurrentWorkflow,
    controlWorkflowExecution,
    stopStatusPolling
  };
} 