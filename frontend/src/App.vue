<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <div class="flex-1 py-12">
      <router-view/>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
const loadingElement = document.getElementById('loadingPage');
if (loadingElement) {
  loadingElement.remove();
}
});
</script>
