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
import { defineProps, defineEmits } from 'vue';

// TODO: 定义事件
const emit = defineEmits(['file-uploaded']);

const fileInput = ref(null);

// TODO: 处理单个文件上传
const handleFile = async (file) => {
  try {
    // 调用上传服务保存文件记录
    const res = await ipc.invoke(ipcApiRoute.uploadFile, {
      sourcePath: file.path,
      filename: file.name,
      mimetype: file.type
    });
    console.log('上传结果', res);
    
    // 获取上传后文件的完整路径
    // 1. 优先使用返回的fullPath (如果服务层提供)
    // 2. 否则通过getFilePath API获取
    let filePath = res.fullPath;
    if (!filePath) {
      filePath = await ipc.invoke(ipcApiRoute.getFilePath, res.id);
    }
    console.log('文件路径', filePath);
    
    // 通知上传成功，返回上传信息供调用者使用
    emit('file-uploaded', {
      id: res.id,
      filename: res.filename,
      path: filePath,
      originalFile: file
    });
  } catch (error) {
    console.error('文件处理失败:', error);
  }
};

// TODO: 处理文件选择上传
const onFileChange = async (e) => {
  const files = e.target.files;
  for (const file of files) {
    await handleFile(file);
  }
  // 重置文件输入框，允许再次选择相同文件
  e.target.value = '';
};

// TODO: 处理文件拖拽上传
const onDrop = async (e) => {
  const files = e.dataTransfer.files;
  for (const file of files) {
    await handleFile(file);
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