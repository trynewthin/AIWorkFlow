<template>
  <div class="workflow-list-view">
    <WorkflowList />
  </div>
</template>

<script setup>
/**
 * 工作流列表视图
 */
import WorkflowList from '@/components/workflow/WorkflowList.vue';
</script>

<style scoped>
.workflow-list-view {
  padding: 24px;
  height: 100%;
  overflow: auto;
}
</style> 