<template>
  <div v-if="visible" class="modal-mask">
    <div class="modal-container">
      <!-- TODO: 删除确认弹窗 -->
      <h3 class="text-xl font-bold mb-4">确认删除此文档？</h3>
      <div class="flex justify-end">
        <button @click="cancel" class="mr-2">取消</button>
        <button @click="confirm" class="bg-red-500 text-white py-1 px-4 rounded">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// TODO: 定义属性和事件
const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'confirm']);

// TODO: 取消
const cancel = () => emit('update:visible', false);

// TODO: 确认删除
const confirm = () => emit('confirm');
</script> 