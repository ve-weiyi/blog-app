<template>
  <div class="page-header">
    <h1 class="page-title">关于</h1>
    <img class="page-cover" :src="cover" alt="" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <div class="avatar-box">
        <img class="author-avatar" :src="blogStore.blogInfo.website_config.website_avatar" />
      </div>
      <v-md-preview class="md" :text="aboutContent"></v-md-preview>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";
import { getAboutMeApi } from "@/api/website";

const blogStore = useBlogStore();

const cover = blogStore.getCover("about");
const aboutContent = ref("");

const getAboutContent = () => {
  getAboutMeApi().then((res) => {
    aboutContent.value = res.data.content;
  });
};

onMounted(() => {
  getAboutContent();
});
</script>

<style scoped>
.author-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  transition: all 0.5s;
}

.author-avatar:hover {
  transform: rotate(360deg);
}
</style>
