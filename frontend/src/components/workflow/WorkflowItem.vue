<template>
  <div class="workflow-item" :class="{ 
    'is-draft': workflow.status === 'draft',
    'is-running': workflow.status === 'running',
    'is-paused': workflow.status === 'paused'
  }">
    <div class="workflow-item__header">
      <h3 class="workflow-item__title">{{ workflow.name }}</h3>
      <div class="workflow-item__status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    
    <div class="workflow-item__description">
      {{ workflow.description || '暂无描述' }}
    </div>
    
    <div class="workflow-item__footer">
      <div class="workflow-item__meta">
        <span>更新时间: {{ formatDate(workflow.updatedAt) }}</span>
        <span v-if="workflow.stepCount">步骤数: {{ workflow.stepCount }}</span>
      </div>
      
      <div class="workflow-item__actions">
        <router-link :to="`/Workflow/${workflow.id}`" class="workflow-item__btn view-btn">
          查看
        </router-link>
        <router-link v-if="workflow.status === 'draft'" :to="`/Workflow/${workflow.id}/edit`" class="workflow-item__btn edit-btn">
          编辑
        </router-link>
        <button 
          class="workflow-item__btn run-btn" 
          @click="handleRun" 
          v-if="workflow.status === 'published' && !isRunning"
        >
          运行
        </button>
        <button class="workflow-item__btn delete-btn" @click="handleDelete">
          删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流列表项组件
 */
import { computed } from 'vue';
import useWorkflowStore from '@/store/workflow';
import useNotificationStore from '@/utils/notification';

// 定义属性
const props = defineProps({
  /**
   * 工作流数据
   */
  workflow: {
    type: Object,
    required: true
  }
});

// 定义事件
const emit = defineEmits(['refresh']);

// 获取工作流状态管理
const { executeWorkflow, removeWorkflow, runningWorkflows } = useWorkflowStore();
const { notify } = useNotificationStore();

// 检查工作流是否正在运行
const isRunning = computed(() => {
  return runningWorkflows.value.some(engine => 
    engine.workflowName === props.workflow.id || 
    engine.workflowName === props.workflow.name
  );
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 工作流状态相关计算属性
const statusClass = computed(() => {
  switch (props.workflow.status) {
    case 'published': return 'status-published';
    case 'draft': return 'status-draft';
    case 'running': return 'status-running';
    case 'paused': return 'status-paused';
    case 'failed': return 'status-failed';
    case 'stopped': return 'status-stopped';
    default: return '';
  }
});

const statusText = computed(() => {
  switch (props.workflow.status) {
    case 'published': return '已发布';
    case 'draft': return '草稿';
    case 'running': return '运行中';
    case 'paused': return '已暂停';
    case 'failed': return '失败';
    case 'stopped': return '已停止';
    default: return '未知状态';
  }
});

// 处理运行工作流
const handleRun = async () => {
  try {
    const result = await executeWorkflow(props.workflow.id);
    
    if (result) {
      notify(`工作流「${props.workflow.name}」已开始执行`);
    } else {
      notify('工作流执行失败');
    }
  } catch (error) {
    console.error('执行工作流失败:', error);
    notify(`执行失败: ${error.message || '未知错误'}`);
  }
};

// 处理删除工作流
const handleDelete = async () => {
  // 如果工作流正在运行，提示用户先停止
  if (isRunning.value) {
    notify('请先停止运行中的工作流再删除');
    return;
  }
  
  const confirmed = window.confirm(`确定要删除工作流「${props.workflow.name}」吗？`);
  if (!confirmed) return;
  
  try {
    await removeWorkflow(props.workflow.id);
    emit('refresh');
    notify('工作流删除成功');
  } catch (error) {
    console.error('删除工作流失败:', error);
    notify(`删除失败: ${error.message || '未知错误'}`);
  }
};
</script>

<style scoped>
.workflow-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.workflow-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.workflow-item.is-draft {
  border-left: 4px solid #ff9800;
}

.workflow-item.is-running {
  border-left: 4px solid #43a047;
  background-color: #f9fbf9;
}

.workflow-item.is-paused {
  border-left: 4px solid #fb8c00;
  background-color: #fdfaf5;
}

.workflow-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.workflow-item__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.workflow-item__status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.status-published {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-draft {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-running {
  background-color: #e8f5e9;
  color: #43a047;
  animation: pulse 2s infinite;
}

.status-paused {
  background-color: #fff3e0;
  color: #fb8c00;
}

.status-failed {
  background-color: #ffebee;
  color: #e53935;
}

.status-stopped {
  background-color: #f5f5f5;
  color: #757575;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.workflow-item__description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.workflow-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.workflow-item__meta {
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workflow-item__actions {
  display: flex;
  gap: 8px;
}

.workflow-item__btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.edit-btn {
  background-color: #e8f5e9;
  color: #43a047;
}

.run-btn {
  background-color: #e8f5e9;
  color: #43a047;
}

.delete-btn {
  background-color: #ffebee;
  color: #e53935;
}
</style> 