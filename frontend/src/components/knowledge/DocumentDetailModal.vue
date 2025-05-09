<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 文档详情弹窗 -->
      <h3 class="text-xl font-bold mb-2">{{ document.title }}</h3>
      <div class="overflow-y-auto mb-4 flex-1">
        <ul class="list-disc list-inside">
          <li v-for="chunk in chunks" :key="chunk.chunk_id">{{ chunk.chunk_text }}</li>
        </ul>
      </div>
      <div class="flex justify-end">
        <button @click="close" class="bg-black text-white py-1 px-4 rounded">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { getDocumentChunks } from '@/api/knowledge';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean, document: Object });
const emit = defineEmits(['update:visible']);

// TODO: 文档分块数据
const chunks = ref([]);

// TODO: 监听弹窗可见性并获取文档分块
watch(() => props.visible, async (val) => {
  if (val && props.document && props.document.id) {
    try {
      chunks.value = await getDocumentChunks(props.document.id);
    } catch (e) {
      console.error('获取文档分块失败:', e);
    }
  }
});

// TODO: 关闭弹窗
const close = () => emit('update:visible', false);
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
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style> 