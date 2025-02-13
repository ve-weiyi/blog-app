<template>
  <div>
    <!-- 作者信息 -->
    <div class="author-container">
      <!-- 作者头像 -->
      <img class="author-avatar" :src="blogStore.blogInfo.website_config.website_avatar" />
      <!-- 作者名称 -->
      <p class="author-name">{{ blogStore.blogInfo.website_config.website_author }}</p>
      <!-- 网站简介 -->
      <div class="site-desc">{{ blogStore.blogInfo.website_config.website_intro }}</div>
    </div>
    <!-- 博客信息 -->
    <blog-info></blog-info>
    <!-- 社交 -->
    <social-list></social-list>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
</script>

<style scoped></style>
