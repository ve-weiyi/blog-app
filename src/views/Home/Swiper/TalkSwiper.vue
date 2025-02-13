<template>
  <router-link v-if="talkList.length > 0" to="/talk" class="talk-swiper">
    <svg-icon icon-class="laba" size="1.25rem"></svg-icon>
    <swiper
      class="swiper-container"
      :direction="'vertical'"
      :speed="2000"
      :modules="modules"
      :loop="true"
      :slides-per-view="1"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
    >
      <swiper-slide v-for="(talk, index) in talkList" :key="index">
        <div class="slide-content" v-html="talk.content"></div>
      </swiper-slide>
    </swiper>
    <svg-icon icon-class="right-arrow" class="arrow"></svg-icon>
  </router-link>
</template>

<script setup lang="ts">
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { findTalkListApi } from "@/api/talk";
import { Talk } from "@/api/types";
// 自动播放
const modules = [Autoplay];
const talkList = ref<Talk[]>([]);
onMounted(() => {
  findTalkListApi().then((res) => {
    talkList.value = res.data.list;
  });
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.talk-swiper {
  @include flex;
  margin: 0 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9375rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;

  &:hover {
    box-shadow: 0 0 2rem var(--box-bg-shadow);
  }
}

.swiper-container {
  width: 100%;
  height: 1.5625rem;
  line-height: 1.5625rem;
  border-radius: 0.75rem;
}

.slide-content {
  width: 100%;
  height: 100%;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.arrow {
  animation: 1.5s passing infinite;
}

@keyframes passing {
  0% {
    transform: translateX(-50%);
    opacity: 0;
  }

  50% {
    transform: translateX(0);
    opacity: 1;
  }

  100% {
    transform: translateX(50%);
    opacity: 0;
  }
}
</style>
