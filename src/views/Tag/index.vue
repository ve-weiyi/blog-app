<template>
  <div class="page-header">
    <h1 class="page-title">标签</h1>
    <img class="page-cover" :src="cover" alt="" />
    <!-- 波浪 -->
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <div class="tag-cloud">
        <router-link
          v-for="tag in tagList"
          :key="tag.id"
          :to="`/tag/${tag.tag_name}`"
          class="tag-item"
          :style="{ 'font-size': getSize(tag.article_count), color: getRandomColor() }"
        >
          {{ tag.tag_name }}
          <sup>{{ tag.article_count }}</sup>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { findTagListApi } from "@/api/tag";
import { Tag } from "@/api/types";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const cover = blogStore.getCover("tag");

const getSize = (freq: number) => {
  return ((1 + (6 * freq) / 10) / 3) * 2 + "rem";
};
const getRandomColor = () => {
  return (
    "rgb(" +
    Math.round(Math.random() * 255) +
    "," +
    Math.round(Math.random() * 255) +
    "," +
    Math.round(Math.random() * 255) +
    ")"
  );
};
const tagList = ref<Tag[]>([]);
onMounted(() => {
  findTagListApi().then((res) => {
    tagList.value = res.data.list;
  });
});
</script>

<style lang="scss" scoped>
.tag-cloud {
  text-align: center;
}

.tag-item {
  display: inline-block;
  padding: 0 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
