<template>
  <div class="page-header">
    <h1 class="page-title">说说</h1>
    <img :src="cover" alt="" class="page-cover" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <router-link
        v-for="talk in talkList"
        :key="talk.id"
        v-animate="['slideUpBigIn']"
        :to="`/talk/${talk.id}`"
        class="talk-item"
      >
        <div class="talk-meta">
          <!-- 用户头像 -->
          <img :src="talk.user_info?.avatar" class="user-avatar" />
          <div class="talk-info">
            <span class="talk-user-name">
              {{ talk.user_info?.nickname }}
              <svg-icon icon-class="badge" style="margin-left: 0.4rem"></svg-icon>
            </span>
            <span class="talk-time">{{ formatDateTime(talk.created_at) }}</span>
          </div>
        </div>
        <!-- 说说内容 -->
        <div class="talk-content" v-html="talk.content"></div>
        <!-- 说说图片 -->
        <div v-viewer class="talk-image">
          <img
            v-for="(img, index) in talk.img_list"
            :key="index"
            v-lazy="img"
            class="image"
            @click.prevent
          />
        </div>
        <!-- 说说信息 -->
        <div class="info" style="margin-top: 0.5rem">
          <!-- 点赞量 -->
          <span class="talk-like info">
            <svg-icon icon-class="like" size="0.8rem" style="margin-right: 5px"></svg-icon
            >{{ talk.like_count }}
          </span>
          <!-- 评论量 -->
          <span class="talk-comment info">
            <svg-icon icon-class="comment" size="0.9rem" style="margin-right: 5px"></svg-icon
            >{{ talk.comment_count }}
          </span>
        </div>
      </router-link>
      <div v-if="talkList && count > talkList.length" class="loading-warp">
        <n-button class="btn" color="#e9546b" @click="getList"> 加载更多...</n-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TalkAPI } from "@/api/talk";
import type { QueryTagReq, Talk } from "@/api/types";

import { formatDateTime } from "@/utils/date";
import { useBlogStore } from "@/store";

const blogStore = useBlogStore();

const cover = blogStore.getCover("talk");
const data = reactive({
  count: 0,
  queryParams: {
    page: 1,
    page_size: 5,
  } as QueryTagReq,
  talkList: [] as Talk[],
});
const { count, queryParams, talkList } = toRefs(data);
const getList = () => {
  TalkAPI.findTalkListApi(queryParams.value).then((res) => {
    if (queryParams.value.page == 1) {
      talkList.value = res.data.list;
    } else {
      talkList.value.push(...res.data.list);
    }
    queryParams.value.page++;
    count.value = res.data.total;
  });
};
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.talk-item {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  animation-duration: 0.5s;
  transition: all 0.2s ease-in-out 0s;
  visibility: hidden;

  &:hover {
    box-shadow: 0 0 2rem var(--box-bg-shadow);
  }

  &:not(:first-child) {
    margin-top: 1.25rem;
  }
}

.talk-meta {
  display: flex;
  align-items: center;
  width: 100%;
}

.talk-info {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
}

.user-avatar {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 10px;
}

.info {
  display: flex;
  align-items: center;
}
</style>
