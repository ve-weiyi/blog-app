<template>
  <div class="blog-container">
    <!-- 文章 -->
    <div v-for="(item, index) in blogInfo" :key="index" class="blog-item">
      <router-link :to="item.path">
        <div class="count">{{ item.count }}</div>
        <div class="name">{{ item.name }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const blogInfo = [
  { path: "/archive", count: blogStore.blogInfo.article_count, name: "文章" },
  { path: "/category", count: blogStore.blogInfo.category_count, name: "分类" },
  { path: "/tag", count: blogStore.blogInfo.tag_count, name: "标签" },
];
</script>

<style scoped></style>
