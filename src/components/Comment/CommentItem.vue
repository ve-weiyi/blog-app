<template>
  <div class="reply-comment">
    <div class="reply-box-avatar">
      <img class="shoka-avatar" :src="comment.user_info?.avatar" alt="用户头像" />
    </div>

    <div class="content-warp">
      <div class="user-info">
        <div class="user-name">{{ comment.user_info?.nickname }}</div>
        <svg-icon v-if="isAdmin(comment.user_info?.user_id)" icon-class="badge" />
      </div>

      <div class="reply-content" v-html="comment.comment_content"></div>

      <div class="reply-info">
        <span class="reply-time">{{ formatDateTime(comment.created_at) }}</span>
        <span v-if="comment.client_info?.ip_source" class="reply-ip">{{
          comment.client_info?.ip_source
        }}</span>
        <span class="reply-btn" @click="$emit('reply', index, comment)">回复</span>
        <span class="reply-like" @click="$emit('like', comment)">
          <svg-icon
            class="like"
            icon-class="like"
            size="0.8rem"
            :class="likeClass(comment.id)"
            style="margin-right: 5px"
          />
          <span v-show="comment.like_count">{{ comment.like_count }}</span>
        </span>
      </div>

      <!-- 子回复列表 -->
      <div v-for="reply in comment.comment_reply_list" :key="reply.id" class="sub-reply-comment">
        <div class="sub-user-info">
          <img class="sub-reply-avatar" :src="reply.user_info?.avatar" alt="用户头像" />
          <div class="sub-user-name">{{ reply.user_info?.nickname }}</div>
          <svg-icon
            v-if="isAdmin(reply.user_info?.user_id)"
            icon-class="badge"
            style="margin-left: 5px"
          />
        </div>

        <div class="reply-content">
          <template v-if="reply.reply_user_info">
            回复
            <span class="mention">@{{ reply.reply_user_info?.nickname }}</span> :
          </template>
          <span v-html="reply.comment_content"></span>
        </div>

        <div class="reply-info">
          <span class="reply-time">{{ formatDateTime(reply.created_at) }}</span>
          <span v-if="reply.client_info?.ip_source" class="reply-ip">{{
            reply.client_info?.ip_source
          }}</span>
          <span class="reply-btn" @click="$emit('reply', index, reply)">回复</span>
          <span class="reply-like" @click="$emit('like', reply)">
            <svg-icon
              class="like"
              icon-class="like"
              size="0.8rem"
              :class="likeClass(reply.id)"
              style="margin-right: 5px"
            />
            <span v-show="reply.like_count > 0">{{ reply.like_count }}</span>
          </span>
        </div>
      </div>

      <!-- 分页 -->
      <Paging
        v-if="!showViewMore && comment.reply_count > 5"
        :total="comment.reply_count"
        @page-change="
          (current: number) => {
            $emit('changePage', index, comment, current);
          }
        "
      />

      <!-- 查看更多回复 -->
      <div v-if="showViewMore" class="view-more">
        <span>共{{ comment.reply_count }}条回复, </span>
        <span class="view-more-btn" @click="$emit('readMore', index, comment)"> 点击查看 </span>
      </div>

      <!-- 收起回复 -->
      <div v-if="!showViewMore && comment.reply_count > 5" class="view-more">
        <span class="view-more-btn" @click="$emit('collapse', index, comment)"> 收起 </span>
      </div>

      <!-- 回复框 -->
      <CommentBox
        v-if="showReplyBox"
        class="mt-4"
        :placeholder="replyPlaceholder"
        :show="true"
        :avatar="currentUserAvatar"
        @confirm="(content: string) => $emit('confirmReply', index, comment, content)"
        @cancel="$emit('cancelReply', index)"
      />

      <div class="bottom-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from "@/utils/date";
import { useUserStore } from "@/store";
import type { Comment } from "@/api/types";

interface Props {
  comment: Comment;
  index: number;
  replyIndex: number;
  currentUserAvatar: string;
  replyTarget?: Comment | any; // 添加回复目标
}

const props = defineProps<Props>();

const emit = defineEmits<{
  reply: [index: number, comment: Comment | any];
  confirmReply: [index: number, comment: Comment, content: string];
  cancelReply: [index: number];
  like: [comment: Comment | any];
  readMore: [index: number, comment: Comment];
  collapse: [index: number, comment: Comment];
  changePage: [index: number, comment: Comment, page: number];
}>();

const userStore = useUserStore();

// 计算属性
const isAdmin = (userId?: string) => userId === "1";

const likeClass = (id: number) => (userStore.isCommentLike(id) ? "like-flag" : "");

const showViewMore = computed(
  () =>
    props.comment.reply_count > 3 &&
    (!props.comment.comment_reply_list || props.comment.comment_reply_list.length <= 3)
);

const showPaging = computed(
  () =>
    props.comment.comment_reply_list &&
    props.comment.comment_reply_list.length > 0 &&
    props.comment.reply_count > 5
);

const showReplyBox = computed(() => props.replyIndex === props.index);

const replyPlaceholder = computed(() => {
  console.log("props.replyIndex", props.replyIndex);
  console.log("props.index", props.index);

  if (props.replyIndex !== props.index) return "编辑一条回复吧~";

  // 如果有回复目标且回复目标有parent_id，说明是回复子评论
  return props.replyTarget?.parent_id
    ? `回复@${props.replyTarget.user_info?.nickname}:`
    : "编辑一条回复吧~";
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.reply-comment {
  display: flex;
  padding-top: 1rem;

  .content-warp {
    flex: auto;
    margin-left: 0.6rem;
  }

  .bottom-line {
    border-bottom: 1px solid var(--grey-3);
    margin-top: 0.5rem;
  }
}

.reply-box-avatar {
  .shoka-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
    margin-right: 0.3125rem;
  }
}

.sub-reply-comment {
  position: relative;
  padding: 8px 0 8px 33px;
  font-size: 15px;
  line-height: 24px;

  .sub-user-info {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    line-height: 24px;
  }

  .sub-user-name {
    font-size: 13px;
    line-height: 24px;
    color: var(--text-color-1);
    font-weight: 500;
  }
}

.sub-reply-avatar {
  position: absolute;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.reply-info {
  display: flex;
  align-items: center;
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: #9499a0;

  .reply-time {
    margin-right: 15px;
    padding-top: 2px;
  }

  .reply-ip {
    margin-right: 15px;
    padding-top: 2px;
    color: #9499a0;
    font-size: 0.75rem;
  }

  .reply-btn {
    cursor: pointer;
    transition: color 0.2s ease;
    margin-right: 17px;

    &:hover {
      color: var(--color-pink);
    }
  }

  .reply-like {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover .like {
      color: var(--color-pink);
    }
  }
}

.reply-content {
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 0.9375rem;
  line-height: 1.5;
  vertical-align: baseline;
  margin-bottom: 8px;
}

.mention {
  color: #008ac5;
  font-weight: 500;
}

.view-more {
  font-size: 13px;
  color: #9499a0;
  margin: 8px 0;

  .view-more-btn {
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-pink);
    }
  }
}

.like-flag {
  color: var(--color-pink) !important;
}
</style>
