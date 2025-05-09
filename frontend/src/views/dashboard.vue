<template>
  <div class="w-full">
    <Navbar :buttons="navButtons" />
    <div class="pt-10">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()

const navButtons = ref([
  {
    id: 'back',
    label: 'Back',
    icon: `
      <svg class="lucide lucide-arrow-left" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
        <path d="m12 19-7-7 7-7"></path>
        <path d="M19 12H5"></path>
      </svg>
    `,
    action: () => {
      if (router.options.history.state.back) {
        router.go(-1);
      } else {
        router.push('/'); 
      }
    },
    showTextOnHover: true
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: `
      <svg class="lucide lucide-rocket text-cyan-500 dark:text-cyan-400" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="#06B6D4" fill="none" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
      </svg>
    `,
    action: '/',
    customClass: 'hover:text-[#06B6D4]'
  },
  {
    id: 'knowledge',
    label: '知识库',
    icon: `
      <svg class="lucide lucide-book" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19.5v-15"></path>
      </svg>
    `,
    action: '/knowledge',
    customClass: 'hover:text-green-500'
  },
  {
    id: 'test',
    label: '测试',
    icon: `
      <svg class="lucide lucide-network" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="16" width="6" height="6" rx="1"></rect>
        <rect x="2" y="16" width="6" height="6" rx="1"></rect>
        <rect x="9" y="2" width="6" height="6" rx="1"></rect>
        <path d="M5 16v-4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v4"></path>
        <path d="M12 8v3"></path>
      </svg>
    `,
    action: '/test',
    customClass: 'hover:text-blue-500'
  },
])
</script>
