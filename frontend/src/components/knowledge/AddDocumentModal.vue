<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 添加文档弹窗 -->
      <h3 class="text-xl font-bold mb-4">添加文档</h3>
      <input v-model="form.title" placeholder="标题" class="border rounded p-2 w-full mb-2" />
      <textarea v-model="form.content" placeholder="内容" class="border rounded p-2 w-full mb-4"></textarea>
      <div class="flex justify-end">
        <button @click="cancel" class="mr-2">取消</button>
        <button @click="add" class="bg-black text-white py-1 px-4 rounded">添加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ingestDocument } from '@/api/knowledge';
import { defineProps, defineEmits } from 'vue';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean, knowledgeBaseId: String });
const emit = defineEmits(['update:visible', 'added']);

// TODO: 表单数据
const form = ref({ title: '', content: '' });

// TODO: 监听可见性，重置表单
watch(() => props.visible, (val) => {
  if (val) form.value = { title: '', content: '' };
});

// TODO: 取消
const cancel = () => emit('update:visible', false);

// TODO: 添加
const add = async () => {
  try {
    await ingestDocument({ knowledgeBaseId: props.knowledgeBaseId, ...form.value });
    emit('added');
  } catch (e) {
    console.error('添加文档失败:', e);
  }
};
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