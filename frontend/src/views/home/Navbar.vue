<!-- From Uiverse.io by 0x3ther --> 
<template>
  <div class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-md p-4 z-50">
    <div class="flex items-center gap-3">
      <button
        v-for="button in buttons"
        :key="button.id"
        @click="handleButtonClick(button.action)"
        class="relative inline-flex items-center justify-center gap-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 h-9 rounded-md px-3 shadow-sm border border-slate-200 dark:border-slate-600 group"
        :class="button.customClass || ''"
      >
        <span v-if="button.icon" v-html="button.icon" class="flex items-center justify-center w-[22px] h-[22px]"></span>
        <span :class="{ 'origin-left scale-0 transition-transform group-hover:scale-100': button.showTextOnHover && button.label }">
          {{ button.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  buttons: {
    type: Array,
    required: true,
    default: () => []
  }
});

const router = useRouter();

const handleButtonClick = (action) => {
  if (typeof action === 'string') {
    // // TODO: 如果 action 是字符串，则视为路由路径
    router.push(action);
  } else if (typeof action === 'function') {
    // // TODO: 如果 action 是函数，则直接执行
    action();
  }
};
</script>

<style scoped>
/* // TODO: 可以根据需要添加额外的 scoped 样式 */
.lucide {
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-width: 2;
  fill: none;
}
</style>
  