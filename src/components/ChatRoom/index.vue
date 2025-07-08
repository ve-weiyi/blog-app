<template>
  <div>
    <div v-show="show" class="chat-container">
      <div class="chat-header">
        <img width="32" height="32" :src="chatroom" />
        <div style="margin-left: 12px">
          <div>聊天室</div>
          <div style="font-size: 12px">当前{{ onlineCount }}人在线</div>
        </div>
        <svg-icon class="close" icon-class="close" size="1.2rem" @click="show = false"></svg-icon>
      </div>
      <div id="chat-content" class="chat-content">
        <div
          v-for="(chat, index) of recordList"
          class="chat-item"
          :class="isMy(chat) ? 'my-chat' : ''"
        >
          <img class="user-avatar" :src="chat.avatar || defaultAvatar" alt="" />
          <div :class="isMy(chat) ? 'right-info' : 'left-info'">
            <div class="user-info" :class="isMy(chat) ? 'my-chat' : ''">
              <span style="color: var(--color-red)">{{ chat.nickname || chat.ip_address }}</span>
              <span
                style="color: var(--color-blue)"
                :class="isMy(chat) ? 'right-info' : 'left-info'"
              >
                {{ formatDateTime(chat.created_at) }}
              </span>
            </div>
            <div
              class="user-content"
              :class="isMy(chat) ? 'my-content' : ''"
              @contextmenu.prevent.stop="showBack(chat, index, $event)"
            >
              <div v-html="chat.content"></div>
              <div ref="backBtn" class="back-menu" @click="back(chat, index)">撤回</div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-footer">
        <textarea
          v-model="chatContent"
          class="chat-input"
          placeholder="开始聊天吧"
          @keydown="handleKeyCode($event)"
        ></textarea>
        <Emoji @add-emoji="handleEmoji" @choose-type="handleType"></Emoji>
        <svg-icon class="send-btn" icon-class="plane" size="1.5rem" @click="handleSend"></svg-icon>
      </div>
    </div>
    <div class="chat-btn" @click="handleOpen">
      <span v-if="unreadCount > 0" class="unread">{{ unreadCount }}</span>
      <img width="64" height="64" :src="chatroom" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore, useUserStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import { emojiList } from "@/utils/emoji";
import { tvList } from "@/utils/tv";
import type { ChatMessageEvent, MessageEvent } from "@/api/types";
import chatroom from "@/assets/images/chatroom.png";
import { Client, type IMessage } from "@stomp/stompjs";
import { getTerminalId, getToken, getUid } from "@/utils/token.ts";

const userStore = useUserStore();
const blogStore = useBlogStore();
const data = reactive({
  show: false,
  recordList: [] as ChatMessageEvent[],
  chatContent: "",
  emojiType: 0,
  unreadCount: 0,
  onlineCount: 0,
});

enum Type {
  ONLINE_COUNT = 1, // 在线人数
  HISTORY_RECORD = 2, // 历史记录
  SEND_MESSAGE = 3, // 发送消息
  RECALL_MESSAGE = 4, // 撤回消息
  HEART_BEAT = 5, // 心跳
  CLIENT_INFO = 6, // 客户端信息
}

const { show, recordList, chatContent, emojiType, unreadCount, onlineCount } = toRefs(data);

const stompClient = ref<Client>();
const subscription = ref();
const chatTopic = "/topic/chatroom"; // 改成你服务端广播的订阅路径

const defaultAvatar = ref(blogStore.blogInfo.website_config.tourist_avatar);

const clientInfo = {
  ip_address: "",
  ip_source: "",
};

const isMy = computed(
  () => (chat: ChatMessageEvent) =>
    chat.ip_address == clientInfo.ip_address ||
    (chat.user_id !== "" && chat.user_id === userStore.userInfo.user_id)
);

// 打开聊天面板
const handleOpen = () => {
  if (!stompClient.value || !stompClient.value.connected) {
    initStomp();
  }
  unreadCount.value = 0;
  show.value = !show.value;
};

// 初始化 STOMP 客户端
const initStomp = () => {
  const url =
    import.meta.env.VITE_APP_WS_ENDPOINT || blogStore.blogInfo.website_config.websocket_url;
  stompClient.value = new Client({
    connectHeaders: {
      login: getUid(),
      passcode: getToken(),
    },
    brokerURL: url,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect() {
      subscription.value = stompClient.value?.subscribe(chatTopic, handleMessage, {});
    },
    onWebSocketClose() {
      console.warn("连接关闭");
    },
    onStompError(frame) {
      console.error("STOMP 错误", frame);
    },
  });

  stompClient.value.activate();
};

// 接收消息
const handleMessage = (message: IMessage) => {
  if (!message.body) return;
  const res: MessageEvent = JSON.parse(message.body);
  switch (res.type) {
    case 1: // ONLINE_COUNT
      onlineCount.value = JSON.parse(res.data).count;
      break;
    case 2: // HISTORY_RECORD
      recordList.value = JSON.parse(res.data).list;
      break;
    case 3: // SEND_MESSAGE
      const record = JSON.parse(res.data);
      recordList.value.push(record);
      if (!show.value) {
        unreadCount.value++;
      }
      break;
    case 4: // RECALL_MESSAGE
      const recall = JSON.parse(res.data);
      recordList.value = recordList.value.filter((item) => item.id !== recall.id);
      break;
    case 6: // CLIENT_INFO
      clientInfo.ip_address = JSON.parse(res.data).ip_address;
      clientInfo.ip_source = JSON.parse(res.data).ip_source;
      break;
  }
};

// 发送消息
const handleSend = () => {
  if (chatContent.value.trim() === "") {
    window.$message?.error("内容不能为空");
    return;
  }
  chatContent.value = chatContent.value.replace(/\[.+?\]/g, (str) => {
    if (emojiType.value === 0 && emojiList[str]) {
      return `<img src="${emojiList[str]}" width="21" height="21" style="margin: 0 1px;vertical-align: text-bottom"/>`;
    }
    if (emojiType.value === 1 && tvList[str]) {
      return `<img src="${tvList[str]}" width="21" height="21" style="margin: 0 1px;vertical-align: text-bottom"/>`;
    }
    return str;
  });

  let chat: ChatMessageEvent = {
    id: 0,
    type: "text",
    content: chatContent.value,
    user_id: userStore.userInfo.user_id,
    terminal_id: getTerminalId(),
    nickname: userStore.userInfo.nickname || clientInfo.ip_address,
    avatar: userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar,
    ip_address: clientInfo.ip_address,
    ip_source: clientInfo.ip_source,
    status: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  let msg: MessageEvent = {
    type: Type.SEND_MESSAGE,
    timestamp: Date.now(),
    data: JSON.stringify(chat),
  };

  stompClient.value?.publish({
    destination: chatTopic,
    headers: {
      uid: getUid(),
      client: getTerminalId(),
    },
    body: JSON.stringify(msg),
  });

  chatContent.value = "";
};

// 撤回消息
const back = (item: ChatMessageEvent, index: number) => {
  const msg: MessageEvent = {
    type: 4,
    timestamp: Date.now(),
    data: JSON.stringify({ id: item.id }),
  };
  stompClient.value?.publish({
    destination: chatTopic,
    body: JSON.stringify(msg),
  });
};

// 表情操作
const handleEmoji = (key: string) => {
  chatContent.value += key;
};
const handleType = (key: number) => {
  emojiType.value = key;
};

// 输入事件处理
const handleKeyCode = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "Enter") {
    chatContent.value += "\n";
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
};

// 展示撤回按钮
const backBtn = ref<any>([]);
const showBack = (chat: ChatMessageEvent, index: number, e: MouseEvent) => {
  backBtn.value.forEach((item: any) => {
    item.style.display = "none";
  });
  if (
    chat.ip_address == clientInfo.ip_address ||
    (chat.user_id !== "" && chat.user_id === userStore.userInfo.user_id)
  ) {
    backBtn.value[index].style.left = e.offsetX + "px";
    backBtn.value[index].style.bottom = e.offsetY + "px";
    backBtn.value[index].style.display = "block";
  }
};

onUpdated(() => {
  const element = document.getElementById("chat-content");
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
});

onBeforeUnmount(() => {
  stompClient.value?.deactivate();
});
</script>

<style lang="scss" scoped>
.chat-container {
  box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
  font-size: 14px;
  background: var(--grey-1);
  animation: bounceInUp 1s;
  animation-fill-mode: both;
  z-index: 1200;
}

@media (min-width: 760px) {
  .chat-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 400px;
    height: calc(100% - 110px);
    max-height: 590px;
    min-height: 250px;
    border-radius: 1rem;
  }

  .close {
    display: none;
  }
}

@media (max-width: 760px) {
  .chat-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .close {
    display: block;
    margin-left: auto;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-radius: 1rem 1rem 0 0;
  background-color: var(--grey-0);
}

.unread {
  position: absolute;
  width: 18px;
  height: 18px;
  text-align: center;
  border-radius: 50%;
  line-height: 20px;
  font-size: 12px;
  background: var(--color-red);
  color: var(--grey-0);
}

.chat-content {
  position: absolute;
  top: 80px;
  bottom: 46px;
  width: 100%;
  padding: 20px 16px 0 16px;
  background-color: var(--chat-bg);
  overflow-y: auto;
  overflow-x: hidden;
}

.my-chat {
  flex-direction: row-reverse;
}

.chat-item {
  display: flex;
  margin-bottom: 0.5rem;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .left-info {
    margin-left: 0.5rem;
  }

  .right-info {
    margin-right: 0.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .user-content {
    position: relative;
    padding: 10px;
    border-radius: 5px 20px 20px 20px;
    background: var(--grey-0);
    width: fit-content;
    white-space: pre-line;
    word-wrap: break-word;
    word-break: break-all;
  }

  .my-content {
    float: right;
    border-radius: 20px 5px 20px 20px;
    background: var(--color-blue);
    color: var(--grey-0);
  }
}

.back-menu {
  position: absolute;
  width: 80px;
  height: 35px;
  line-height: 35px;
  font-size: 13px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  text-align: center;
  display: none;
}

.chat-btn {
  position: fixed;
  bottom: 24px;
  right: 5px;
  width: 60px;
  height: 60px;
  border-radius: 100px;
  cursor: pointer;
  z-index: 1000;
}

.chat-footer {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background: var(--grey-2);
  border-radius: 0 0 1rem 1rem;

  .chat-input {
    width: 100%;
    height: 30px;
    padding: 0.5rem 0 0 0.6rem;
    margin-right: 0.5rem;
    font-size: 13px;
    color: var(--text-color);
    background-color: var(--grey-1);
    outline: none;
    resize: none;
  }

  .send-btn {
    color: var(--color-blue);
    margin-left: 0.5rem;
  }
}
</style>
