<template>
  <div>
    <div class="web-title">
      <svg-icon icon-class="web" size="1.1875rem"></svg-icon>
      网站资讯
    </div>
    <div v-for="(item, index) in webInfo" :key="index" class="web-item">
      <div class="web-name">{{ item.name }}</div>
      <div class="web-count">{{ item.count }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const runTime = ref("");
setInterval(() => {
  const day = new Date();
  const createTime = new Date(blogStore.blogInfo.website_config.website_info.website_create_time);
  const diffTime = day.getTime() - createTime.getTime();
  const days = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  let str = "";
  str += days + "天";
  str += day.getHours() + "时";
  str += day.getMinutes() + "分";
  str += day.getSeconds() + "秒";
  runTime.value = str;
}, 1000);
const webInfo = computed(() => {
  return [
    { name: "总访问量", count: blogStore.blogInfo.total_page_view_count },
    { name: "文章数目", count: blogStore.blogInfo.article_count },
    { name: "运行时长", count: runTime },
  ];
});
</script>

<style lang="scss" scoped>
.web-title {
  font-size: 1.2em;
}

.web-item {
  display: flex;
  justify-content: space-between;
}
</style>
