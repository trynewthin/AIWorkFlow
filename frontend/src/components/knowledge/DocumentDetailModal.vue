<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 文档详情弹窗 -->
      <h3 class="text-xl font-bold mb-2">{{ document.title }}</h3>
      <ul class="list-disc list-inside mb-4">
        <li v-for="chunk in chunks" :key="chunk.chunk_id">{{ chunk.chunk_text }}</li>
      </ul>
      <div class="flex justify-end">
        <button @click="close" class="bg-gray-500 text-white py-1 px-4 rounded">关闭</button>
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