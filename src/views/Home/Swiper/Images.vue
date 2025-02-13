<template>
  <div class="imgs">
    <ul>
      <li
        v-for="carousel of carouselList"
        :key="carousel.id"
        class="item"
        :style="{
          'background-image': 'url(' + carousel.page_cover + ')',
        }"
      ></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Page } from "@/api/types";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const carouselList = computed(() => blogStore.getCarouselList());
// onMounted(() => {
//   carouselList.value = blogStore.getCarouselList();
// });
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.imgs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -9;
  background-color: #363636;
  overflow: hidden;

  .item {
    @include absolute;
    width: 100%;
    height: 100%;
    background: no-repeat center center / cover;
    opacity: 0;
    animation: imageAnimation 36s linear infinite 0s;
    backface-visibility: hidden;
    transform-style: preserve-3d;

    &:nth-child(2) {
      animation-delay: 6s;
    }

    &:nth-child(3) {
      animation-delay: 12s;
    }

    &:nth-child(4) {
      animation-delay: 18s;
    }

    &:nth-child(5) {
      animation-delay: 24s;
    }

    &:nth-child(6) {
      animation-delay: 30s;
    }
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease-in-out 0s;
  }
}

@keyframes imageAnimation {
  0% {
    opacity: 0;
    animation-timing-function: ease-in;
  }

  2% {
    opacity: 1;
  }

  8% {
    opacity: 1;
    transform: scale(1.05);
    animation-timing-function: ease-out;
  }

  17% {
    opacity: 1;
    transform: scale(1.1);
  }

  25% {
    opacity: 0;
    transform: scale(1.1);
  }

  100% {
    opacity: 0;
  }
}
</style>
