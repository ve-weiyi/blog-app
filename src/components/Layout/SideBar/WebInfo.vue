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
import dayjs from "dayjs";

const blogStore = useBlogStore();
const runTime = ref("");
setInterval(() => {
  const days = dayjs().diff(blogStore.blogInfo.website_config.website_create_time, "days");
  const day = new Date();
  let str = "";
  str += days + "天";
  str += day.getHours() + "时";
  str += day.getMinutes() + "分";
  str += day.getSeconds() + "秒";
  runTime.value = str;
}, 1000);
const webInfo = computed(() => {
  return [
    { name: "文章数目", count: blogStore.blogInfo.article_count },
    { name: "运行时长", count: runTime },
    { name: "总访问量", count: blogStore.blogInfo.views_count },
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
