<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 新建知识库弹窗 -->
      <h3 class="text-xl font-bold mb-4">新建知识库</h3>
      <input v-model="form.name" placeholder="名称" class="border rounded p-2 w-full mb-2" />
      <textarea v-model="form.description" placeholder="描述" class="border rounded p-2 w-full mb-4"></textarea>
      <div class="flex justify-end">
        <button @click="cancel" class="mr-2">取消</button>
        <button @click="create" class="bg-green-500 text-white py-1 px-4 rounded">创建</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// TODO: 导入依赖
import { ref, watch } from 'vue';
import { createKnowledgeBase } from '@/api/knowledge';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'created']);

// TODO: 表单数据
const form = ref({ name: '', description: '' });

// TODO: 监听可见性，重置表单
watch(() => props.visible, (val) => {
  if (val) form.value = { name: '', description: '' };
});

// TODO: 取消弹窗
const cancel = () => emit('update:visible', false);

// TODO: 创建知识库
const create = async () => {
  try {
    // 构造纯数据对象，避免向 IPC 传递 reactive 对象
    const payload = { name: form.value.name, description: form.value.description };
    const newKb = await createKnowledgeBase(payload);
    emit('created', newKb);
  } catch (e) {
    console.error('创建知识库失败:', e);
  }
};
</script>

<style scoped>
/* TODO: 弹窗遮罩层样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* TODO: 弹窗容器样式 */
.modal-container {
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 400px;
}
</style>