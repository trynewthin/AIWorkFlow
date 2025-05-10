<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 添加文档弹窗 -->
      <h3 class="text-xl font-bold mb-4">添加文档</h3>
      <!-- 使用文件上传组件并接收上传结果 -->
      <FileUploader @file-uploaded="onFileUploaded" />
      <div class="flex justify-end mt-4">
        <button @click="cancel" class="mr-2">取消</button>
        <button @click="close" class="bg-black text-white py-1 px-4 rounded">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import FileUploader from '@/components/FileUploader.vue';
import { ingestFromPath } from '@/api/knowledge';
import { defineProps, defineEmits } from 'vue';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean, knowledgeBaseId: String });
const emit = defineEmits(['update:visible', 'added']);

// TODO: 表单数据
const form = ref({ title: '' });

// TODO: 监听可见性，重置表单
watch(() => props.visible, (val) => {
  if (val) form.value = { title: '' };
});

// TODO: 取消
const cancel = () => emit('update:visible', false);

// TODO: 关闭
const close = () => {
  emit('update:visible', false);
  emit('added');
};

// TODO: 处理文件上传成功事件，调用知识库入库API
const onFileUploaded = async (fileInfo) => {
  try {
    // 使用表单中的标题，如果没有则使用文件名
    const title = fileInfo.filename;
    
    // 调用入库API
    await ingestFromPath({
      knowledgeBaseId: props.knowledgeBaseId,
      sourcePath: fileInfo.path,
      metadata: { title }
    });
    
    console.log('文档已入库');
    // 通知父组件入库成功
    emit('added');
  } catch (error) {
    console.error('文档入库失败:', error);
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
  max-width: 500px; /* 增加宽度以适应文件上传组件 */
}
</style> 