<template>
  <div class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <img class="page-cover" :src="cover" alt="" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <n-grid x-gap="15" y-gap="15" cols="1 s:2 m:3" responsive="screen">
        <n-grid-item v-for="article of articleList" :key="article.id" class="article-item">
          <div class="article-cover">
            <router-link :to="`/article/${article.id}`"
              ><img v-lazy="article.article_cover" class="cover" />
            </router-link>
          </div>
          <div class="article-info">
            <div class="article-title">
              <router-link :to="`/article/${article.id}`">{{ article.article_title }}</router-link>
            </div>
            <div class="article-meta">
              <span
                ><svg-icon icon-class="calendar" size="0.95rem"></svg-icon>
                {{ formatDate(article.created_at) }}</span
              >
              <router-link :to="`/category/${article.category_name}`">
                <svg-icon icon-class="qizhi" size="0.9rem"></svg-icon>
                {{ article.category_name }}
              </router-link>
            </div>
            <div class="tag-info">
              <router-link
                v-for="tag in article.tag_name_list"
                :key="tag"
                :to="`/tag/${tag}`"
                class="article-tag"
              >
                <svg-icon icon-class="tag" size="0.8rem"></svg-icon>
                {{ tag }}
              </router-link>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArticleHome } from "@/api/types";
import { findArticleClassifyCategoryApi, findArticleClassifyTagApi } from "@/api/article";
import { formatDate } from "@/utils/date";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();

const cover = blogStore.getCover("article");
const data = reactive({
  queryParams: {
    page: 1,
    page_size: 5,
  },
  articleList: [] as ArticleHome[],
});
const { queryParams, articleList } = toRefs(data);

// 获取路由参数
const route = useRoute();
const tagId = route.params.tagId as string;
const categoryId = route.params.categoryId as string;

const title = ref("");

function getTagArticleList() {
  let data = {
    page: queryParams.value.page,
    page_size: queryParams.value.page_size,
    classify_name: tagId,
  };

  findArticleClassifyTagApi(data).then((res) => {
    articleList.value = res.data.list;
  });
}

function getCategoryArticleList() {
  let data = {
    page: queryParams.value.page,
    page_size: queryParams.value.page_size,
    classify_name: categoryId,
  };

  findArticleClassifyCategoryApi(data).then((res) => {
    articleList.value = res.data.list;
  });
}

onMounted(() => {
  const path = route.path;
  if (path.includes("/category")) {
    title.value = categoryId;
    getCategoryArticleList();
  } else {
    title.value = tagId;
    getTagArticleList();
  }
});
</script>

<style lang="scss" scoped>
.article-item {
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;
  animation: zoomIn 1s both;

  &:hover {
    box-shadow: 0 0 2rem var(--box-bg-shadow);
  }
}

.article-cover {
  width: 100%;
  height: 12rem;
  overflow: hidden;
  border-radius: 0.625rem 0.625rem 0 0;
}

.cover {
  object-fit: cover;
  width: 100%;
  height: 100%;
  transition: all 0.5s;
}

.article-item:hover .cover {
  transform: scale(1.1);
  filter: brightness(0.9);
}

.article-info {
  padding: 0.6rem 0.8rem 1rem;
}

.article-title {
  font-size: 23px;
  font-weight: 400;
  line-height: 1.25;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.625rem;
  font-size: 14px;
  color: var(--grey-5);
}
</style>
