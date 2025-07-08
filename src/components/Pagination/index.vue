<template>
  <n-pagination v-model:page="currentPage" class="pagination" :page-count="total" :page-slot="5">
    <template #prev>
      <svg-icon icon-class="angle-left"></svg-icon>
    </template>
    <template #next>
      <svg-icon icon-class="angle-right"></svg-icon>
    </template>
  </n-pagination>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

interface PaginationEmits {
  (e: "update:current", value: number): void;
}

const emit = defineEmits<PaginationEmits>();

const props = defineProps({
  current: {
    type: Number as PropType<number>,
    default: 1,
  },
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
});

const currentPage = computed<number>({
  get: () => props.current,
  set: (value) => {
    emit("update:current", value);
  },
});
</script>

<style scoped></style>
