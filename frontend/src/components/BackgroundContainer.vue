<template>
  <div class="background-container" :style="backgroundStyle"></div>
</template>

<script>
// TODO: 背景容器组件
import { defineComponent } from 'vue';
import useBackgroundStore from '@/utils/background';

export default defineComponent({
  name: 'BackgroundContainer',
  setup() {
    const { backgroundStyle } = useBackgroundStore();
    return { backgroundStyle };
  }
});
</script>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* TODO: 保证在最底层 */
  transition: background 0.5s ease; /* TODO: 平滑过渡 */
}
</style> 