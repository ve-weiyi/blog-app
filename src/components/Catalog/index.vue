<template>
  <div class="catalog-header">
    <svg-icon icon-class="category" />
    目录
  </div>
  <div class="catalog-content">
    <div
      v-for="(anchor, index) in titleList"
      :key="anchor.lineIndex"
      class="catalog-item"
      :class="['indent-' + anchor.indent, { active: currentIndex === index }]"
      :style="{ paddingLeft: `${5 + anchor.indent * 15}px` }"
      @click="handleAnchorClick(anchor, index)"
    >
      <a>{{ anchor.title }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useScroll, watchThrottled } from "@vueuse/core";

const titleList = ref<any[]>([]);
const currentIndex = ref(0);

const props = defineProps({
  domRef: {
    type: Object,
    default: null,
  },
});

let observer: MutationObserver | null = null;

// 提取标题
const getTitles = () => {
  if (!props.domRef?.$el) return;

  const anchors = props.domRef.$el.querySelectorAll("h1,h2,h3");
  const titles = Array.from(anchors).filter((t: HTMLElement) => !!t.innerText.trim());

  if (!titles.length) {
    titleList.value = [];
    return;
  }

  const hTags = Array.from(new Set(titles.map((t: HTMLElement) => t.tagName))).sort();

  titleList.value = titles.map((el: HTMLElement, idx: number) => {
    return {
      title: el.innerText,
      lineIndex: el.getAttribute("data-v-md-line"),
      indent: hTags.indexOf(el.tagName),
    };
  });
};

// 点击锚点目录
function handleAnchorClick(anchor: any, idx: number) {
  if (!props.domRef?.$el) return;
  const heading = props.domRef.$el.querySelector(`[data-v-md-line="${anchor.lineIndex}"]`);
  // const heading = preview.querySelector(`#${anchor.title}`)
  if (heading) {
    window.scrollTo({
      top: heading.getBoundingClientRect().top + window.scrollY - 40, // 适配导航栏偏移
      behavior: "smooth",
    });
    setTimeout(() => (currentIndex.value = idx), 600);
  }
}

// * 实现目录高亮当前位置的标题
// 思路: 循环的方式将标题距离顶部距离与滚动条当前位置对比, 来确定高亮的标题
const { y } = useScroll(window);

watchThrottled(
  y,
  () => {
    if (!props.domRef?.$el) return;

    const scrollY = y.value;
    for (let idx = 0; idx < titleList.value.length; idx++) {
      const e = titleList.value[idx];
      const heading = props.domRef.$el.querySelector(
        `[data-v-md-line="${e.lineIndex}"]`
      ) as HTMLElement;
      if (heading && scrollY >= heading.offsetTop - 60) {
        currentIndex.value = idx;
      }
    }
  },
  { throttle: 200, immediate: true }
);

onMounted(() => {
  nextTick(() => {
    // 监听 DOM 变化确保标题提取
    if (props.domRef?.$el) {
      observer = new MutationObserver(() => {
        getTitles();
      });
      observer.observe(props.domRef.$el, {
        childList: true,
        subtree: true,
      });
    }

    // 初次加载
    setTimeout(() => {
      getTitles();
    }, 300);
  });
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped lang="scss">
.catalog-header {
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.catalog-content {
  max-height: calc(100vh - 100px);
  overflow: auto;
  margin-right: -16px;
  padding-right: 16px;
}

.catalog-item {
  margin: 5px 0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  padding: 2px 6px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: var(--primary-color);
  }
}

.active {
  background-color: var(--primary-color);
  color: var(--grey-0);

  &:hover {
    background-color: var(--color-blue);
    color: var(--grey-0);
  }
}

// 缩进样式
.indent-0 {
  font-weight: bold;
}

.indent-1 {
  color: #666;
}

.indent-2 {
  color: #999;
}
</style>
