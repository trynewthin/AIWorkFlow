<template>
  <div class="p-4">
    <!-- TODO: 知识库详情页面 -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">知识库：{{ kbName }}</h1>
      <button @click="showAddModal = true" class="bg-black text-white py-2 px-4 rounded">添加文档</button>
    </div>
    <div class="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
      <div v-for="doc in documents" :key="doc.id" class="w-60 h-72 bg-gradient-to-l from-amber-200 to-amber-100 text-slate-600 border border-slate-300 grid grid-cols-2 justify-center p-4 gap-4 rounded-lg shadow-md">
        <!-- 卡片标题 -->
        <div class="col-span-2 text-lg font-bold capitalize truncate rounded-md">{{ doc.title }}</div>
        <!-- 卡片内容预览 -->
        <div class="col-span-2 rounded-md snippet-text">{{ doc.snippet }}</div>
        <!-- 打开文档按钮 -->
        <div class="col-span-1 flex justify-start">
          <button @click="openDocument(doc)" class="p-2 text-slate-600 hover:text-slate-800 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
        <!-- 删除文档按钮 -->
        <div class="col-span-1 flex justify-end">
          <button @click="confirmDelete(doc)" class="text-red-500 hover:text-red-700 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <AddDocumentModal v-model:visible="showAddModal" :knowledgeBaseId="kbId" @added="handleAdded" />
    <DocumentDetailModal v-model:visible="showDocModal" :document="currentDoc" />
    <ConfirmDeleteModal v-model:visible="showDeleteModal" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listKnowledgeBases, listDocuments, deleteDocument, getDocumentChunks } from '@/api/knowledge';
import AddDocumentModal from '@/components/knowledge/AddDocumentModal.vue';
import DocumentDetailModal from '@/components/knowledge/DocumentDetailModal.vue';
import ConfirmDeleteModal from '@/components/knowledge/ConfirmDeleteModal.vue';
import { useRoute } from 'vue-router';

// TODO: 定义路由参数 prop
const props = defineProps({ kbId: [String, Number] });
// TODO: 知识库名称
const kbName = ref('');

// TODO: 获取并设置知识库名称
const fetchKbName = async () => {
  try {
    const bases = await listKnowledgeBases();
    const base = bases.find(b => b.id == props.kbId);
    kbName.value = base ? base.name : '';
  } catch (e) {
    console.error('获取知识库名称失败:', e);
  }
};

// TODO: 响应式变量
const documents = ref([]);
const showAddModal = ref(false);
const showDocModal = ref(false);
const showDeleteModal = ref(false);
const currentDoc = ref(null);
let toDeleteDocId = null;

// TODO: 拉取文档列表并获取首块文本作为预览
const fetchDocuments = async () => {
  try {
    const docs = await listDocuments(props.kbId);
    const docsWithSnippets = await Promise.all(
      docs.map(async (d) => {
        let snippet = '';
        try {
          const chunks = await getDocumentChunks(d.id);
          snippet = chunks.length > 0 ? chunks[0].chunk_text : '';
        } catch (e) {
          console.error('获取文档分块失败:', e);
        }
        return { ...d, snippet };
      })
    );
    documents.value = docsWithSnippets;
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
  fetchKbName();
});
</script>

<style scoped>
/* TODO: 文档卡片多行文本截断 */
.snippet-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 