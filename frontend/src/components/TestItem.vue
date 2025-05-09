<template>
  <li class="test-item">
    <div class="item-content">
      <span>{{ itemName }}</span>
      <!-- // 根据用户要求，测试结果暂时不显示 -->
    </div>
    <button @click="onButtonClick" class="test-button">{{ buttonText }}</button>
  </li>
</template>

<script>
export default {
  name: 'TestItem',
  props: {
    itemName: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      default: '执行操作' // // 默认按钮文字
    }
  },
  methods: {
    onButtonClick() {
      this.$emit('execute-test'); // // 发出事件通知父组件
    }
  }
};
</script>

<style scoped>
.test-item {
  display: flex; /* // 使用 flex 布局使内容和按钮在同一行 */
  justify-content: space-between; /* // 左右对齐 */
  align-items: center; /* // 垂直居中 */
  background-color: #f9f9f9; /* // 面板背景色 */
  padding: 15px;
  margin-bottom: 10px; /* // 项目间距 */
  border-radius: 8px; /* // 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* // 面板阴影 */
}

.item-content {
  flex-grow: 1; /* // 内容区域占据剩余空间 */
  text-align: left; /* // // 项目名称左对齐 */
}

.test-button {
  padding: 8px 15px;
  background-color: #007bff; /* // 按钮颜色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px; /* // 按钮与文字间距 */
}

.test-button:hover {
  background-color: #0056b3; /* // 按钮悬停颜色 */
}
</style> 