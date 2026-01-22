<template>
  <div class="view-more-pagination">
    <span class="pagination-page-count">共{{ totalPage }}页</span>
    <span v-if="current !== 1" class="pagination-btn" @click="prePage">上一页</span>
    <template v-for="(number, index) in visibleNumber">
      <span
        v-if="typeof number == 'number'"
        :key="index"
        class="pagination-page-number"
        :class="current == number ? 'current-page' : ''"
        @click="changePage(number)"
        >{{ number }}</span
      >
      <span v-else :key="number" class="pagination-page-do">...</span>
    </template>
    <span v-if="current !== totalPage" class="pagination-btn" @click="nextPage">下一页</span>
  </div>
</template>

<script setup lang="ts">
const current = ref(1);
const page = ref(5);
const emit = defineEmits(["pageChange"]);
const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
});
const totalPage = computed(() => Math.ceil(props.total / page.value));
const visibleNumber = computed(() => {
  if (totalPage.value <= 5) {
    return Array.from({ length: totalPage.value }, (_, i) => i + 1);
  } else {
    if (current.value <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPage.value];
    } else if (current.value >= totalPage.value - 4) {
      return [
        1,
        "...",
        totalPage.value - 5,
        totalPage.value - 4,
        totalPage.value - 3,
        totalPage.value - 2,
        totalPage.value - 1,
        totalPage.value,
      ];
    } else {
      return [
        1,
        "...",
        current.value - 2,
        current.value - 1,
        current.value,
        current.value + 1,
        current.value + 2,
        "...",
        totalPage.value,
      ];
    }
  }
});
const prePage = () => {
  current.value -= 1;
  emit("pageChange", current.value);
};
const changePage = (number: number) => {
  current.value = number;
  emit("pageChange", number);
};
const nextPage = () => {
  current.value += 1;
  emit("pageChange", current.value);
};

defineExpose({ current });
</script>

<style lang="scss" scoped>
.view-more-pagination {
  font-size: 13px;
  line-height: 1.5;

  .pagination-page-count {
    margin-right: 10px;
  }

  .pagination-btn {
    cursor: pointer;

    &:hover {
      color: var(--color-pink);
    }
  }

  .pagination-page-do {
    margin: 0 4px;
  }

  .pagination-page-number {
    margin: 0 4px;
    cursor: pointer;

    &:hover {
      color: var(--color-pink);
    }
  }
}

.pagination-page-number.current-page {
  color: var(--color-pink);
}
</style>
