<template>
  <div class="upload-test-container">
    <h2>文件上传测试</h2>
    <!-- 文件上传区域 -->
    <FileUploader />

    <!-- 已上传文件列表 -->
    <h3>已上传文件列表</h3>
    <ul>
      <li v-for="file in files" :key="file.id">
        <!-- 显示文件信息 -->
        <span>{{ file.filename }} ({{ file.size }} bytes)</span>
        <!-- 下载文件 -->
        <button @click="download(file.id)">下载</button>
        <!-- 删除文件 -->
        <button @click="removeFile(file.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
// TODO: 引入Vue API
import { ref, onMounted } from 'vue';
// TODO: 引入IPC工具和路由
import { ipc } from '@/utils/ipcRenderer';
import ipcApiRoute from '@/api/ipcApiRoute';
// TODO: 引入上传组件
import FileUploader from '@/components/FileUploader.vue';

// 存储文件列表
const files = ref([]);

// 加载文件列表
const loadFiles = async () => {
  files.value = await ipc.invoke(ipcApiRoute.listFiles);
};

// 删除文件
const removeFile = async (id) => {
  await ipc.invoke(ipcApiRoute.deleteFile, id);
  await loadFiles();
};

// 下载文件（使用Electron启动外部打开）
const download = async (id) => {
  const filePath = await ipc.invoke(ipcApiRoute.getFilePath, id);
  // TODO: 使用 shell 打开文件
  ipc.invoke('shell/openPath', filePath);
};

// 页面挂载时加载列表
onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.upload-test-container {
  padding: 20px;
}
.upload-test-container h2 {
  margin-bottom: 1rem;
}
.upload-test-container ul {
  list-style: none;
  padding: 0;
}
.upload-test-container li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.upload-test-container button {
  margin-left: 0.5rem;
}
</style> 