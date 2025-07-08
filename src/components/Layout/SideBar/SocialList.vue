<template>
  <div class="social-container">
    <template v-for="(item, index) in socialList">
      <a v-if="item.enabled" :key="index" class="social-item" target="_blank" :href="item.link_url">
        <svg-icon :icon-class="item.platform" size="1.4rem"></svg-icon>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const socialList = computed(() => {
  return blogStore.blogInfo.website_config.social_url_list;
});
</script>

<style scoped></style>
