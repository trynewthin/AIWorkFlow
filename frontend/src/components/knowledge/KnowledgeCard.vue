<template>
  <div class="book" @click="goDetail">
    <!-- 前面：知识库描述 -->
    <p class="title">{{ description }}</p>
    <!-- 背面：知识库名称 -->
    <div class="cover">
      <p class="description">{{ name }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

// TODO: 定义属性
const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
});

// TODO: 路由导航
const router = useRouter();
const goDetail = () => {
  router.push({ name: 'KnowledgeDetail', params: { kbId: props.id } });
};
</script>

<style scoped>
  .book {
    position: relative;
    border-radius: 10px;
    width: 220px;
    height: 300px;
    background-color: #f2e4aefc;  /* 仿真皮书皮色 */
    box-shadow: 1px 1px 12px #000;
    transform-style: preserve-3d;
    perspective: 2000px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .cover {
    position: absolute;
    top: 0;
    background-color: #DEB887;  /* 浅褐色，提亮封面 */
    width: 100%;
    height: 100%;
    border-radius: 10px;
    transition: transform 0.5s;
    transform-origin: left;
    box-shadow: 1px 1px 12px #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    color: #000000;               /* 背面文字白色提高对比 */
  }
  .book:hover .cover {
    transform: rotateY(-80deg);
  }
  .title {
    color: #5D4037;  /* 标题褐色 */
    font-size: 20px;
    font-weight: bold;
    backface-visibility: hidden;
  }
  .description {
    font-size: 30px;
    padding: 1rem;
    text-align: center;
  }
  .btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    background-color: #141417;
    color: #fff;
    cursor: pointer;
  }
  p {
    margin: 0;
  }
</style> 