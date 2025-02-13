<template>
  <div id="reply-wrap" class="reply-warp">
    <div class="reply-title">
      <svg-icon icon-class="comment" size="1.4rem" style="margin-right: 5px"></svg-icon>
      评论
    </div>
    <ReplyBox
      ref="replyRef"
      placeholder="发一条友善的评论"
      :avatar="userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar"
      @confirm="insertComment"
      @cancel="clearComment"
    ></ReplyBox>
    <div v-if="count > 0">
      <div v-for="(comment, index) of commentList" :key="comment.id" class="reply-comment">
        <div class="reply-box-avatar">
          <img class="shoka-avatar" :src="comment.user?.avatar" />
        </div>
        <div class="content-warp">
          <div class="user-info">
            <div class="user-name">{{ comment.user?.nickname }}</div>
            <svg-icon v-if="comment.user?.user_id == '1'" icon-class="badge"></svg-icon>
          </div>
          <div class="reply-content" v-html="comment.comment_content"></div>
          <div class="reply-info">
            <span class="reply-time">{{ formatDateTime(comment.created_at) }}</span>
            <span class="reply-like" @click="likeComment(comment)">
              <svg-icon
                class="like"
                icon-class="like"
                size="0.8rem"
                :class="isLike(comment.id)"
                style="margin-right: 5px"
              ></svg-icon>
              <span v-show="comment.like_count">{{ comment.like_count }}</span>
            </span>
            <span class="reply-btn" @click="handleReply(index, comment)">回复</span>
          </div>
          <div
            v-for="reply of comment.comment_reply_list"
            :key="reply.id"
            class="sub-reply-comment"
          >
            <div class="sub-user-info">
              <img class="sub-reply-avatar" :src="reply.user?.avatar" />
              <div class="sub-user-name">{{ reply.user?.nickname }}</div>
              <svg-icon
                v-if="reply.user?.user_id == '1'"
                icon-class="badge"
                style="margin-left: 5px"
              ></svg-icon>
            </div>
            <span class="reply-content">
              <template v-if="reply.reply_user != null">
                回复
                <span style="color: #008ac5">@{{ reply.reply_user?.nickname }}</span> :
              </template>
              <span v-html="reply.comment_content"></span>
            </span>
            <div class="reply-info">
              <span class="reply-time">{{ formatDateTime(reply.created_at) }}</span>
              <span class="reply-like" @click="likeComment(reply)">
                <svg-icon
                  class="like"
                  icon-class="like"
                  size="0.8rem"
                  :class="isLike(reply.id)"
                  style="margin-right: 5px"
                ></svg-icon>
                <span v-show="reply.like_count > 0">{{ reply.like_count }}</span>
              </span>
              <span class="reply-btn" @click="handleReply(index, reply)">回复</span>
            </div>
          </div>
          <div v-show="comment.reply_count > 3" ref="readMoreRef" class="view-more">
            <span>共{{ comment.reply_count }}条回复, </span>
            <span class="view-more-btn" @click="readMoreComment(index, comment)">点击查看</span>
          </div>
          <Paging
            ref="pageRef"
            :total="comment.reply_count"
            @get-current-page="
              (current: number) => {
                changeReplyCurrent(index, comment, current);
              }
            "
          ></Paging>
          <ReplyBox
            ref="replyCommentRef"
            class="mt-4"
            placeholder="编辑一条回复吧~"
            :show="replyCommentIndex == index"
            :avatar="userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar"
            @confirm="confirmReply(index, comment)"
            @cancel="cancelReply(index, comment)"
          >
          </ReplyBox>
          <div class="bottom-line"></div>
        </div>
      </div>
      <div v-if="count > commentList.length" class="loading-warp">
        <n-button class="btn" color="#e9546b" @click="listComments"> 加载更多...</n-button>
      </div>
    </div>
    <div v-else style="padding: 1.25rem; text-align: center">来发评论吧~</div>
  </div>
</template>

<script setup lang="ts">
import {
  addCommentApi,
  findCommentListApi,
  findCommentReplyListApi,
  likeCommentApi,
} from "@/api/comment";
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import { Comment, CommentNewReq, CommentQueryReq, CommentReply } from "@/api/types";
import { replaceEmoji } from "@/utils/emojis";

const props = defineProps({
  commentType: {
    type: Number,
  },
});

const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

const pageRef = ref<any>([]);
const readMoreRef = ref<any>([]);
const emit = defineEmits(["getCommentCount"]);
const typeId = computed(() =>
  Number(useRoute().params.id) ? Number(useRoute().params.id) : undefined
);
const isLike = computed(() => (id: number) => (userStore.isCommentLike(id) ? "like-flag" : ""));

const data = reactive({
  count: 10,
  queryParams: {
    current: 1,
    page_size: 10,
    typeId: typeId.value,
    commentType: props.commentType,
  },
});
const { count, queryParams } = toRefs(data);

// 父组件向子组件传输的数据

// 获取路由参数
const route = useRoute();

const commentList = ref<Comment[]>([]);

const replyRef = ref();
const replyCommentRef = ref();
const replyCommentIndex = ref(-1);

// 新增评论
function insertComment() {
  // 判断登录
  if (!userStore.isLogin()) {
    appStore.loginFlag = true;
    return false;
  }
  let content = replyRef.value.content;
  // 判空
  if (content.trim() === "") {
    window.$message?.error("评论不能为空");
    return false;
  }
  // 解析表情
  content = replaceEmoji(content);

  // 发送请求
  const path = route.path;
  const arr = path.split("/");
  const comment: CommentNewReq = {
    topic_id: parseInt(arr[2]) | 0,
    reply_user_id: "",
    parent_id: 0,
    comment_content: content,
    type: props.commentType,
  };

  addCommentApi(comment)
    .then((res) => {
      const isReview = blogStore.blogInfo.website_config.is_comment_review;
      if (isReview) {
        window.$message?.success("评论成功，正在审核中");
      } else {
        window.$message?.success("评论成功");
      }
      // 查询最新评论
      queryParams.value.current = 1;
      listComments();
    })
    .catch((err) => {
      window.$message?.error(err.message);
    });

  replyRef.value.content = "";
}

// 清空评论
function clearComment() {
  replyRef.value.content = "";
}

// 回复评论
function handleReply(index: number, comment: Comment | CommentReply) {
  console.log("handleReply", index, comment.user_id, userStore.userInfo.user_id);
  if (replyCommentIndex.value == index) {
    replyCommentIndex.value = -1;
    return;
  }
  replyCommentIndex.value = index;
  const replyComponent = replyCommentRef.value[index];
  if (comment.user_id != userStore.userInfo.user_id) {
    replyComponent.placeholder = "回复@" + comment.user?.nickname + ":";
  } else {
    replyComponent.placeholder = "编辑一条回复吧~";
  }
}

// 确认回复
function confirmReply(index: number, comment: Comment | CommentReply) {
  // 判断登录
  if (!userStore.isLogin()) {
    appStore.loginFlag = true;
    return false;
  }
  const replyComponent = replyCommentRef.value[index];

  let content = replyComponent.content;
  if (content.trim() == "") {
    window.$message?.error("回复不能为空");
    return false;
  }

  const path = route.path;
  const arr = path.split("/");
  const newComment: CommentNewReq = {
    topic_id: 0,
    parent_id: comment.parent_id != 0 ? comment.parent_id : comment.id,
    reply_user_id: comment.user_id != userStore.userInfo.user_id ? comment.user_id : "",
    comment_content: replaceEmoji(content),
    type: props.commentType,
  };
  switch (props.commentType) {
    case 1:
    case 3:
      newComment.topic_id = parseInt(arr[2]);
      break;
    default:
      break;
  }

  addCommentApi(newComment)
    .then((res) => {
      replyCommentIndex.value = -1;
      const isReview = blogStore.blogInfo.website_config.is_comment_review;
      if (isReview) {
        window.$message?.success("评论成功，正在审核中");
      } else {
        window.$message?.success("评论成功");
      }
      // 查询最新评论
      queryParams.value.current = 1;
      listComments();
    })
    .catch((err) => {
      window.$message?.error(err.message);
    });

  replyComponent.content = "";
}

// 取消回复
function cancelReply(index: number, comment: Comment) {
  replyCommentIndex.value = -1;
  const replyComponent = replyCommentRef.value[index];
  replyComponent.content = "";
}

// 查看更多回复
function readMoreComment(index: number, comment: Comment) {
  const path = route.path;
  const arr = path.split("/");
  const data: CommentQueryReq = {
    page: 1,
    page_size: 5,
    topic_id: parseInt(arr[2]) | 0,
    parent_id: comment.id,
    // session_id: -1,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  findCommentReplyListApi(data).then((res) => {
    comment.comment_reply_list = res.data.list;
    // 回复大于5条展示分页
    if (Math.ceil(comment.reply_count / 5) > 1) {
      pageRef.value[index].setPaging(true);
    }
    // 隐藏查看更多
    readMoreRef.value[index].style.display = "none";
  });
}

function changeReplyCurrent(index: number, comment: Comment, page: number) {
  // console.log("changeReplyCurrent", current, index, commentId)
  const path = route.path;
  const arr = path.split("/");
  const data: CommentQueryReq = {
    page: page,
    page_size: 5,
    topic_id: parseInt(arr[2]) | 0,
    parent_id: comment.id,
    // session_id: -1,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  findCommentReplyListApi(data).then((res) => {
    comment.comment_reply_list = res.data.list;
  });
}

function likeComment(comment: Comment | CommentReply) {
  // 判断登录
  if (!userStore.isLogin()) {
    appStore.loginFlag = true;
    return false;
  }

  const data = {
    id: comment.id,
  };
  likeCommentApi(data).then((res) => {
    if (userStore.isCommentLike(comment.id)) {
      window.$message?.error("取消点赞成功");
      comment.like_count--;
    } else {
      window.$message?.success("点赞成功");
      comment.like_count++;
    }
    userStore.commentLike(comment.id);
  });
}

// 查看评论
const listComments = () => {
  const path = route.path;
  const arr = path.split("/");
  const data: CommentQueryReq = {
    page: queryParams.value.current,
    page_size: queryParams.value.page_size,
    topic_id: parseInt(arr[2]) | 0,
    parent_id: 0,
    type: props.commentType,
    sorts: ["created_at desc"],
  };

  findCommentListApi(data).then((res) => {
    console.log(res);
    if (queryParams.value.current === 1) {
      commentList.value = res.data.list;
    } else {
      commentList.value.push(...res.data.list);
    }
    queryParams.value.current = res.data.page + 1;
    queryParams.value.page_size = res.data.page_size;
    count.value = res.data.total;
  });
};

onMounted(() => {
  userStore.getUserLike();
  listComments();
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

.sub-reply-avatar {
  position: absolute;
  left: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

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
    display: inline-flex;
    align-items: center;
    margin-right: 9px;
    line-height: 24px;
  }

  .sub-user-name {
    font-size: 13px;
    line-height: 24px;
  }
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

  .reply-like {
    display: flex;
    align-items: center;
    margin-right: 17px;
    cursor: pointer;

    &:hover .like {
      color: var(--color-pink);
    }
  }

  .reply-btn {
    cursor: pointer;

    &:hover {
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
}

.view-more {
  font-size: 13px;
  color: #9499a0;

  .view-more-btn {
    cursor: pointer;

    &:hover {
      color: var(--color-pink);
    }
  }
}
</style>
