<template>
  <div class="min-h-screen flex flex-col bg-transparent relative">
    <BackgroundContainer/>
    <div class="flex-1 py-12 relative z-10">
      <router-view/>
    </div>
    <NotificationContainer/>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import NotificationContainer from '@/components/NotificationContainer.vue';
import useNotificationStore from '@/utils/notification';
import BackgroundContainer from '@/components/BackgroundContainer.vue';
import useBackgroundStore from '@/utils/background';
import getBackgroundStyle from '@/utils/backgroundConfig';

onMounted(() => {
const loadingElement = document.getElementById('loadingPage');
if (loadingElement) {
  loadingElement.remove();
}
});

const route = useRoute();
const { clearNotifications } = useNotificationStore();
const { setBackground, clearBackground } = useBackgroundStore();
watch(route, () => {
  clearNotifications();
  clearBackground();
  const style = getBackgroundStyle(route.name);
  if (style) setBackground(style);
});
</script>
