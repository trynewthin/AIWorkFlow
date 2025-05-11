<template>
  <div class="workflow-edit-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载工作流数据...</div>
    </div>
    
    <div v-else-if="!workflow" class="empty-state">
      <p>未找到工作流或加载失败</p>
      <router-link to="/Workflow" class="back-btn">返回列表</router-link>
    </div>
    
    <div v-else>
      <!-- 复用创建页面的内容 -->
      <div class="workflow-create-form">
        <div class="form-group">
          <label for="workflow-name">工作流名称</label>
          <input 
            type="text" 
            id="workflow-name" 
            v-model="workflowName" 
            placeholder="请输入工作流名称" 
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="workflow-description">工作流描述</label>
          <textarea 
            id="workflow-description" 
            v-model="workflowDescription" 
            placeholder="请输入工作流描述" 
            class="form-textarea"
          ></textarea>
        </div>
      </div>
      
      <div class="workflow-designer">
        <!-- 设计器内容复用Create.vue的内容，只是初始数据不同 -->
        <!-- 此处简化显示 -->
        <div class="designer-placeholder">
          <p>编辑器已加载 {{ nodes.length }} 个节点和 {{ edges.length }} 条连线</p>
          <p>此处应显示与Create.vue相同的设计器界面</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流编辑视图
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useWorkflowStore from '@/store/workflow';
import useNotificationStore from '@/utils/notification';

// 路由相关
const route = useRoute();
const router = useRouter();

// 定义props
const props = defineProps({
  /**
   * 工作流ID
   */
  id: {
    type: String,
    required: true
  }
});

// 获取工作流状态管理
const { state, fetchDetail, saveWorkflowData } = useWorkflowStore();
const { notify } = useNotificationStore();

// 定义事件
const emit = defineEmits(['workflow-saved']);

// 加载状态
const loading = computed(() => state.loading);
const workflow = computed(() => state.currentWorkflow);

// 工作流基本信息
const workflowName = ref('');
const workflowDescription = ref('');

// 画布数据
const nodes = ref([]);
const edges = ref([]);

// 加载工作流数据
const loadWorkflowData = async () => {
  if (!props.id) return;
  
  try {
    await fetchDetail(props.id);
    
    // 填充表单数据
    if (workflow.value) {
      workflowName.value = workflow.value.name || '';
      workflowDescription.value = workflow.value.description || '';
      nodes.value = JSON.parse(JSON.stringify(workflow.value.nodes || []));
      edges.value = JSON.parse(JSON.stringify(workflow.value.edges || []));
    }
  } catch (error) {
    console.error('加载工作流失败:', error);
    notify('加载工作流失败');
  }
};

// 保存工作流
const saveWorkflow = async (publish = false) => {
  // 验证基本信息
  if (!workflowName.value.trim()) {
    notify('请输入工作流名称');
    return;
  }
  
  // 验证节点和连线
  if (nodes.value.length === 0) {
    notify('请添加至少一个节点');
    return;
  }
  
  // 构建工作流数据
  const workflowData = {
    id: props.id,
    name: workflowName.value.trim(),
    description: workflowDescription.value.trim(),
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value)),
    status: publish ? 'published' : 'draft'
  };
  
  try {
    // 保存到服务器
    const savedWorkflow = await saveWorkflowData(workflowData);
    
    // 触发保存成功事件
    emit('workflow-saved', savedWorkflow);
  } catch (error) {
    console.error('保存工作流失败:', error);
    notify('保存工作流失败');
  }
};

// 监听保存事件
const handleSaveEvent = (event) => {
  const { publish } = event.detail || {};
  saveWorkflow(publish);
};

// 监听工作流数据变化
watch(() => workflow.value, (newWorkflow) => {
  if (newWorkflow) {
    workflowName.value = newWorkflow.name || '';
    workflowDescription.value = newWorkflow.description || '';
    nodes.value = JSON.parse(JSON.stringify(newWorkflow.nodes || []));
    edges.value = JSON.parse(JSON.stringify(newWorkflow.edges || []));
  }
}, { immediate: true });

// 挂载和卸载
onMounted(() => {
  // 监听全局保存事件
  window.addEventListener('save-workflow', handleSaveEvent);
  
  // 加载工作流数据
  loadWorkflowData();
});

onUnmounted(() => {
  // 移除全局事件监听
  window.removeEventListener('save-workflow', handleSaveEvent);
});
</script>

<style scoped>
.workflow-edit-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}

.workflow-create-form {
  padding: 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.workflow-designer {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.designer-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>