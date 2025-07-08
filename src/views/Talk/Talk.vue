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
          <img class="user-avatar" :src="talk.user?.avatar" />
        </div>
        <div class="talk-content-wrap">
          <div class="talk-info">
            <span class="talk-user-name">
              {{ talk.user?.nickname }}
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
            <span class="talk-like info" @click="like">
              <svg-icon
                icon-class="like"
                size="0.8rem"
                :class="isLike(talk.id)"
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
import { TalkAPI } from "@/api/talk";
import type { Talk } from "@/api/types";
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import { formatDateTime } from "@/utils/date";

const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

const cover = blogStore.getCover("talk");
const route = useRoute();
const isLike = computed(() => (id: number) => (userStore.isTalkLike(id) ? "like-flag" : ""));
const data = reactive({
  commentCount: 0,
  commentType: 3,
  talk: {} as Talk,
});
const { commentCount, commentType, talk } = toRefs(data);
const getCommentCount = (count: number) => {
  commentCount.value = count;
};
const like = () => {
  if (!userStore.isLogin()) {
    appStore.setLoginFlag(true);
    return;
  }
  let id = talk.value.id;
  TalkAPI.likeTalkApi({ id }).then((res) => {
    //判断是否点赞
    if (userStore.isTalkLike(id)) {
      window.$message?.error("取消点赞成功");
      talk.value.like_count--;
    } else {
      window.$message?.success("点赞成功");
      talk.value.like_count++;
    }
    userStore.talkLike(id);
  });
};
onMounted(() => {
  TalkAPI.getTalkApi({ id: Number(route.params.id) }).then((res) => {
    talk.value = res.data;
  });
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

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
