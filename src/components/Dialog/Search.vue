<template>
  <n-modal
    v-model:show="dialogVisible"
    class="dialog-wrapper bg"
    preset="dialog"
    :show-icon="false"
    transform-origin="center"
    :block-scroll="false"
  >
    <template #header>
      <span class="title">本地搜索</span>
    </template>
    <!-- 输入框 -->
    <div class="search-input-wrapper">
      <label for="search">
        <svg-icon icon-class="search"></svg-icon>
      </label>
      <input id="search" v-model="keyword" placeholder="输入文章标题或内容..." />
    </div>
    <!-- 搜索结果 -->
    <div class="search-result-wrapper">
      <hr class="divider" />
      <ul v-if="articleList.length">
        <li v-for="article in articleList" :key="article.id" class="search-result">
          <!-- 文章标题 -->
          <router-link class="search-title" :to="`/article/${article.id}`">
            <span @click="dialogVisible = false" v-html="article.article_title"></span>
          </router-link>
          <!-- 文章内容 -->
          <p class="search-content" v-html="article.article_content"></p>
        </li>
      </ul>
      <!-- 搜索结果不存在提示 -->
      <div v-else-if="keyword" class="colorFlag" style="font-size: 0.875rem; margin-top: 1rem">
        找不到您查询的内容：{{ keyword }}
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { findArticleHomeListApi } from "@/api/article";
import { useAppStore } from "@/store";
import { debouncedWatch } from "@vueuse/core";
import { ArticleHome, ArticleHomeQueryReq } from "@/api/types";

const appStore = useAppStore();
const dialogVisible = computed({
  get: () => appStore.searchFlag,
  set: (value) => (appStore.searchFlag = value),
});
const keyword = ref("");
const articleList = ref<ArticleHome[]>([]);
debouncedWatch(keyword, () => (keyword.value ? handleSearch() : (articleList.value = [])), {
  debounce: 300,
});
const handleSearch = () => {
  const data: ArticleHomeQueryReq = {
    article_title: keyword.value,
  };

  findArticleHomeListApi(data).then((res) => {
    articleList.value = res.data.list;
  });
};
</script>

<style scoped>
.title {
  color: var(--color-blue);
  font-size: 1.25rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 5px;
  height: 35px;
  width: 100%;
  border: 2px solid #8e8cd8;
  color: var(--text-color);
  border-radius: 2rem;
}

.search-input-wrapper #search {
  width: 100%;
  font-size: 1rem;
  margin-left: 5px;
  color: var(--text-color);
  outline: none;
}

@media (min-width: 960px) {
  .search-result-wrapper {
    padding: 0 3px;
    height: 390px;
    overflow: auto;
  }
}

@media (max-width: 959px) {
  .search-result-wrapper {
    height: calc(100vh - 190px);
    overflow: auto;
  }
}

.search-result {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--text-color);
}

.search-title {
  font-weight: 700;
  border-bottom: 1px solid #999;
  text-decoration: none;
}

.search-content {
  cursor: pointer;
  border-bottom: 1px dashed #ccc;
  padding: 5px 0;
  line-height: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.divider {
  margin-top: 1.2rem;
  border: 2px dashed var(--color-pink-light-a7);
}
</style>
