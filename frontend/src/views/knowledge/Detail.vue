<template>
  <div class="p-4">
    <!-- TODO: 知识库详情页面 -->
    <h1 class="text-2xl font-bold mb-4">知识库：{{ kbName }}</h1>
    <button @click="showAddModal = true" class="bg-blue-500 text-white py-2 px-4 rounded mb-4">添加文档</button>
    <ul>
      <li v-for="doc in documents" :key="doc.id" class="flex justify-between mb-2">
        <div>
          <span @click="openDocument(doc)" class="cursor-pointer text-blue-500">{{ doc.title }}</span>
        </div>
        <button @click="confirmDelete(doc)" class="text-red-500">删除</button>
      </li>
    </ul>
    <AddDocumentModal v-model:visible="showAddModal" :knowledgeBaseId="kbId" @added="handleAdded" />
    <DocumentDetailModal v-model:visible="showDocModal" :document="currentDoc" />
    <ConfirmDeleteModal v-model:visible="showDeleteModal" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listDocuments, deleteDocument } from '@/api/knowledge';
import AddDocumentModal from '@/components/knowledge/AddDocumentModal.vue';
import DocumentDetailModal from '@/components/knowledge/DocumentDetailModal.vue';
import ConfirmDeleteModal from '@/components/knowledge/ConfirmDeleteModal.vue';
import { useRoute } from 'vue-router';

// TODO: 获取路由参数
const route = useRoute();
const kbId = route.params.kbId;
const kbName = ref('');

// TODO: 响应式变量
const documents = ref([]);
const showAddModal = ref(false);
const showDocModal = ref(false);
const showDeleteModal = ref(false);
const currentDoc = ref(null);
let toDeleteDocId = null;

// TODO: 拉取文档列表
const fetchDocuments = async () => {
  try {
    documents.value = await listDocuments(kbId);
  } catch (e) {
    console.error('获取文档列表失败:', e);
  }
};

// TODO: 添加文档后刷新列表
const handleAdded = () => {
  showAddModal.value = false;
  fetchDocuments();
};

// TODO: 打开文档详情
const openDocument = (doc) => {
  currentDoc.value = doc;
  showDocModal.value = true;
};

// TODO: 确认删除
const confirmDelete = (doc) => {
  toDeleteDocId = doc.id;
  showDeleteModal.value = true;
};

// TODO: 执行删除
const handleDelete = async () => {
  try {
    await deleteDocument(toDeleteDocId);
    showDeleteModal.value = false;
    fetchDocuments();
  } catch (e) {
    console.error('删除文档失败:', e);
  }
};

onMounted(() => {
  fetchDocuments();
  // TODO: TODO: 根据 kbId 获取知识库名称
  kbName.value = '';
});
</script> 