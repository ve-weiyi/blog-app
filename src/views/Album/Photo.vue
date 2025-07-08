<template>
  <div class="page-header">
    <h1 class="page-title">{{ albumInfo.album_name }}</h1>
    <img class="page-cover" :src="cover" alt="" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <div v-viewer v-masonry fit-width="true" transition-duration="0.3s" item-selector=".card">
        <div v-for="photo in photoList" :key="photo.id" v-masonry-tile class="card">
          <img class="img" :src="photo.photo_url" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlbumAPI } from "@/api/album";
import type { Album, Photo } from "@/api/types";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();

const cover = blogStore.getCover("photo");

const route = useRoute();
const albumInfo = ref<Album>({
  id: 0,
  album_name: "",
  album_desc: "",
  album_cover: "",
});
const photoList = ref<Photo[]>([]);

onMounted(() => {
  const albumId = Number(route.params.albumId);

  AlbumAPI.getAlbumApi({ id: albumId }).then((res) => {
    albumInfo.value = res.data;
  });

  AlbumAPI.findPhotoListApi({ album_id: albumId }).then((res) => {
    photoList.value = res.data.list;
  });
});
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  max-width: 280px;
  margin: 0.25em;
  border-radius: 5px;
  box-shadow: 0px 2px 10px 1px rgba(0, 0, 0, 0.1);
}

.card .img {
  width: 100%;
  height: 100%;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
