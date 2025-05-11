<template>
  <div class="execution-progress" v-if="visible">
    <div class="execution-progress__header">
      <div class="execution-progress__title">
        <span class="status-indicator" :class="statusClass"></span>
        工作流执行{{ statusText }}
      </div>
      <div class="execution-progress__actions">
        <button class="close-btn" @click="close">关闭</button>
      </div>
    </div>
    
    <div class="execution-progress__content">
      <div class="progress-bar" v-if="status === 'running'">
        <div class="progress-bar__inner" :style="{ width: `${progress}%` }"></div>
      </div>
      
      <div class="execution-logs">
        <div v-if="logs.length === 0" class="no-logs">
          {{ status === 'running' ? '等待执行日志...' : '无执行日志' }}
        </div>
        <div v-else class="logs-container">
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            class="log-item"
            :class="{ 'log-error': log.type === 'error' }"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流执行进度组件
 */
import { ref, computed, watch } from 'vue';
import useWorkflowStore from '@/store/workflow';

// 获取工作流状态管理
const { state } = useWorkflowStore();

// 组件状态
const visible = ref(false);
const status = ref('idle'); // idle, running, completed, failed
const progress = ref(0);
const logs = ref([]);

// 根据执行状态计算样式类名
const statusClass = computed(() => {
  switch (status.value) {
    case 'running': return 'status-running';
    case 'completed': return 'status-completed';
    case 'failed': return 'status-failed';
    default: return '';
  }
});

// 根据执行状态计算文本
const statusText = computed(() => {
  switch (status.value) {
    case 'running': return '中';
    case 'completed': return '完成';
    case 'failed': return '失败';
    default: return '';
  }
});

// 监听工作流执行状态变化
watch(() => state.executionStatus, (newStatus) => {
  if (newStatus) {
    status.value = newStatus;
    visible.value = true;
    
    // 如果执行完成或失败，设置进度为100%
    if (newStatus === 'completed' || newStatus === 'failed') {
      progress.value = 100;
    } else if (newStatus === 'running') {
      // 模拟进度，实际应该从后端获取
      simulateProgress();
    }
  }
});

// 模拟进度，实际项目中应替换为实时进度
const simulateProgress = () => {
  progress.value = 0;
  const interval = setInterval(() => {
    // 随机增加1-5%的进度
    const increment = Math.random() * 4 + 1;
    progress.value = Math.min(progress.value + increment, 95);
    
    // 添加模拟日志
    if (Math.random() > 0.7) {
      addLog(`执行节点: ${Math.floor(progress.value)}% 完成`);
    }
    
    // 如果状态不是running，清除定时器
    if (state.executionStatus !== 'running') {
      clearInterval(interval);
      
      // 如果是completed状态，添加完成日志
      if (state.executionStatus === 'completed') {
        progress.value = 100;
        addLog('工作流执行完成', 'success');
      } else if (state.executionStatus === 'failed') {
        addLog('工作流执行失败', 'error');
      }
    }
  }, 500);
};

// 添加日志
const addLog = (message, type = 'info') => {
  logs.value.push({
    timestamp: new Date(),
    message,
    type
  });
  
  // 保持最多显示50条日志
  if (logs.value.length > 50) {
    logs.value.shift();
  }
};

// 格式化时间
const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  });
};

// 关闭进度弹窗
const close = () => {
  visible.value = false;
  // 不清空日志，方便用户再次打开查看
};

// 向外暴露方法
defineExpose({
  // 显示进度
  show: () => {
    visible.value = true;
  },
  // 隐藏进度
  hide: () => {
    visible.value = false;
  },
  // 添加日志
  addLog,
  // 清空日志
  clearLogs: () => {
    logs.value = [];
  }
});
</script>

<style scoped>
.execution-progress {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.execution-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.execution-progress__title {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-running {
  background-color: #2196f3;
  animation: pulse 1.5s infinite;
}

.status-completed {
  background-color: #4caf50;
}

.status-failed {
  background-color: #f44336;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.execution-progress__content {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__inner {
  height: 100%;
  background-color: #2196f3;
  transition: width 0.3s ease;
}

.execution-logs {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #f8f8f8;
  border-radius: 4px;
  height: 200px;
}

.no-logs {
  padding: 16px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.logs-container {
  padding: 8px;
}

.log-item {
  padding: 4px 8px;
  font-size: 12px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  display: flex;
  gap: 8px;
}

.log-error {
  color: #f44336;
  background-color: #ffebee;
}

.log-time {
  color: #888;
  white-space: nowrap;
}

.log-message {
  word-break: break-all;
}
</style> 