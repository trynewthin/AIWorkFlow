<template>
  <div>
    <div v-if="route.name === 'KnowledgeList'" class="p-4">
      <!-- TODO: 知识库列表页面 -->
      <div class="flex justify-end mb-4">
        <button @click="showCreateModal = true" class="bg-black text-white py-2 px-4 rounded">新建知识库</button>
      </div>
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center mb-4">
        <div v-for="kb in knowledgeBases" :key="kb.id" class="relative">
          <KnowledgeCard :id="kb.id" :name="kb.name" :description="kb.description" />
          <button @click="confirmDeleteBase(kb)" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <CreateKnowledgeBaseModal v-model:visible="showCreateModal" @created="handleCreated" />
      <ConfirmDeleteModal v-model:visible="showDeleteBaseModal" message="确认删除此知识库？" @confirm="handleDeleteBase" />
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listKnowledgeBases, deleteKnowledgeBase } from '@/api/knowledge';
import CreateKnowledgeBaseModal from '@/components/knowledge/CreateKnowledgeBaseModal.vue';
import KnowledgeCard from '@/components/knowledge/KnowledgeCard.vue';
import ConfirmDeleteModal from '@/components/knowledge/ConfirmDeleteModal.vue';

// TODO: 路由对象，用于判断渲染内容
const route = useRoute();
// TODO: 响应式变量
const knowledgeBases = ref([]);
const showCreateModal = ref(false);
const showDeleteBaseModal = ref(false);
let toDeleteBaseId = null;

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

// TODO: 确认删除知识库
const confirmDeleteBase = (kb) => {
  toDeleteBaseId = kb.id;
  showDeleteBaseModal.value = true;
};

// TODO: 执行删除知识库
const handleDeleteBase = async () => {
  try {
    await deleteKnowledgeBase(toDeleteBaseId);
    showDeleteBaseModal.value = false;
    await fetchKnowledgeBases();
  } catch (e) {
    console.error('删除知识库失败:', e);
  }
};

onMounted(() => {
  fetchKnowledgeBases();
});
</script>
