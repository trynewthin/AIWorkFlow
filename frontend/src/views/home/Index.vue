<template>
  <div>
    <!-- 欢迎区域 -->
    <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">欢迎使用 AI 工作流平台</h1>
        <p class="text-lg text-gray-600 mb-6">
          这是一个强大的 AI 辅助工作平台，集成了知识库管理、向量存储和智能问答功能，帮助您更高效地处理信息和知识。
        </p>
        <div class="flex flex-wrap gap-4">
          <button 
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            @click="navigateTo('/knowledge-base/list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            进入知识库
          </button>
          <button 
            class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            @click="navigateTo('/chat')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            开始对话
          </button>
        </div>
      </div>
    </div>

    <!-- 功能区块 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="text-blue-600 bg-blue-100 p-3 rounded-lg inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">知识库管理</h3>
        <p class="text-gray-600 mb-4">
          创建和管理您的专业知识库，支持多种数据源的导入和管理，自动向量化存储。
        </p>
        <button 
          class="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          @click="navigateTo('/knowledge-base/list')"
        >
          查看知识库
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="text-green-600 bg-green-100 p-3 rounded-lg inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">智能问答</h3>
        <p class="text-gray-600 mb-4">
          基于您的知识库内容进行智能问答，支持上下文理解和多轮对话，提供精准回复。
        </p>
        <button 
          class="text-green-600 hover:text-green-800 font-medium flex items-center"
          @click="navigateTo('/chat')"
        >
          开始对话
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="text-purple-600 bg-purple-100 p-3 rounded-lg inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">系统设置</h3>
        <p class="text-gray-600 mb-4">
          自定义系统配置，包括模型参数、向量嵌入设置和界面偏好等个性化选项。
        </p>
        <button 
          class="text-purple-600 hover:text-purple-800 font-medium flex items-center"
          @click="navigateTo('/settings')"
        >
          查看设置
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 状态概览 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">系统状态</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="text-sm text-gray-500">知识库总数</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">{{ stats.knowledgeBaseCount || 0 }}</div>
        </div>
        
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-sm text-gray-500">文档总数</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">{{ stats.documentCount || 0 }}</div>
        </div>
        
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span class="text-sm text-gray-500">向量总数</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">{{ stats.vectorCount || 0 }}</div>
        </div>
        
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span class="text-sm text-gray-500">对话总数</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">{{ stats.conversationCount || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">最近活动</h2>
      <div v-if="recentActivities.length === 0" class="text-center py-8">
        <p class="text-gray-500">暂无最近活动记录</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="(activity, index) in recentActivities" :key="index" class="flex items-start p-4 border-b border-gray-100 last:border-0">
          <div class="flex-shrink-0 mr-4">
            <div :class="`bg-${activityTypeColor(activity.type)}-100 text-${activityTypeColor(activity.type)}-600 p-2 rounded-full`">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center">
              <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
              <span class="text-xs text-gray-500">{{ formatDate(activity.timestamp) }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ activity.detail }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // // TODO: 移除 computed 因为暂时未使用
import { useRouter } from 'vue-router';

const router = useRouter();

// 系统状态统计
const stats = ref({
  knowledgeBaseCount: 0,
  documentCount: 0,
  vectorCount: 0,
  conversationCount: 0
});

// 最近活动
const recentActivities = ref([]);

// 获取系统状态统计
const fetchStats = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    stats.value = {
      knowledgeBaseCount: 5,
      documentCount: 28,
      vectorCount: 1240,
      conversationCount: 17
    };
  } catch (error) {
    console.error('获取系统统计数据出错:', error);
  }
};

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    recentActivities.value = [
      {
        type: 'knowledge_base',
        description: '创建了新的知识库',
        detail: '创建了「产品文档」知识库',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        type: 'document',
        description: '添加了新文档',
        detail: '向「产品文档」知识库添加了「用户手册 v1.0」',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        type: 'conversation',
        description: '进行了对话',
        detail: '使用「产品文档」知识库进行了问答',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ];
  } catch (error) {
    console.error('获取最近活动数据出错:', error);
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  return date.toLocaleString();
};

// 根据活动类型获取对应颜色
const activityTypeColor = (type) => {
  const colorMap = {
    knowledge_base: 'blue',
    document: 'green',
    conversation: 'yellow',
    setting: 'purple'
  };
  return colorMap[type] || 'gray';
};

// 路由导航
const navigateTo = (path) => {
  router.push(path);
};

// 组件挂载时加载数据
onMounted(() => {
  fetchStats();
  fetchRecentActivities();
});
</script> 