<template>
  <div class="page-header">
    <h1 class="page-title">说说</h1>
    <img class="page-cover" :src="cover" alt="" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div v-if="talk" class="page-container">
      <div class="talk-item">
        <div class="talk-meta">
          <img class="user-avatar" :src="talk.user_info?.avatar" />
        </div>
        <div class="talk-content-wrap">
          <div class="talk-info">
            <span class="talk-user-name">
              {{ talk.user_info?.nickname }}
              <svg-icon icon-class="badge" style="margin-left: 0.4rem"></svg-icon>
            </span>
            <span class="talk-time">{{ formatDateTime(talk.created_at) }}</span>
          </div>
          <div class="talk-content" v-html="talk.content"></div>
          <div v-if="talk.img_list" v-viewer class="talk-image">
            <img
              v-for="(img, index) in talk.img_list"
              :key="index"
              v-lazy="img"
              class="image"
              @click.prevent
            />
          </div>
          <div class="info" style="margin-top: 0.5rem">
            <span class="talk-like info" @click="toggleLike">
              <svg-icon
                icon-class="like"
                size="0.8rem"
                :class="talk.liked ? 'like-flag' : ''"
                style="margin-right: 5px"
              ></svg-icon>
              {{ talk.like_count }}
            </span>
            <span class="talk-comment info">
              <svg-icon icon-class="comment" size="0.9rem" style="margin-right: 5px"></svg-icon>
              {{ commentCount == null ? 0 : commentCount }}
            </span>
          </div>
        </div>
      </div>
      <CommentList :comment-type="commentType" @get-comment-count="getCommentCount"></CommentList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TalkAPI } from "@/api";
import type { Talk } from "@/api";
import { useAppStore, useBlogStore, useUserStore } from "@/stores";
import { formatDateTime } from "@/utils/date";

const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

const cover = blogStore.getCover("talk");
const route = useRoute();
const data = reactive({
  commentCount: 0,
  commentType: 3,
  talk: {} as Talk,
});
const { commentCount, commentType, talk } = toRefs(data);
const getCommentCount = (count: number) => {
  commentCount.value = count;
};
// 点赞状态由服务端返回：changed 为 false 表示幂等命中，此时不动计数
const toggleLike = () => {
  if (!userStore.isLogin()) {
    appStore.setLoginFlag(true);
    return;
  }
  const id = talk.value.id;
  const request = talk.value.liked ? TalkAPI.unlikeTalk : TalkAPI.likeTalk;
  request({ id }).then((res) => {
    if (res.data?.changed) {
      talk.value.like_count += res.data.liked ? 1 : -1;
    }
    talk.value.liked = res.data?.liked ?? false;
    window.$message?.info(res.data?.liked ? "点赞成功" : "取消点赞成功");
  });
};
onMounted(() => {
  TalkAPI.getTalk({ id: Number(route.params.id) }).then((res) => {
    talk.value = res.data;
  });
});
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss" as *;

.talk-item {
  display: flex;
}

.talk-meta {
  @include flex;
  width: 3rem;
  height: 3.125rem;
}

.talk-content-wrap {
  flex: auto;
  margin-left: 0.5rem;
}

.talk-info {
  display: flex;
  flex-direction: column;
}

.user-avatar {
  width: 100%;
  height: 3rem;
  border-radius: 50%;
}

.info {
  display: flex;
  align-items: center;
}
</style>
