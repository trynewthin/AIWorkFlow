<template>
  <div class="test-page-container">
    <ul class="test-item-list">
      <TestItem 
        item-name="连接测试" 
        button-text="执行测试"
        @execute-test="handleConnectionTest"
      />
      <TestItem
        item-name="文件上传测试"
        button-text="进入测试页"
        @execute-test="goUploadTest"
      />
      <!-- // TODO: 未来可以添加更多测试项 -->
    </ul>
  </div>
</template>

<script>
import { checkConnection } from '@/api/connection';
import TestItem from '@/components/TestItem.vue'; // // 导入 TestItem 组件
import useNotificationStore from '@/utils/notification'; // // 导入通知存储
import { useRouter } from 'vue-router';

const { notify } = useNotificationStore(); // // 获取 notify 方法

export default {
  name: 'TestConnectionPage',
  components: {
    TestItem
  },
  setup() {
    const router = useRouter();
    const goUploadTest = () => {
      router.push({ name: 'UploadTest' });
    };
    async function handleConnectionTest() { // // 方法重命名并修改以适应新组件
      try {
        const response = await checkConnection();
        notify('连接测试成功: ' + response.message); // // 使用通知显示结果
      } catch (error) {
        notify('连接测试失败: ' + error.message); // // 使用通知显示失败
      }
    }
    return {
      handleConnectionTest,
      goUploadTest
    };
  }
};
</script>

<style scoped>
.test-page-container {
  padding: 20px;
}

.test-item-list {
  list-style-type: none; /* // 移除列表默认样式 */
  padding: 0;
}

/* // // .test-item 相关样式已移至 TestItem.vue 组件 */
/* // // .item-content 相关样式已移至 TestItem.vue 组件 */
/* // // .result-text 相关样式已移除 */
/* // // .test-button 相关样式已移至 TestItem.vue 组件 */
</style> 