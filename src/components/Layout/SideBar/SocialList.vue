<template>
  <div class="social-container">
    <template v-for="(item, index) in showSocialList">
      <a
        v-if="isShowSocial(item.type)"
        :key="index"
        class="social-item"
        target="_blank"
        :href="item.href"
      >
        <svg-icon :icon-class="item.type" size="1.4rem" :color="item.color"></svg-icon>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const socialList = blogStore.blogInfo.website_config.social_login_list;
const isShowSocial = computed(() => (social: string) => {
  if (socialList) {
    return socialList.includes(social);
  }
});
const showSocialList = [
  {
    type: "github",
    href: blogStore.blogInfo.website_config.github,
  },
  {
    type: "gitee",
    href: blogStore.blogInfo.website_config.gitee,
  },
  // {
  //   type: "bilibili",
  //   href: blogStore.blogInfo.website_config.bilibili,
  // },
  {
    type: "qq",
    href:
      "http://wpa.qq.com/msgrd?v=3&uin=" +
      blogStore.blogInfo.website_config.qq +
      "&site=qq&menu=yes",
    color: "#00a1d6",
  },
];
</script>

<style scoped></style>
