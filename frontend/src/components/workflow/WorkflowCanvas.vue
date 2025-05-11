<template>
  <div class="canvas-container">
    <div class="canvas-toolbar">
      <button class="toolbar-btn" @click="zoomIn">
        <span>放大</span>
      </button>
      <button class="toolbar-btn" @click="zoomOut">
        <span>缩小</span>
      </button>
      <button class="toolbar-btn" @click="resetZoom">
        <span>重置</span>
      </button>
      <button class="toolbar-btn" @click="clearCanvas">
        <span>清空</span>
      </button>
    </div>
    
    <div 
      ref="canvasRef"
      class="canvas"
      @dragover="onDragOver"
      @drop="onDrop"
      @click="deselectAll"
    >
      <!-- 节点渲染 -->
      <div 
        v-for="node in nodes" 
        :key="node.id"
        :data-id="node.id"
        class="canvas-node"
        :class="{ 'selected': selectedNode === node.id }"
        :style="getNodeStyle(node)"
        @click.stop="selectNode(node.id)"
        @mousedown="startDrag($event, node.id)"
      >
        <div class="canvas-node-header" :class="node.type + '-header'">
          <span class="node-type-label">{{ getNodeTypeLabel(node.type) }}</span>
        </div>
        <div class="canvas-node-content">
          <h3 class="canvas-node-title">{{ node.name }}</h3>
        </div>
        <div class="canvas-node-ports">
          <div class="port port-out" @mousedown.stop="startConnection(node.id, 'out')"></div>
          <div class="port port-in" @mousedown.stop="startConnection(node.id, 'in')"></div>
        </div>
      </div>
      
      <!-- 连线渲染 -->
      <svg class="edges-container">
        <path 
          v-for="edge in edges" 
          :key="`${edge.source}-${edge.target}`"
          :d="calculateEdgePath(edge)"
          class="edge"
          @click.stop="selectEdge(edge)"
        ></path>
      </svg>
      
      <!-- 新连线 -->
      <svg class="temp-edge-container" v-if="tempEdge.active">
        <path
          :d="calculateTempEdgePath()"
          class="temp-edge"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup>
/**
 * 工作流画布组件
 */
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  /**
   * 画布中的节点
   */
  nodes: {
    type: Array,
    required: true
  },
  /**
   * 画布中的连线
   */
  edges: {
    type: Array,
    required: true
  },
  /**
   * 当前选中的节点ID
   */
  selectedNode: {
    type: String,
    default: null
  },
  /**
   * 当前选中的连线
   */
  selectedEdge: {
    type: Object,
    default: null
  }
});

const emit = defineEmits([
  'update:nodes', 
  'update:edges', 
  'update:selectedNode', 
  'update:selectedEdge',
  'node-created',
  'node-selected',
  'edge-selected',
  'deselect-all'
]);

// 画布引用
const canvasRef = ref(null);

// 画布状态
const zoomLevel = ref(1);
const dragState = ref({
  isDragging: false,
  nodeId: null,
  startX: 0,
  startY: 0,
  nodePosX: 0,
  nodePosY: 0
});

// 临时连线状态
const tempEdge = ref({
  active: false,
  sourceId: null,
  sourceType: null, // 'in' or 'out'
  targetX: 0,
  targetY: 0
});

// 根据节点类型获取显示名称
const getNodeTypeLabel = (type) => {
  const typeMap = {
    'input': '输入节点',
    'output': '输出节点',
    'transform': '转换节点',
    'filter': '过滤节点',
    'llm': 'LLM节点',
    'vector': '向量检索'
  };
  return typeMap[type] || type;
};

// 获取节点样式
const getNodeStyle = (node) => {
  return {
    transform: `translate(${node.position.x}px, ${node.position.y}px)`,
    zIndex: props.selectedNode === node.id ? 2 : 1
  };
};

// 获取节点默认配置
const getDefaultConfig = (type) => {
  switch (type) {
    case 'input':
      return { inputType: 'text' };
    case 'output':
      return { outputFormat: 'text' };
    case 'llm':
      return { 
        model: 'gpt-3.5-turbo', 
        promptTemplate: '请根据以下指令处理内容：\n\n{{input}}' 
      };
    case 'transform':
      return { transformType: 'text' };
    case 'filter':
      return { filterCondition: '' };
    case 'vector':
      return { vectorStore: 'default', similarityThreshold: 0.8 };
    default:
      return {};
  }
};

// 画布拖拽相关事件
const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

// 在画布上放置新节点
const onDrop = (event) => {
  event.preventDefault();
  const nodeType = event.dataTransfer.getData('nodeType');
  if (!nodeType) return;
  
  // 获取鼠标相对于画布的位置
  const canvasRect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - canvasRect.left;
  const y = event.clientY - canvasRect.top;
  
  // 创建新节点
  createNode(nodeType, x, y);
};

// 创建新节点
const createNode = (type, x, y) => {
  const newNode = {
    id: uuidv4(),
    type,
    name: `${getNodeTypeLabel(type)} ${props.nodes.length + 1}`,
    description: '',
    position: { x, y },
    config: getDefaultConfig(type)
  };
  
  const updatedNodes = [...props.nodes, newNode];
  emit('update:nodes', updatedNodes);
  emit('update:selectedNode', newNode.id);
  emit('node-created', newNode);
};

// 选择节点
const selectNode = (nodeId) => {
  emit('update:selectedNode', nodeId);
  emit('update:selectedEdge', null);
  emit('node-selected', nodeId);
};

// 取消选择
const deselectAll = () => {
  emit('update:selectedNode', null);
  emit('update:selectedEdge', null);
  emit('deselect-all');
};

// 开始拖拽节点
const startDrag = (event, nodeId) => {
  if (event.button !== 0) return; // 只处理左键点击
  
  const node = props.nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  dragState.value = {
    isDragging: true,
    nodeId,
    startX: event.clientX,
    startY: event.clientY,
    nodePosX: node.position.x,
    nodePosY: node.position.y
  };
  
  // 添加全局事件监听
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// 拖拽中
const onDrag = (event) => {
  if (!dragState.value.isDragging) return;
  
  const dx = event.clientX - dragState.value.startX;
  const dy = event.clientY - dragState.value.startY;
  
  // 更新节点位置
  const nodeIndex = props.nodes.findIndex(n => n.id === dragState.value.nodeId);
  if (nodeIndex === -1) return;
  
  const updatedNodes = [...props.nodes];
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    position: {
      x: dragState.value.nodePosX + dx,
      y: dragState.value.nodePosY + dy
    }
  };
  
  emit('update:nodes', updatedNodes);
};

// 停止拖拽
const stopDrag = () => {
  dragState.value.isDragging = false;
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

// 开始创建连线
const startConnection = (nodeId, portType) => {
  const node = props.nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  // 设置临时边的起点
  tempEdge.value = {
    active: true,
    sourceId: nodeId,
    sourceType: portType,
    targetX: 0,
    targetY: 0
  };
  
  // 添加临时事件监听
  document.addEventListener('mousemove', updateTempEdge);
  document.addEventListener('mouseup', finishConnection);
};

// 更新临时连线
const updateTempEdge = (event) => {
  if (!tempEdge.value.active) return;
  
  const canvasRect = canvasRef.value.getBoundingClientRect();
  tempEdge.value.targetX = event.clientX - canvasRect.left;
  tempEdge.value.targetY = event.clientY - canvasRect.top;
};

// 完成连线
const finishConnection = (event) => {
  if (!tempEdge.value.active) return;
  
  // 找到目标节点和端口
  const canvasRect = canvasRef.value.getBoundingClientRect();
  const targetX = event.clientX - canvasRect.left;
  const targetY = event.clientY - canvasRect.top;
  
  // 检查是否在某个节点的端口上
  const targetNodePort = findTargetNodePort(targetX, targetY);
  
  if (targetNodePort && targetNodePort.nodeId !== tempEdge.value.sourceId) {
    // 连接规则：出口连接入口
    if (
      (tempEdge.value.sourceType === 'out' && targetNodePort.portType === 'in') ||
      (tempEdge.value.sourceType === 'in' && targetNodePort.portType === 'out')
    ) {
      // 确定源节点和目标节点
      let source, target;
      if (tempEdge.value.sourceType === 'out') {
        source = tempEdge.value.sourceId;
        target = targetNodePort.nodeId;
      } else {
        source = targetNodePort.nodeId;
        target = tempEdge.value.sourceId;
      }
      
      // 检查是否已存在相同的边
      const edgeExists = props.edges.some(edge => 
        edge.source === source && edge.target === target
      );
      
      if (!edgeExists) {
        // 添加新的边
        const updatedEdges = [...props.edges, { source, target }];
        emit('update:edges', updatedEdges);
      }
    }
  }
  
  // 重置临时边
  tempEdge.value.active = false;
  
  // 移除临时事件监听
  document.removeEventListener('mousemove', updateTempEdge);
  document.removeEventListener('mouseup', finishConnection);
};

// 查找目标节点端口
const findTargetNodePort = (x, y) => {
  // 遍历所有节点及其端口
  for (const node of props.nodes) {
    const nodeEl = document.querySelector(`.canvas-node[data-id="${node.id}"]`);
    if (!nodeEl) continue;
    
    const nodeRect = nodeEl.getBoundingClientRect();
    const canvasRect = canvasRef.value.getBoundingClientRect();
    
    // 检查输入端口
    const inPortEl = nodeEl.querySelector('.port-in');
    if (inPortEl) {
      const inPortRect = inPortEl.getBoundingClientRect();
      const inPortX = inPortRect.left - canvasRect.left + inPortRect.width / 2;
      const inPortY = inPortRect.top - canvasRect.top + inPortRect.height / 2;
      
      if (
        Math.abs(x - inPortX) < 15 && 
        Math.abs(y - inPortY) < 15
      ) {
        return { nodeId: node.id, portType: 'in' };
      }
    }
    
    // 检查输出端口
    const outPortEl = nodeEl.querySelector('.port-out');
    if (outPortEl) {
      const outPortRect = outPortEl.getBoundingClientRect();
      const outPortX = outPortRect.left - canvasRect.left + outPortRect.width / 2;
      const outPortY = outPortRect.top - canvasRect.top + outPortRect.height / 2;
      
      if (
        Math.abs(x - outPortX) < 15 && 
        Math.abs(y - outPortY) < 15
      ) {
        return { nodeId: node.id, portType: 'out' };
      }
    }
  }
  
  return null;
};

// 计算边路径
const calculateEdgePath = (edge) => {
  const sourceNode = props.nodes.find(node => node.id === edge.source);
  const targetNode = props.nodes.find(node => node.id === edge.target);
  
  if (!sourceNode || !targetNode) return '';
  
  // 源节点的输出端口位置
  const sourceX = sourceNode.position.x + 150; // 节点宽度
  const sourceY = sourceNode.position.y + 50;  // 节点中心高度
  
  // 目标节点的输入端口位置
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + 50; // 节点中心高度
  
  // 贝塞尔曲线控制点
  const controlPoint1X = sourceX + Math.abs(targetX - sourceX) * 0.3;
  const controlPoint1Y = sourceY;
  const controlPoint2X = targetX - Math.abs(targetX - sourceX) * 0.3;
  const controlPoint2Y = targetY;
  
  return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
};

// 计算临时边路径
const calculateTempEdgePath = () => {
  if (!tempEdge.value.active) return '';
  
  const sourceNode = props.nodes.find(node => node.id === tempEdge.value.sourceId);
  if (!sourceNode) return '';
  
  let sourceX, sourceY;
  
  if (tempEdge.value.sourceType === 'out') {
    // 源节点的输出端口位置
    sourceX = sourceNode.position.x + 150; // 节点宽度
    sourceY = sourceNode.position.y + 50;  // 节点中心高度
  } else {
    // 源节点的输入端口位置
    sourceX = sourceNode.position.x;
    sourceY = sourceNode.position.y + 50; // 节点中心高度
  }
  
  // 目标位置（鼠标位置）
  const targetX = tempEdge.value.targetX;
  const targetY = tempEdge.value.targetY;
  
  // 计算控制点
  const dx = Math.abs(targetX - sourceX);
  const controlPoint1X = sourceX + (tempEdge.value.sourceType === 'out' ? dx * 0.3 : -dx * 0.3);
  const controlPoint1Y = sourceY;
  const controlPoint2X = targetX - (tempEdge.value.sourceType === 'out' ? dx * 0.3 : -dx * 0.3);
  const controlPoint2Y = targetY;
  
  return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
};

// 选择边
const selectEdge = (edge) => {
  emit('update:selectedEdge', edge);
  emit('update:selectedNode', null);
  emit('edge-selected', edge);
};

// 画布缩放控制
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2);
  updateZoom();
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5);
  updateZoom();
};

const resetZoom = () => {
  zoomLevel.value = 1;
  updateZoom();
};

const updateZoom = () => {
  if (!canvasRef.value) return;
  canvasRef.value.style.transform = `scale(${zoomLevel.value})`;
};

// 清空画布
const clearCanvas = () => {
  if (props.nodes.length === 0) return;
  
  if (confirm('确定要清空画布吗？所有节点和连线将被删除。')) {
    emit('update:nodes', []);
    emit('update:edges', []);
    emit('update:selectedNode', null);
    emit('update:selectedEdge', null);
  }
};

// 组件挂载和卸载
onMounted(() => {
  // 设置节点的 data-id 属性
  nextTick(() => {
    props.nodes.forEach(node => {
      const nodeEl = document.querySelector(`.canvas-node[key="${node.id}"]`);
      if (nodeEl) {
        nodeEl.setAttribute('data-id', node.id);
      }
    });
  });
});

onUnmounted(() => {
  // 移除全局事件监听
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('mousemove', updateTempEdge);
  document.removeEventListener('mouseup', finishConnection);
});
</script>

<style scoped>
.canvas-container {
  position: relative;
  overflow: hidden;
  background-color: #fafafa;
  background-image: 
    linear-gradient(rgba(220, 220, 220, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(220, 220, 220, 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
  height: 100%;
}

.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background-color: #eee;
}

.canvas {
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: top left;
}

.canvas-node {
  position: absolute;
  width: 300px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
  user-select: none;
}

.canvas-node.selected {
  box-shadow: 0 0 0 2px #2196f3, 0 2px 10px rgba(0, 0, 0, 0.15);
}

.canvas-node-header {
  padding: 8px 12px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.input-header {
  background-color: #bbdefb;
}

.output-header {
  background-color: #c8e6c9;
}

.transform-header {
  background-color: #e1bee7;
}

.filter-header {
  background-color: #ffe0b2;
}

.llm-header {
  background-color: #b3e5fc;
}

.vector-header {
  background-color: #f8bbd0;
}

.node-type-label {
  font-size: 12px;
  font-weight: 500;
  color: #555;
}

.canvas-node-content {
  padding: 12px;
}

.canvas-node-title {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.canvas-node-ports {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.port {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #aaa;
  pointer-events: auto;
  cursor: crosshair;
}

.port-in {
  top: 50%;
  left: -7px;
  transform: translateY(-50%);
}

.port-out {
  top: 50%;
  right: -7px;
  transform: translateY(-50%);
}

.edges-container,
.temp-edge-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.edge {
  fill: none;
  stroke: #aaa;
  stroke-width: 2px;
  pointer-events: auto;
  cursor: pointer;
}

.temp-edge {
  fill: none;
  stroke: #2196f3;
  stroke-width: 2px;
  stroke-dasharray: 5, 5;
}
</style> 