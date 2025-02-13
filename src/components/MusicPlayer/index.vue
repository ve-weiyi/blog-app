<template>
  <!-- <meting-js v-if="blogStore.blogInfo.website_config.isMusic" server="netease" type="playlist"
    :id="blogStore.blogInfo.website_config.musicId" fixed="true" theme="#e9546b"></meting-js> -->
  <aplayer :id="'5771'" server="netease" type="playlist" :fixed="true" theme="#e9546b"> </aplayer>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";
import aplayer from "./aplayer.vue";

const blogStore = useBlogStore();
</script>

<style scoped></style>
