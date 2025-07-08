<template>
  <div class="imgs">
    <ul>
      <li
        v-for="(carousel, index) of carouselList"
        :key="carousel"
        class="item"
        :style="{
          'background-image': 'url(' + carousel + ')',
          'animation-delay': `${index * 8}s`,
          'animation-duration': `${carouselList.length * 8}s`,
        }"
      ></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();
const carouselList = ref<string[]>([]);

// 动态生成关键帧样式
const generateKeyframes = (count: number) => {
  const percentage = 100 / count;
  const fadeInt = Math.floor(percentage * 0.1);
  const scaleInt = Math.floor(percentage * 0.3);
  const scaleMax = Math.floor(percentage * 0.99);
  const fadeOut = Math.floor(percentage * 1.5);

  return `
    @keyframes imageAnimation {
      0% {
        opacity: 0;
        animation-timing-function: ease-in;
      }
      ${fadeInt}% {
        opacity: 1;
      }
      ${scaleInt}% {
        opacity: 1;
        transform: scale(1.05);
        animation-timing-function: ease-out;
      }
      ${scaleMax}% {
        opacity: 1;
        transform: scale(1.1);
      }
      ${fadeOut}% {
        opacity: 0;
        transform: scale(1.05);
      }
      100% {
        opacity: 0;
      }
    }
  `;
};

// 创建样式元素
const styleElement = document.createElement("style");
document.head.appendChild(styleElement);

// 监听图片列表变化，更新关键帧
watch(
  carouselList,
  (newList) => {
    if (newList.length > 0) {
      styleElement.textContent = generateKeyframes(newList.length);
    }
  },
  { immediate: true }
);

onMounted(() => {
  carouselList.value = blogStore.getCarouselList();
});

onUnmounted(() => {
  document.head.removeChild(styleElement);
});
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
    animation: imageAnimation linear infinite;
    backface-visibility: hidden;
    transform-style: preserve-3d;
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
</style>
