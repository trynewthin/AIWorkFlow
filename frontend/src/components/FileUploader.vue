<template>
  <div 
    class="upload-area" 
    @dragover.prevent 
    @drop.prevent="onDrop"
  >
    <!-- TODO: 拖拽或点击上传文件 -->
    <p>将文件拖到此处，或</p>
    <input 
      ref="fileInput" 
      type="file" 
      multiple 
      @change="onFileChange" 
      style="display:none"
    />
    <button @click="fileInput.click()">选择文件上传</button>
  </div>
</template>

<script setup>
// TODO: 引入Vue API
import { ref } from 'vue';
// TODO: 引入IPC工具和路由配置
import { ipc } from '@/utils/ipcRenderer';
import ipcApiRoute from '@/api/ipcApiRoute';

const fileInput = ref(null);

// TODO: 处理文件选择上传
const onFileChange = async (e) => {
  const files = e.target.files;
  for (const file of files) {
    try {
      const res = await ipc.invoke(ipcApiRoute.uploadFile, {
        sourcePath: file.path,
        filename: file.name,
        mimetype: file.type
      });
      console.log('上传结果', res);
    } catch (error) {
      console.error('上传失败', error);
    }
  }
};

// TODO: 处理文件拖拽上传
const onDrop = async (e) => {
  const files = e.dataTransfer.files;
  for (const file of files) {
    try {
      const res = await ipc.invoke(ipcApiRoute.uploadFile, {
        sourcePath: file.path,
        filename: file.name,
        mimetype: file.type
      });
      console.log('拖拽上传结果', res);
    } catch (error) {
      console.error('上传失败', error);
    }
  }
};
</script>

<style scoped>
.upload-area {
  padding: 2rem;
  border: 2px dashed #ccc;
  text-align: center;
  border-radius: 4px;
}
.upload-area:hover {
  border-color: #409eff;
}
</style> 