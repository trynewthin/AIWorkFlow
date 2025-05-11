<template>
  <div class="workflow-detail-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载工作流详情...</div>
    </div>
    
    <div v-else-if="!workflow" class="empty-state">
      <p>未找到工作流或加载失败</p>
      <router-link to="/Workflow" class="back-btn">返回列表</router-link>
    </div>
    
    <div v-else class="workflow-detail">
      <div class="workflow-info">
        <h1 class="workflow-title">{{ workflow.name }}</h1>
        <div class="workflow-meta">
          <span class="workflow-status" :class="statusClass">{{ statusText }}</span>
          <span class="workflow-date">更新时间: {{ formatDate(workflow.updatedAt) }}</span>
        </div>
        <p class="workflow-description">{{ workflow.description || '暂无描述' }}</p>
      </div>
      
      <div class="workflow-display">
        <!-- 只读的工作流图形展示 -->
        <div class="readonly-canvas">
          <div v-for="node in workflow.nodes" 
               :key="node.id" 
               class="readonly-node"
               :style="getNodeStyle(node)">
            <div class="node-header">
              <span class="node-type">{{ node.type }}</span>
            </div>
            <div class="node-content">
              <h3 class="node-name">{{ node.name }}</h3>
            </div>
          </div>
          
          <!-- 连线绘制 -->
          <svg class="connections-layer">
            <path v-for="(edge, index) in workflow.edges" 
                  :key="index"
                  :d="calculatePath(edge)"
                  class="edge-path" />
          </svg>
        </div>
      </div>
      
      <div class="execution-history" v-if="workflow.executions && workflow.executions.length > 0">
        <h2 class="section-title">执行历史</h2>
        <div class="history-list">
          <div v-for="execution in workflow.executions" 
               :key="execution.id"
               class="history-item"
               :class="{ 'success': execution.status === 'success', 'failed': execution.status === 'failed' }">
            <div class="history-info">
              <div class="history-status">
                {{ execution.status === 'success' ? '成功' : '失败' }}
              </div>
              <div class="history-time">
                {{ formatDate(execution.startTime) }}
              </div>
            </div>
            <div class="history-duration">
              耗时: {{ formatDuration(execution.duration) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流详情视图
 */
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useWorkflowStore from '@/store/workflow';

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
const { state, fetchDetail } = useWorkflowStore();

// 加载状态
const loading = computed(() => state.loading);

// 当前工作流数据
const workflow = computed(() => state.currentWorkflow);

// 工作流状态相关计算属性
const statusClass = computed(() => {
  if (!workflow.value) return '';
  switch (workflow.value.status) {
    case 'published': return 'status-published';
    case 'draft': return 'status-draft';
    default: return '';
  }
});

const statusText = computed(() => {
  if (!workflow.value) return '';
  switch (workflow.value.status) {
    case 'published': return '已发布';
    case 'draft': return '草稿';
    default: return '未知状态';
  }
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
    minute: '2-digit',
    second: '2-digit'
  });
};

// 格式化持续时间
const formatDuration = (ms) => {
  if (!ms) return '未知';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

// 获取节点样式
const getNodeStyle = (node) => {
  return {
    left: `${node.position?.x || 0}px`,
    top: `${node.position?.y || 0}px`,
  };
};

// 计算连线路径
const calculatePath = (edge) => {
  // 简单实现，实际项目中可能需要更复杂的路径计算
  const source = workflow.value.nodes.find(node => node.id === edge.source);
  const target = workflow.value.nodes.find(node => node.id === edge.target);
  
  if (!source || !target || !source.position || !target.position) {
    return '';
  }
  
  const sourceX = source.position.x + 150; // 节点宽度的一半
  const sourceY = source.position.y + 50;  // 节点高度的一半
  const targetX = target.position.x;
  const targetY = target.position.y + 50;  // 节点高度的一半
  
  // 简单的贝塞尔曲线
  return `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`;
};

// 组件挂载时加载数据
onMounted(async () => {
  if (props.id) {
    try {
      await fetchDetail(props.id);
    } catch (error) {
      console.error('加载工作流详情失败:', error);
    }
  }
});
</script>

<style scoped>
.workflow-detail-view {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 24px;
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

.workflow-info {
  margin-bottom: 24px;
}

.workflow-title {
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.workflow-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
}

.workflow-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-published {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-draft {
  background-color: #fff3e0;
  color: #ff9800;
}

.workflow-date {
  color: #666;
}

.workflow-description {
  font-size: 16px;
  color: #555;
  margin-bottom: 24px;
  line-height: 1.5;
}

.workflow-display {
  margin-bottom: 32px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  position: relative;
  min-height: 400px;
}

.readonly-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.readonly-node {
  position: absolute;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.node-header {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.node-type {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.node-content {
  padding: 12px;
}

.node-name {
  font-size: 16px;
  margin: 0;
  color: #333;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.edge-path {
  fill: none;
  stroke: #aaa;
  stroke-width: 2px;
  stroke-dasharray: 5, 5;
}

.section-title {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item.success {
  border-left: 4px solid #4caf50;
}

.history-item.failed {
  border-left: 4px solid #f44336;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-status {
  font-weight: 500;
}

.history-time {
  color: #666;
  font-size: 14px;
}

.history-duration {
  font-size: 14px;
  color: #666;
}
</style> 