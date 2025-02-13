<template>
  <!--背景轮播-->
  <Images></Images>
  <!-- 品牌 -->
  <Brand></Brand>
  <div class="bg">
    <div class="main-container mt">
      <div class="left-container" :class="appStore.sideFlag ? 'test' : ''">
        <!-- 说说 -->
        <TalkSwiper></TalkSwiper>
        <!-- 推荐文章 -->
        <Recommend></Recommend>
        <!-- 文章列表 -->
        <ArticleItem></ArticleItem>
      </div>
      <SideBar class="right-container" :class="appStore.sideFlag ? 'temp' : ''"></SideBar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useBlogStore } from "@/store";
import ArticleItem from "@/views/Article/ArticleItem.vue";
import Brand from "./Brand/index.vue";
import Images from "./Swiper/Images.vue";
import Recommend from "./Swiper/Recommend.vue";
import TalkSwiper from "./Swiper/TalkSwiper.vue";

const appStore = useAppStore();
const blogStore = useBlogStore();
onMounted(async () => {});
</script>

<style lang="scss" scoped>
.mt {
  margin-top: 1rem;
  padding-bottom: 1.75rem;
}
</style>
