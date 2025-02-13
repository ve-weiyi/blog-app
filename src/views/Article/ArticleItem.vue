<template>
  <div
    v-for="article of articleList"
    :key="article.id"
    v-animate="['slideUpBigIn']"
    class="article-item"
  >
    <!-- 文章缩略图 -->
    <div class="article-cover">
      <router-link :to="`/article/${article.id}`" href="">
        <img v-lazy="article.article_cover" class="cover" />
      </router-link>
    </div>
    <!-- 文章信息 -->
    <div class="article-info">
      <div class="article-meta">
        <!-- 置顶 -->
        <span v-if="article.is_top == 1" class="top">
          <svg-icon icon-class="top" size="0.85rem" style="margin-right: 0.15rem"></svg-icon
          >置顶</span
        >
        <!-- 发表时间 -->
        <span class="meta-item ml-3.75">
          <svg-icon icon-class="calendar" size="0.9rem" style="margin-right: 0.15rem"></svg-icon
          >{{ formatDate(article.created_at) }}
        </span>
        <!-- 文章标签 -->
        <router-link
          v-for="tag in article.tag_name_list"
          :key="tag"
          class="meta-item ml-3.75"
          :to="`/tag/${tag}`"
        >
          <svg-icon icon-class="tag" size="0.9rem" style="margin-right: 0.15rem"></svg-icon>
          {{ tag }}
        </router-link>
      </div>
      <!-- 文章标题 -->
      <h3 class="article-title">
        <router-link :to="`/article/${article.id}`">
          {{ article.article_title }}
        </router-link>
      </h3>
      <!-- 文章内容 -->
      <div class="article-content">{{ article.article_content }}</div>
      <!-- 文章分类 -->
      <div class="article-category">
        <svg-icon icon-class="qizhi" size="0.85rem" style="margin-right: 0.15rem"></svg-icon>
        <router-link :to="`/category/${article.category_name}`"
          >{{ article.category_name }}
        </router-link>
      </div>
      <!-- 阅读按钮 -->
      <router-link class="article-btn" :to="`/article/${article.id}`">more...</router-link>
    </div>
  </div>
  <Pagination
    v-if="count > 5"
    v-model:current="queryParams.page"
    :total="Math.ceil(count / 5)"
  ></Pagination>
</template>

<script setup lang="ts">
import { findArticleHomeListApi } from "@/api/article";
import { ArticleHome, ArticleHomeQueryReq } from "@/api/types";

import { formatDate } from "@/utils/date";

const data = reactive({
  count: 0,
  queryParams: {
    page: 1,
    page_size: 5,
  } as ArticleHomeQueryReq,
  articleList: [] as ArticleHome[],
});
const { count, queryParams, articleList } = toRefs(data);
watch(
  () => queryParams.value.page,
  () => {
    findArticleHomeListApi(queryParams.value).then((res) => {
      articleList.value = res.data.list;
      count.value = res.data.total;
    });
  }
);
onMounted(() => {
  findArticleHomeListApi(queryParams.value).then((res) => {
    articleList.value = res.data.list;
    count.value = res.data.total;
  });
});
</script>

<style lang="scss" scoped>
.article-item {
  display: flex;
  height: 14rem;
  margin: 1.25rem 0.5rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  animation-duration: 0.5s;
  transition: all 0.2s ease-in-out 0s;
  visibility: hidden;

  &:hover {
    box-shadow: 0 0 1.5rem var(--box-bg-shadow);

    .cover {
      transform: scale(1.05) rotate(1deg);
    }
  }

  &:nth-child(even) {
    flex-direction: row-reverse;

    .article-cover {
      margin-right: auto;
      margin-left: 1.5rem;
      -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 8% 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 8% 100%);
      border-radius: 0 0.625rem 0.625rem 0;
    }

    .article-info {
      padding: 1rem 0 3rem 1.5rem;

      .article-meta {
        justify-content: flex-start;
      }
    }

    .article-btn {
      left: 0;
      right: auto;
      border-radius: 0 1rem;
      background-image: linear-gradient(to right, var(--color-orange) 0, var(--color-pink) 100%);

      &:hover {
        transform: translateZ(2rem);
      }
    }

    .article-category {
      right: 0.5rem;
      justify-content: flex-start;
    }
  }
}

.article-cover {
  width: 50%;
  margin-right: 1.5rem;
  clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%);
  border-radius: 0.625rem 0 0 0.625rem;
  overflow: hidden;

  .cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.2s ease-in-out 0s;
  }
}

.article-info {
  position: relative;
  width: 50%;
  padding: 1rem 1.5rem 3rem 0;
  perspective: 62.5rem;

  .article-meta {
    display: flex;
    justify-content: flex-end;
    font-size: 0.8125rem;
    color: var(--grey-5);
  }

  .top {
    color: var(--color-orange);
  }

  .meta-item {
    display: flex;
    align-items: center;
  }

  .ml:not(:first-child) {
    margin-left: 0.625rem;
  }

  .article-title {
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0.625rem 0;
    color: var(--primary-color);
    overflow: hidden;
  }

  .article-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    max-height: 5rem;
    font-size: 0.875em;
    overflow: hidden;
  }
}

.article-category {
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 0.5rem;
  font-size: 0.8125em;
  color: var(--grey-5);
}

.article-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.3rem 1rem;
  border-radius: 1rem 0;
  color: var(--grey-0);
  background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);

  &:hover {
    transform: translateZ(2rem);
  }
}

@media (max-width: 767px) {
  .article-item {
    flex-direction: column;
    height: fit-content;

    .article-cover {
      width: 100%;
      height: 14rem;
      margin: auto;
      clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
      border-radius: 0.625rem 0.625rem 0 0;
    }

    .article-info {
      width: 100%;
      height: 14rem;
      padding: 0 1rem 3rem;
    }

    &:nth-child(even) {
      flex-direction: column;

      .article-cover {
        width: 100%;
        margin: auto;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 92%);
        border-radius: 0.625rem 0.625rem 0 0;
      }

      .article-info {
        padding: 0 1rem 3rem;
      }
    }
  }
}
</style>
