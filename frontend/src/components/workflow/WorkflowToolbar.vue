<template>
  <div class="workflow-toolbar">
    <div class="toolbar-left">
      <button class="toolbar-btn" @click="goBack">
        <span>返回</span>
      </button>
      <h2 class="workflow-title">{{ title || '创建工作流' }}</h2>
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn secondary" @click="saveAsDraft">
        <span>保存草稿</span>
      </button>
      <button class="toolbar-btn primary" @click="publish">
        <span>发布工作流</span>
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流工具栏组件
 */
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  /**
   * 工作流标题
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * 是否为编辑模式
   */
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'publish']);
const router = useRouter();

// 返回上一页
const goBack = () => {
  router.push('/workflow');
};

// 保存为草稿
const saveAsDraft = () => {
  emit('save', { publish: false });
};

// 发布工作流
const publish = () => {
  emit('save', { publish: true });
};
</script>

<style scoped>
.workflow-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.workflow-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.toolbar-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.toolbar-btn.secondary {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  color: #555;
}

.toolbar-btn.secondary:hover {
  background-color: #eeeeee;
}

.toolbar-btn.primary {
  background-color: #1976d2;
  color: white;
}

.toolbar-btn.primary:hover {
  background-color: #1565c0;
}
</style> 