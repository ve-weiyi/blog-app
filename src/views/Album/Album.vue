<template>
  <div class="page-header">
    <h1 class="page-title">相册</h1>
    <img class="page-cover" :src="cover" alt="" />
    <!-- 波浪 -->
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <div class="album-container">
        <div v-for="album in albumList" :key="album.id" class="album-item">
          <img v-lazy="album.album_cover" class="album-cover" />
          <router-link :to="`/album/${album.id}`" class="album-info">
            <div class="album-name">{{ album.album_name }}</div>
            <div class="album-desc">{{ album.album_desc }}</div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { findAlbumListApi } from "@/api/album";
import { Album } from "@/api/types";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();

const cover = blogStore.getCover("album");
const albumList = ref<Album[]>([]);
onMounted(() => {
  findAlbumListApi().then((res) => {
    albumList.value = res.data.list;
  });
});
</script>

<style lang="scss" scoped>
.album-container {
  display: flex;
  flex-wrap: wrap;
}

.album-item {
  position: relative;
  width: calc(50% - 0.5rem);
  height: 15.625rem;
  margin: 0.375rem 0.25rem;
  border-radius: 0.5rem;
  background: #000;
  overflow: hidden;
}

.album-cover {
  position: relative;
  max-width: none;
  width: calc(100% + 1.25rem);
  height: 15.625rem;
  transition:
    opacity 0.35s,
    transform 0.35s;
  transform: translate3d(-10px, 0, 0);
  object-fit: cover;
  opacity: 0.8;
}

.album-info {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.8rem 2rem;
  color: #fff !important;
}

.album-name {
  position: relative;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 0.7rem 0;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    transition: transform 0.35s;
    transform: translate3d(-100%, 0, 0);
  }
}

.album-desc {
  padding: 0.4rem 0 0;
  line-height: 1.5;
  transition:
    opacity 0.35s,
    transform 0.35s;
  transform: translate3d(100%, 0, 0);
  opacity: 0;
}

.album-item:hover .album-desc {
  opacity: 1;
  transform: translateZ(0);
}

.album-item:hover .album-name::after {
  transform: translate3d(0, 0, 0);
}

@media (max-width: 567px) {
  .album-item {
    width: calc(100% - 0.5rem);
  }
}
</style>
