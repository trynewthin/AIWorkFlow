<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <div class="flex-1 py-12">
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

onMounted(() => {
const loadingElement = document.getElementById('loadingPage');
if (loadingElement) {
  loadingElement.remove();
}
});

const route = useRoute();
watch(route, () => {
  const { clearNotifications } = useNotificationStore();
  clearNotifications();
});
</script>
