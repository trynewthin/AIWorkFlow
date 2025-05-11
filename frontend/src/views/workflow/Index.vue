<template>
  <div class="workflow-container">
    <div class="workflow-container__header">
      <div class="breadcrumb">
        <router-link to="/">首页</router-link> &gt; 
        <router-link to="/Workflow">工作流</router-link>
        <template v-if="currentRoute.name === 'WorkflowDetail'">
          &gt; <span>{{ currentWorkflowName || '工作流详情' }}</span>
        </template>
        <template v-else-if="currentRoute.name === 'WorkflowCreate'">
          &gt; <span>新建工作流</span>
        </template>
        <template v-else-if="currentRoute.name === 'WorkflowEdit'">
          &gt; <span>编辑工作流</span>
        </template>
      </div>
      
      <div class="header-actions">
        <router-link 
          to="/Workflow/create" 
          class="create-btn"
          v-if="currentRoute.name === 'WorkflowList'"
        >
          新建工作流
        </router-link>
        
        <button 
          class="save-btn" 
          v-if="['WorkflowCreate', 'WorkflowEdit'].includes(currentRoute.name)"
          @click="saveWorkflow"
        >
          保存
        </button>
        
        <button 
          class="publish-btn" 
          v-if="['WorkflowCreate', 'WorkflowEdit'].includes(currentRoute.name)"
          @click="publishWorkflow"
        >
          发布
        </button>
        
        <button 
          class="run-btn" 
          v-if="currentRoute.name === 'WorkflowDetail'"
          @click="runWorkflow"
        >
          运行
        </button>
      </div>
    </div>
    
    <div class="workflow-container__content">
      <router-view @workflow-saved="onWorkflowSaved" />
    </div>
    
    <ExecutionProgress ref="executionProgressRef" />
  </div>
</template>

<script setup>
/**
 * 工作流主视图容器
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useWorkflowStore from '@/store/workflow';
import useNotificationStore from '@/utils/notification';
import ExecutionProgress from '@/components/workflow/ExecutionProgress.vue';

// 路由相关
const route = useRoute();
const router = useRouter();
const currentRoute = computed(() => route);

// 获取工作流状态管理
const { state, fetchDetail, saveWorkflowData, executeWorkflow } = useWorkflowStore();
const { notify } = useNotificationStore();

// 获取执行进度组件实例
const executionProgressRef = ref(null);

// 当前工作流名称
const currentWorkflowName = computed(() => {
  return state.currentWorkflow?.name || '';
});

// 监听路由变化，加载工作流数据
watch(() => route.params.id, (newId) => {
  if (newId && ['WorkflowDetail', 'WorkflowEdit'].includes(route.name)) {
    loadWorkflowDetail(newId);
  }
});

// 加载工作流详情
const loadWorkflowDetail = async (id) => {
  try {
    await fetchDetail(id);
  } catch (error) {
    console.error('加载工作流详情失败:', error);
    notify('加载工作流详情失败');
    
    // 如果加载失败，返回列表页
    if (route.name !== 'WorkflowList') {
      router.push('/Workflow');
    }
  }
};

// 保存工作流
const saveWorkflow = async () => {
  // 触发子组件的保存方法
  window.dispatchEvent(new CustomEvent('save-workflow', { detail: { publish: false } }));
};

// 发布工作流
const publishWorkflow = async () => {
  // 触发子组件的保存方法（带发布标记）
  window.dispatchEvent(new CustomEvent('save-workflow', { detail: { publish: true } }));
};

// 运行工作流
const runWorkflow = async () => {
  const id = route.params.id;
  if (!id) return;
  
  try {
    await executeWorkflow(id);
    
    // 显示执行进度组件
    if (executionProgressRef.value) {
      executionProgressRef.value.show();
    }
  } catch (error) {
    console.error('运行工作流失败:', error);
    notify('运行工作流失败');
  }
};

// 工作流保存回调
const onWorkflowSaved = (workflow) => {
  if (workflow.status === 'published') {
    notify('工作流已发布');
    // 发布后跳转到详情页
    router.push(`/Workflow/${workflow.id}`);
  } else {
    notify('工作流已保存');
    // 如果是新建，保存后跳转到编辑页
    if (route.name === 'WorkflowCreate') {
      router.push(`/Workflow/${workflow.id}/edit`);
    }
  }
};

// 组件挂载时，根据路由加载数据
onMounted(() => {
  const id = route.params.id;
  if (id && ['WorkflowDetail', 'WorkflowEdit'].includes(route.name)) {
    loadWorkflowDetail(id);
  }
});
</script>

<style scoped>
.workflow-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.workflow-container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #1976d2;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-btn,
.save-btn,
.publish-btn,
.run-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.create-btn {
  background-color: #1976d2;
  color: white;
}

.save-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.publish-btn {
  background-color: #1976d2;
  color: white;
}

.run-btn {
  background-color: #4caf50;
  color: white;
}

.workflow-container__content {
  flex-grow: 1;
  overflow: auto;
  height: calc(100% - 60px);
}
</style> 