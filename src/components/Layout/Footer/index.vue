<template>
  <footer v-if="!isMessage" class="footer-wrapper">
    <li v-for="link in links" :key="link" style="display: inline; margin: 8px">
      <a style="font-weight: 500; font-size: 16px">{{ link }}</a>
    </li>
    <p>
      ©
      {{ formatDate(blogStore.blogInfo.website_config.website_info.website_create_time, "YYYY") }} -
      {{ new Date().getFullYear() }} By
      {{ blogStore.blogInfo.website_config.website_info.website_author }}
    </p>
    <a href="https://beian.miit.gov.cn/" target="_blank">
      {{ blogStore.blogInfo.website_config.website_info.website_record_no }}
    </a>
  </footer>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";
import { formatDate } from "@/utils/date";

const route = useRoute();
const blogStore = useBlogStore();
const isMessage = computed(() => route.path == "/message");
const links = ["博客", "项目", "友链", "关于", "联系"];
</script>

<style lang="scss" scoped>
.footer-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 8rem;
  padding: 2.5rem 0;
  font-size: 0.875rem;
  text-align: center;
  color: var(--grey-0);
  background: var(--footer-bg);
  background-size: 300% 300%;
  -webkit-animation: gradientBG 10s ease infinite;
  animation: gradientBG 10s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>
