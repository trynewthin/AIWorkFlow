<template>
  <div class="properties-panel" v-if="selectedNode">
    <h3 class="panel-title">节点属性</h3>
    <div class="properties-form">
      <div class="form-group">
        <label>节点名称</label>
        <input 
          type="text" 
          v-model="selectedNode.name" 
          class="form-input"
          @input="updateNodeProperty('name', $event.target.value)"
        />
      </div>
      
      <div class="form-group">
        <label>节点描述</label>
        <textarea 
          v-model="selectedNode.description" 
          class="form-textarea"
          @input="updateNodeProperty('description', $event.target.value)"
        ></textarea>
      </div>
      
      <!-- 根据节点类型显示不同的属性表单 -->
      <div v-if="selectedNode.type === 'input'" class="node-specific-props">
        <div class="form-group">
          <label>输入类型</label>
          <select 
            v-model="selectedNode.config.inputType" 
            class="form-select"
            @change="updateNodeConfig('inputType', $event.target.value)"
          >
            <option value="text">文本</option>
            <option value="file">文件</option>
            <option value="api">API</option>
          </select>
        </div>
      </div>
      
      <div v-else-if="selectedNode.type === 'output'" class="node-specific-props">
        <div class="form-group">
          <label>输出格式</label>
          <select 
            v-model="selectedNode.config.outputFormat" 
            class="form-select"
            @change="updateNodeConfig('outputFormat', $event.target.value)"
          >
            <option value="text">文本</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>
      
      <div v-else-if="selectedNode.type === 'llm'" class="node-specific-props">
        <div class="form-group">
          <label>模型选择</label>
          <select 
            v-model="selectedNode.config.model" 
            class="form-select"
            @change="updateNodeConfig('model', $event.target.value)"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
        <div class="form-group">
          <label>Prompt 模板</label>
          <textarea 
            v-model="selectedNode.config.promptTemplate" 
            class="form-textarea"
            @input="updateNodeConfig('promptTemplate', $event.target.value)"
          ></textarea>
        </div>
      </div>
      
      <!-- 其他节点类型的属性 -->
      
      <div class="panel-actions">
        <button class="delete-node-btn" @click="deleteNode">删除节点</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 节点属性面板组件
 */
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  /**
   * 当前选中的节点
   */
  selectedNode: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update-property', 'update-config', 'delete-node']);

// 更新节点属性
const updateNodeProperty = (property, value) => {
  emit('update-property', { property, value });
};

// 更新节点配置
const updateNodeConfig = (property, value) => {
  emit('update-config', { property, value });
};

// 删除节点
const deleteNode = () => {
  emit('delete-node');
};
</script>

<style scoped>
.properties-panel {
  padding: 16px;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  height: 100%;
}

.panel-title {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.properties-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin-bottom: 8px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.node-specific-props {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.panel-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.delete-node-btn {
  padding: 8px 12px;
  background-color: #ffebee;
  color: #f44336;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  cursor: pointer;
}

.delete-node-btn:hover {
  background-color: #ffcdd2;
}
</style> 