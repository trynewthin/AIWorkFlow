<template>
  <div class="workflow-create-view">
    <WorkflowToolbar 
      :title="workflowName || '创建工作流'" 
      @save="saveWorkflow"
    />
    
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
      <div class="designer-layout">
        <NodePalette />
        
        <WorkflowCanvas 
          v-model:nodes="nodes"
          v-model:edges="edges"
          v-model:selectedNode="selectedNode"
          v-model:selectedEdge="selectedEdge"
          @node-selected="handleNodeSelected"
          @edge-selected="handleEdgeSelected"
          @deselect-all="handleDeselectAll"
        />
        
        <NodePropertyPanel 
          :selectedNode="getSelectedNode"
          @update-property="updateNodeProperty"
          @update-config="updateNodeConfig"
          @delete-node="deleteSelectedNode"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流创建视图
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import useWorkflowStore from '@/store/workflow';
import useNotificationStore from '@/utils/notification';

// 组件导入
import WorkflowToolbar from '@/components/workflow/WorkflowToolbar.vue';
import NodePalette from '@/components/workflow/NodePalette.vue';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas.vue';
import NodePropertyPanel from '@/components/workflow/NodePropertyPanel.vue';

// 路由相关
const router = useRouter();

// 获取工作流状态管理和通知
const { saveWorkflowData, resetCurrentWorkflow } = useWorkflowStore();
const { notify } = useNotificationStore();

// 定义事件
const emit = defineEmits(['workflow-saved']);

// 基本信息
const workflowName = ref('');
const workflowDescription = ref('');

// 画布数据
const nodes = ref([]);
const edges = ref([]);

// 画布状态
const selectedNode = ref(null);
const selectedEdge = ref(null);

// 获取选中的节点
const getSelectedNode = computed(() => {
  return nodes.value.find(node => node.id === selectedNode.value) || null;
});

// 处理节点选中
const handleNodeSelected = (nodeId) => {
  selectedNode.value = nodeId;
  selectedEdge.value = null;
};

// 处理边选中
const handleEdgeSelected = (edge) => {
  selectedEdge.value = edge;
  selectedNode.value = null;
};

// 处理取消选择
const handleDeselectAll = () => {
  selectedNode.value = null;
  selectedEdge.value = null;
};

// 更新节点属性
const updateNodeProperty = ({ property, value }) => {
  if (!selectedNode.value) return;
  
  const nodeIndex = nodes.value.findIndex(node => node.id === selectedNode.value);
  if (nodeIndex === -1) return;
  
  const updatedNodes = [...nodes.value];
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    [property]: value
  };
  
  nodes.value = updatedNodes;
};

// 更新节点配置
const updateNodeConfig = ({ property, value }) => {
  if (!selectedNode.value) return;
  
  const nodeIndex = nodes.value.findIndex(node => node.id === selectedNode.value);
  if (nodeIndex === -1) return;
  
  const updatedNodes = [...nodes.value];
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    config: {
      ...updatedNodes[nodeIndex].config,
      [property]: value
    }
  };
  
  nodes.value = updatedNodes;
};

// 删除选中的节点
const deleteSelectedNode = () => {
  if (!selectedNode.value) return;
  
  // 删除相关的边
  edges.value = edges.value.filter(edge => 
    edge.source !== selectedNode.value && edge.target !== selectedNode.value
  );
  
  // 删除节点
  nodes.value = nodes.value.filter(node => node.id !== selectedNode.value);
  selectedNode.value = null;
};

// 保存工作流
const saveWorkflow = async ({ publish }) => {
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
    name: workflowName.value.trim(),
    description: workflowDescription.value.trim(),
    nodes: JSON.parse(JSON.stringify(nodes.value)),
    edges: JSON.parse(JSON.stringify(edges.value)),
    status: publish ? 'published' : 'draft'
  };
  
  try {
    // 保存到服务器
    const savedWorkflow = await saveWorkflowData(workflowData);
    
    // 显示保存成功消息
    notify(publish ? '工作流已发布' : '草稿已保存');
    
    // 触发保存成功事件
    emit('workflow-saved', savedWorkflow);
    
    // 跳转到工作流列表
    setTimeout(() => {
      router.push('/workflow');
    }, 1500);
  } catch (error) {
    console.error('保存工作流失败:', error);
    notify('保存工作流失败');
  }
};

// 挂载和卸载
onMounted(() => {
  // 重置当前工作流
  resetCurrentWorkflow();
});
</script>

<style scoped>
.workflow-create-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
.form-textarea,
.form-select {
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

.designer-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  height: 100%;
}
</style> 