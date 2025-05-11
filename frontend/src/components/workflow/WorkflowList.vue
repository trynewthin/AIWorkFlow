<template>
  <div class="workflow-list">
    <div class="workflow-list__header">
      <div class="workflow-list__search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索工作流..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <div class="workflow-list__filters">
        <button 
          class="filter-btn" 
          :class="{ active: filter === 'all' }" 
          @click="setFilter('all')"
        >
          全部
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filter === 'published' }" 
          @click="setFilter('published')"
        >
          已发布
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filter === 'draft' }" 
          @click="setFilter('draft')"
        >
          草稿
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: filter === 'running' }" 
          @click="setFilter('running')"
        >
          运行中
        </button>
      </div>
    </div>

    <div v-if="loading" class="workflow-list__loading">
      加载中...
    </div>
    
    <div v-else-if="filteredWorkflows.length === 0" class="workflow-list__empty">
      <p v-if="searchQuery">未找到符合 "{{ searchQuery }}" 的工作流</p>
      <p v-else>暂无工作流，点击右上角"新建工作流"按钮创建</p>
    </div>
    
    <div v-else class="workflow-list__content">
      <WorkflowItem 
        v-for="workflow in filteredWorkflows" 
        :key="workflow.id" 
        :workflow="workflow"
        @refresh="loadWorkflows"
      />
    </div>
    
    <!-- 运行中工作流状态 -->
    <div v-if="runningWorkflows.length > 0" class="workflow-list__running">
      <h3 class="running-title">运行中的工作流</h3>
      <div class="running-list">
        <div 
          v-for="engine in runningWorkflows" 
          :key="engine.engineId"
          class="running-item"
        >
          <div class="running-item__header">
            <span class="running-item__name">{{ engine.workflowName }}</span>
            <span 
              class="running-item__status"
              :class="{
                'status-running': engine.status === 'running',
                'status-paused': engine.status === 'paused'
              }"
            >
              {{ engine.status === 'running' ? '运行中' : '已暂停' }}
            </span>
          </div>
          <div class="running-item__actions">
            <button 
              v-if="engine.status === 'running'"
              class="action-btn pause-btn" 
              @click="pauseWorkflow(engine.engineId)"
            >
              暂停
            </button>
            <button 
              v-else-if="engine.status === 'paused'"
              class="action-btn resume-btn" 
              @click="resumeWorkflow(engine.engineId)"
            >
              继续
            </button>
            <button 
              class="action-btn stop-btn" 
              @click="stopWorkflow(engine.engineId)"
            >
              停止
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="workflow-list__pagination" v-if="totalPages > 1">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="setPage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="setPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流列表组件
 */
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import WorkflowItem from './WorkflowItem.vue';
import useWorkflowStore from '@/store/workflow';

// 获取工作流状态管理
const { 
  state, 
  fetchList, 
  runningWorkflows, 
  controlWorkflowExecution, 
  stopStatusPolling 
} = useWorkflowStore();

// 列表过滤和分页状态
const searchQuery = ref('');
const filter = ref('all');
const debounceTimeout = ref(null);

// 加载状态
const loading = computed(() => state.loading);

// 计算当前页和总页数
const currentPage = computed(() => state.pagination.page);
const pageSize = computed(() => state.pagination.pageSize);
const totalPages = computed(() => 
  Math.ceil(filteredByStatus.value.length / pageSize.value) || 1
);

// 加载工作流列表
const loadWorkflows = async () => {
  await fetchList({
    page: currentPage.value,
    pageSize: pageSize.value,
    status: filter.value === 'all' ? undefined : filter.value
  });
};

// 监听搜索输入框变化（防抖处理）
const handleSearch = () => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
  
  debounceTimeout.value = setTimeout(() => {
    loadWorkflows();
  }, 300);
};

// 设置过滤器
const setFilter = (newFilter) => {
  filter.value = newFilter;
  fetchList({
    page: 1,
    pageSize: pageSize.value,
    status: newFilter === 'all' ? undefined : newFilter
  });
};

// 设置页码
const setPage = (page) => {
  fetchList({
    page,
    pageSize: pageSize.value,
    status: filter.value === 'all' ? undefined : filter.value
  });
};

// 根据过滤条件筛选工作流
const filteredByStatus = computed(() => {
  if (filter.value === 'all') {
    return state.workflowList;
  }
  return state.workflowList.filter(workflow => workflow.status === filter.value);
});

// 根据搜索关键词筛选工作流
const filteredWorkflows = computed(() => {
  let result = filteredByStatus.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(workflow => 
      workflow.name.toLowerCase().includes(query) || 
      (workflow.description && workflow.description.toLowerCase().includes(query))
    );
  }
  
  return result;
});

// 暂停工作流
const pauseWorkflow = async (engineId) => {
  await controlWorkflowExecution(engineId, 'pause');
};

// 恢复工作流
const resumeWorkflow = async (engineId) => {
  await controlWorkflowExecution(engineId, 'resume');
};

// 停止工作流
const stopWorkflow = async (engineId) => {
  if (window.confirm('确定要停止此工作流吗？')) {
    await controlWorkflowExecution(engineId, 'stop');
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadWorkflows();
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  stopStatusPolling();
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
});
</script>

<style scoped>
.workflow-list {
  width: 100%;
}

.workflow-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.workflow-list__search {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.workflow-list__filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.filter-btn.active {
  background-color: #e3f2fd;
  border-color: #90caf9;
  color: #1976d2;
}

.workflow-list__empty,
.workflow-list__loading {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 16px;
}

.workflow-list__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

.pagination-btn {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* 运行中工作流样式 */
.workflow-list__running {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.running-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.running-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.running-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.running-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.running-item__name {
  font-weight: 500;
}

.running-item__status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
}

.status-running {
  background-color: #e8f5e9;
  color: #43a047;
}

.status-paused {
  background-color: #fff3e0;
  color: #ff9800;
}

.running-item__actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
}

.pause-btn {
  background-color: #fff3e0;
  color: #ff9800;
}

.resume-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stop-btn {
  background-color: #ffebee;
  color: #e53935;
}
</style> 