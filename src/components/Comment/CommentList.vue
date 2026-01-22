<template>
  <div id="reply-wrap" class="reply-warp">
    <div class="reply-title">
      <svg-icon icon-class="comment" size="1.4rem" style="margin-right: 5px"></svg-icon>
      评论
    </div>

    <CommentBox
      ref="replyRef"
      placeholder="发一条友善的评论"
      :avatar="currentUserAvatar"
      @confirm="handleInsertComment"
      @cancel="handleClearComment"
    />

    <div v-if="hasComments">
      <CommentItem
        v-for="(comment, index) in commentList"
        :key="comment.id"
        :comment="comment"
        :index="index"
        :reply-index="replyCommentIndex"
        :reply-target="replyTarget"
        :current-user-avatar="currentUserAvatar"
        @reply="handleReply"
        @confirm-reply="handleConfirmReply"
        @cancel-reply="handleCancelReply"
        @like="handleLikeComment"
        @read-more="handleReadMoreComment"
        @change-page="handleChangeReplyCurrent"
        @collapse="handleCollapseComment"
      />

      <div v-if="hasMoreComments" class="loading-warp">
        <n-button class="btn" color="#e9546b" :loading="loading" @click="loadMoreComments">
          {{ loading ? "加载中..." : "加载更多..." }}
        </n-button>
      </div>
    </div>

    <div v-else class="empty-comments">来发评论吧~</div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import { CommentAPI } from "@/api/comment";
import type { Comment, CommentReply, NewCommentReq, QueryCommentReq } from "@/api/types";
import { replaceEmoji } from "@/utils/emojis";
import CommentItem from "./CommentItem.vue";

interface Props {
  commentType?: number;
}

const props = withDefaults(defineProps<Props>(), {
  commentType: 1,
});

const emit = defineEmits<{
  getCommentCount: [count: number];
}>();

// Store
const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

// Route
const route = useRoute();

// Refs
const replyRef = ref();
const loading = ref(false);
const commentList = ref<Comment[]>([]);
const replyCommentIndex = ref(-1);
const replyTarget = ref<Comment | any>(null);

// Computed
const typeId = computed(() => {
  const id = Number(route.params.id);
  return id || undefined;
});

const currentUserAvatar = computed(
  () => userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar
);

const hasComments = computed(() => commentList.value.length > 0);
const hasMoreComments = computed(() => count.value > commentList.value.length);

// Reactive data
const queryParams = reactive({
  current: 1,
  page_size: 10,
  typeId: typeId.value,
  commentType: props.commentType,
});

const count = ref(0);

// 工具函数
const checkLogin = () => {
  if (!userStore.isLogin()) {
    appStore.setLoginFlag(true);
    return false;
  }
  return true;
};

const getTopicId = () => {
  const pathSegments = route.path.split("/");
  return parseInt(pathSegments[2]) || 0;
};

const showMessage = (type: "success" | "error", message: string) => {
  window.$message?.[type](message);
};

const getReviewMessage = (isReview: number) =>
  isReview == 1 ? "评论成功，正在审核中" : "评论成功";

// 评论相关操作
const handleInsertComment = async () => {
  if (!checkLogin()) return;

  const content = replyRef.value?.content?.trim();
  if (!content) {
    showMessage("error", "评论不能为空");
    return;
  }

  const comment: NewCommentReq = {
    topic_id: getTopicId(),
    reply_user_id: "",
    parent_id: 0,
    comment_content: replaceEmoji(content),
    type: props.commentType,
  };

  try {
    loading.value = true;
    await CommentAPI.addCommentApi(comment);

    const isReview = blogStore.blogInfo.website_config.website_feature.is_comment_review;
    showMessage("success", getReviewMessage(isReview));

    queryParams.current = 1;
    await loadComments();
    replyRef.value.content = "";
  } catch (error: any) {
    showMessage("error", error.message);
  } finally {
    loading.value = false;
  }
};

const handleClearComment = () => {
  if (replyRef.value) {
    replyRef.value.content = "";
  }
};

const handleReply = (index: number, comment: Comment | CommentReply) => {
  if (replyCommentIndex.value === index) {
    replyCommentIndex.value = -1;
    replyTarget.value = null;
  } else {
    replyCommentIndex.value = index;
    replyTarget.value = comment;
  }
};

const handleConfirmReply = async (
  index: number,
  comment: Comment | CommentReply,
  content: string
) => {
  if (!checkLogin()) return;

  if (!content.trim()) {
    showMessage("error", "回复不能为空");
    return;
  }

  const newComment: NewCommentReq = {
    topic_id: [1, 3].includes(props.commentType) ? getTopicId() : 0,
    parent_id: comment.parent_id || comment.id,
    reply_user_id: replyTarget.value?.user_id || "",
    comment_content: replaceEmoji(content),
    type: props.commentType,
  };

  try {
    loading.value = true;
    await CommentAPI.addCommentApi(newComment);

    replyCommentIndex.value = -1;
    replyTarget.value = null;
    const isReview = blogStore.blogInfo.website_config.website_feature.is_comment_review;
    showMessage("success", getReviewMessage(isReview));

    queryParams.current = 1;
    await loadComments();
  } catch (error: any) {
    showMessage("error", error.message);
  } finally {
    loading.value = false;
  }
};

const handleCancelReply = (index: number) => {
  replyCommentIndex.value = -1;
  replyTarget.value = null;
};

const handleLikeComment = async (comment: Comment | CommentReply) => {
  if (!checkLogin()) return;

  try {
    await CommentAPI.likeCommentApi({ id: comment.id });

    const isLiked = userStore.isCommentLike(comment.id);
    if (isLiked) {
      comment.like_count--;
      showMessage("success", "取消点赞成功");
    } else {
      comment.like_count++;
      showMessage("success", "点赞成功");
    }

    userStore.commentLike(comment.id);
  } catch (error: any) {
    showMessage("error", error.message);
  }
};

const handleReadMoreComment = async (index: number, comment: Comment) => {
  const queryData: QueryCommentReq = {
    page: 1,
    page_size: 5,
    topic_id: getTopicId(),
    parent_id: comment.id,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  try {
    const res = await CommentAPI.findCommentReplyListApi(queryData);
    comment.comment_reply_list = res.data.list;

    // 如果回复数量大于5条，显示分页
    if (Math.ceil(comment.reply_count / 5) > 1) {
      // 通过nextTick确保分页组件正常显示
      nextTick(() => {
        // 分页组件会自动显示
      });
    }
  } catch (error: any) {
    showMessage("error", error.message);
  }
};

const handleChangeReplyCurrent = async (index: number, comment: Comment, page: number) => {
  const queryData: QueryCommentReq = {
    page,
    page_size: 5,
    topic_id: getTopicId(),
    parent_id: comment.id,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  try {
    const res = await CommentAPI.findCommentReplyListApi(queryData);
    comment.comment_reply_list = res.data.list;
  } catch (error: any) {
    showMessage("error", error.message);
  }
};

const handleCollapseComment = (index: number, comment: Comment) => {
  comment.comment_reply_list = [];
};

// 原始的changeReplyCurrent函数
const changeReplyCurrent = (index: number, comment: Comment, current: number) => {
  handleChangeReplyCurrent(index, comment, current);
};

// 加载评论
const loadComments = async () => {
  const queryData: QueryCommentReq = {
    page: queryParams.current,
    page_size: queryParams.page_size,
    topic_id: getTopicId(),
    parent_id: 0,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  try {
    loading.value = true;
    const res = await CommentAPI.findCommentListApi(queryData);

    if (queryParams.current === 1) {
      commentList.value = res.data.list;
    } else {
      commentList.value.push(...res.data.list);
    }

    queryParams.current = res.data.page + 1;
    queryParams.page_size = res.data.page_size;
    count.value = res.data.total;

    emit("getCommentCount", count.value);
  } catch (error: any) {
    showMessage("error", error.message);
  } finally {
    loading.value = false;
  }
};

const loadMoreComments = () => {
  loadComments();
};

// 生命周期
onMounted(async () => {
  if (userStore.isLogin()) {
    await userStore.getUserLike();
  }
  await loadComments();
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.reply-title {
  display: flex;
  align-items: center;
  margin: 22px 0;
  padding-left: 10px;
  font-size: 20px;
  font-weight: 600;
  line-height: 40px;
}

.loading-warp {
  display: flex;
  justify-content: center;
  padding: 20px;

  .btn {
    min-width: 120px;
  }
}

.empty-comments {
  padding: 1.25rem;
  text-align: center;
  color: var(--text-color-3);
  font-size: 14px;
}
</style>
