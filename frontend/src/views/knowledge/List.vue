<template>
  <div class="p-4">
    <!-- TODO: 知识库列表页面 -->
    <h1 class="text-2xl font-bold mb-4">知识库列表</h1>
    <button @click="showCreateModal = true" class="bg-green-500 text-white py-2 px-4 rounded mb-4">新建知识库</button>
    <!-- 使用 KnowledgeCard 渲染知识库卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mb-4">
      <KnowledgeCard v-for="kb in knowledgeBases" :key="kb.id" :id="kb.id" :name="kb.name" :description="kb.description" />
    </div>
    <CreateKnowledgeBaseModal v-model:visible="showCreateModal" @created="handleCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listKnowledgeBases } from '@/api/knowledge';
import CreateKnowledgeBaseModal from '@/components/knowledge/CreateKnowledgeBaseModal.vue';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard.vue';

// TODO: 响应式变量
const knowledgeBases = ref([]);
const showCreateModal = ref(false);

// TODO: 拉取知识库列表
const fetchKnowledgeBases = async () => {
  try {
    knowledgeBases.value = await listKnowledgeBases();
  } catch (e) {
    console.error('获取知识库列表失败:', e);
  }
};

// TODO: 创建后刷新列表
const handleCreated = async () => {
  await fetchKnowledgeBases();
  showCreateModal.value = false;
};

onMounted(() => {
  fetchKnowledgeBases();
});
</script> 