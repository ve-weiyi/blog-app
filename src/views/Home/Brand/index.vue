<template>
  <div ref="brandRef" class="brand-container">
    <div class="brand">
      <!-- 标题 -->
      <p class="artboard">
        {{ title }}
      </p>
      <h3 class="animated zoomIn">
        {{ author }}
      </h3>
      <!-- 打字机 -->
      <div class="title">
        {{ obj.output }}
        <span class="easy-typed-cursor">|</span>
      </div>
    </div>
    <!-- 波浪 -->
    <Waves></Waves>
    <!-- 向下按钮 -->
    <svg-icon class="arrow-down" icon-class="down" size="32px" @click="scrollDown"></svg-icon>
  </div>
</template>

<script setup lang="ts">
import EasyTyper from "easy-typer-js";

const obj = reactive({
  output: "",
  isEnd: false,
  speed: 100,
  singleBack: false,
  sleep: 0,
  type: "normal",
  backSpeed: 100,
  sentencePause: false,
});
const brandRef = ref<HTMLElement>();
const scrollDown = () => {
  nextTick(() => {
    window.scrollTo({
      behavior: "smooth",
      top: brandRef.value?.clientHeight,
    });
  });
};

interface Hitokoto {
  id: number;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string;
  creator: string;
  creator_uid: number;
  reviewer: number;
  commit_from: string;
  created_at: string;
  length: number;
}

// 诗篇名称
const title = ref("");

// 作者
const author = ref("");

const fetchData = () => {
  fetch("https://v1.hitokoto.cn?c=i")
    .then((res) => {
      return res.json();
    })
    .then((res: Hitokoto) => {
      author.value = res.from_who;
      title.value = res.from;
      new EasyTyper(
        obj,
        res.hitokoto,
        () => {},
        () => {}
      );
    });
};
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.brand-container {
  @include flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 10rem;
  color: var(--header-text-color);
}

.brand {
  @include flex;
  flex-direction: column;
  position: fixed;
  z-index: -1;

  .artboard {
    font-family:
      "Fredericka the Great",
      Mulish,
      -apple-system,
      "PingFang SC",
      "Microsoft YaHei",
      sans-serif;
    font-size: 2.5em;
    line-height: 1.2;
    animation: title-scale 1s;
  }

  .title {
    letter-spacing: 0.1em;
  }
}

.easy-typed-cursor {
  margin-left: 0.625rem;
  opacity: 1;
  -webkit-animation: blink 0.7s infinite;
  -moz-animation: blink 0.7s infinite;
  animation: blink 0.7s infinite;
}

.arrow-down {
  position: absolute;
  bottom: 70px;
  -webkit-animation: arrow-shake 1.5s ease-out infinite;
  animation: arrow-shake 1.5s ease-out infinite;
  cursor: pointer;
  z-index: 8;
}

@media (max-width: 767px) {
  .brand-container {
    padding: 3rem 0.5rem 0;
  }
}

@media (min-width: 760px) {
  .title {
    font-size: 1.5rem;
  }
}

@keyframes arrow-shake {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  30% {
    opacity: 0.5;
    transform: translateY(25px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
