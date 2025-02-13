<template>
  <img class="message-cover" :src="cover" alt="" />
  <!-- 弹幕输入框 -->
  <div class="message-container">
    <h1 class="message-title">留言板</h1>
    <div class="message-input">
      <input
        v-model="addMessageContent"
        class="input"
        placeholder="说点什么吧"
        @click="show = true"
        @keyup.enter="AddMessage"
      />
      <button v-show="show" class="send" @click="AddMessage">发送</button>
    </div>
  </div>
  <!-- 弹幕列表 -->
  <div class="danmaku-container">
    <vue-danmaku
      ref="danmaku"
      v-model:danmus="messageList"
      class="danmaku"
      use-slot
      :is-suspend="true"
      v-bind="config"
    >
      <template v-slot:dm="{ index, danmu }">
        <span class="danmaku-item">
          <img :src="danmu.avatar" width="30" height="30" style="border-radius: 50%" alt="" />
          <span class="ml">{{ danmu.nickname }} :</span>
          <span class="ml">{{ danmu.message_content }}</span>
        </span>
      </template>
    </vue-danmaku>
  </div>
</template>

<script setup lang="ts">
import { addRemarkApi, findRemarkListApi } from "@/api/remark";
import { Remark as Message } from "@/api/types";
import { useBlogStore, useUserStore } from "@/store";
import vueDanmaku from "vue3-danmaku";

const userStore = useUserStore();
const blogStore = useBlogStore();

const cover = blogStore.getCover("about");
const config = ref({
  channels: 7, // 轨道数量，为0则弹幕轨道数会撑满容器
  useSlot: true, // 是否开启slot
  loop: false, // 是否开启弹幕循环
  speeds: 100, // 弹幕速度
  fontSize: 20, // 文本模式下的字号
  top: 5, // 弹幕轨道间的垂直间距
  right: 10, // 同一轨道弹幕的水平间距
  debounce: 100, // 弹幕刷新频率（多少毫秒插入一条弹幕，建议不小于50）
  randomChannel: true, // 随机弹幕轨道
});

const addMessageContent = ref("");
const show = ref(false);
const danmaku = ref();
const messageList = ref<Message[]>([]);
onMounted(async () => {
  findRemarkListApi().then((res) => {
    messageList.value = res.data.list;
  });
});
const AddMessage = () => {
  if (addMessageContent.value.trim() == "") {
    window.$message?.warning("留言内容不能为空");
    return false;
  }
  const userAvatar = userStore.userInfo.avatar
    ? userStore.userInfo.avatar
    : blogStore.blogInfo.website_config.tourist_avatar;
  const userNickname = userStore.userInfo.nickname ? userStore.userInfo.nickname : "游客";
  const message = {
    avatar: userAvatar,
    nickname: userNickname,
    message_content: addMessageContent.value,
    time: Math.floor(Math.random() * (10 - 7)) + 7,
  };
  addRemarkApi(message).then((res) => {
    if (blogStore.blogInfo.website_config.is_message_review) {
      window.$message?.warning("留言成功，正在审核中");
    } else {
      danmaku.value.push(message);
      window.$message?.success("留言成功");
    }
    addMessageContent.value = "";
  });
};
</script>

<style lang="scss" scoped>
.message-container {
  position: fixed;
  top: 35%;
  left: 0;
  right: 0;
  width: 22.5rem;
  margin: 0 auto;
  text-align: center;
  color: #fff;
  z-index: 5;
}

.message-title {
  animation: title-scale 1s;
}

.message-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  z-index: -10;
  animation: header-effect 1s;
}

.message-input {
  display: flex;
  justify-content: center;
  height: 2.5rem;
  margin-top: 2rem;
}

.message-input .input {
  width: 70%;
  height: 100%;
  border-radius: 1.25rem;
  padding: 0 1.25rem;
  outline: none;
  color: #eee;
  border: #fff 1px solid;
  z-index: 10;
}

.message-input .input::-webkit-input-placeholder {
  color: #eeee;
}

.message-input .send {
  height: 100%;
  padding: 0 1.25rem;
  color: #eee;
  border: #fff 1px solid;
  border-radius: 20px;
  outline: none;
  animation: slideUpIn 0.3s;
}

.danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--color-blue);
  background: url("https://static.ttkwsd.top/config/e3408389cb0d4ea1b5f651873dab2a19.jpg") center
    no-repeat;
  animation: slideDownIn 1s;
}

.danmaku {
  position: fixed;
  top: 3.125rem;
  width: 100%;
  height: 100%;

  .danmaku-item {
    display: flex;
    align-items: center;
    padding: 0 0.625rem 0 0.3125rem;
    border-radius: 6.25rem;
    background-color: rgba(0, 0, 0, 0.3);
    color: #fff;
  }

  .ml {
    margin-left: 0.5rem;
  }
}
</style>
