<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 删除确认弹窗 -->
      <h3 class="text-xl font-bold mb-4">{{ message }}</h3>
      <div class="flex justify-end">
        <button @click="cancel" class="mr-2">取消</button>
        <button @click="confirm" class="bg-red-500 text-white py-1 px-4 rounded">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean, message: { type: String, default: '确认删除？' } });
const emit = defineEmits(['update:visible', 'confirm']);

// TODO: 取消
const cancel = () => emit('update:visible', false);

// TODO: 确认删除
const confirm = () => emit('confirm');
</script>

<style scoped>
/* TODO: 弹窗遮罩层样式 (复用 CreateKnowledgeBaseModal) */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.3);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* TODO: 弹窗容器样式 (复用 CreateKnowledgeBaseModal) */
.modal-container {
  background-color: #fff;
  padding: 1rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 16px;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 400px;
}
</style> 