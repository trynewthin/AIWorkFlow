<template>
  <div class="node-palette">
    <h3 class="palette-title">节点类型</h3>
    <div class="palette-categories">
      <div class="category">
        <h4 class="category-title">输入/输出</h4>
        <div class="category-items">
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'input')">
            <div class="node-icon input-node"></div>
            <span class="node-label">输入节点</span>
          </div>
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'output')">
            <div class="node-icon output-node"></div>
            <span class="node-label">输出节点</span>
          </div>
        </div>
      </div>
      
      <div class="category">
        <h4 class="category-title">处理</h4>
        <div class="category-items">
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'transform')">
            <div class="node-icon transform-node"></div>
            <span class="node-label">转换节点</span>
          </div>
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'filter')">
            <div class="node-icon filter-node"></div>
            <span class="node-label">过滤节点</span>
          </div>
        </div>
      </div>
      
      <div class="category">
        <h4 class="category-title">AI</h4>
        <div class="category-items">
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'llm')">
            <div class="node-icon llm-node"></div>
            <span class="node-label">LLM节点</span>
          </div>
          <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'vector')">
            <div class="node-icon vector-node"></div>
            <span class="node-label">向量检索</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 节点面板组件
 */

// 开始拖拽节点类型
const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('nodeType', nodeType);
  event.dataTransfer.effectAllowed = 'copy';
};
</script>

<style scoped>
.node-palette {
  padding: 16px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  height: 100%;
}

.palette-title {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333;
}

.category {
  margin-bottom: 20px;
}

.category-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.category-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.node-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

.node-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-bottom: 4px;
}

.input-node {
  background-color: #bbdefb;
}

.output-node {
  background-color: #c8e6c9;
}

.transform-node {
  background-color: #e1bee7;
}

.filter-node {
  background-color: #ffe0b2;
}

.llm-node {
  background-color: #b3e5fc;
}

.vector-node {
  background-color: #f8bbd0;
}

.node-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style> 