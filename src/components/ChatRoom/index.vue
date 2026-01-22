<template>
  <div class="chat-room">
    <div v-show="show" class="chat-container">
      <div class="chat-header">
        <div class="header-content">
          <div class="chat-title">
            <div class="title-icon">
              <img :src="chatroom" alt="聊天室" width="20" height="20" />
            </div>
            <span class="title-text">聊天室</span>
          </div>
          <div class="online-info">
            <div class="online-indicator"></div>
            <span class="online-count">{{ onlineCount }} 人在线</span>
          </div>
        </div>
        <svg-icon icon-class="close" size="1.2rem" class="close-btn" @click="show = false" />
      </div>

      <div id="chat-content" class="chat-content">
        <div
          v-for="(chat, index) in recordList"
          :key="chat.id"
          class="chat-item"
          :class="{ 'my-chat': isMy(chat) }"
        >
          <div class="message-wrapper">
            <div class="avatar-wrapper">
              <img :src="chat.avatar || defaultAvatar" :alt="chat.nickname" class="user-avatar" />
              <div v-if="!isMy(chat)" class="user-status"></div>
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="username" :class="{ 'my-username': isMy(chat) }">
                  {{ chat.nickname || chat.ip_source }}
                </span>
                <span class="ip-address">
                  {{ chat.ip_address }}
                </span>
                <span class="timestamp">
                  {{ formatDateTime(chat.created_at) }}
                </span>
              </div>

              <div
                class="message-bubble"
                :class="{
                  'my-message': isMy(chat),
                  recalled: chat.status === 2,
                }"
                @contextmenu.prevent.stop="showBack(chat, index, $event)"
              >
                <div v-html="chat.content" class="message-text"></div>
                <div ref="backBtn" class="recall-menu" @click="back(chat, index)">
                  <svg-icon icon-class="delete" size="0.8rem" />
                  撤回
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="input-wrapper">
          <textarea
            v-model="chatContent"
            class="chat-input"
            placeholder="输入消息..."
            @keydown="handleKeyCode($event)"
            rows="1"
          ></textarea>
          <div class="input-actions">
            <Emoji @add-emoji="handleEmoji" @choose-type="handleType" class="emoji-btn" />
            <button class="send-btn" :disabled="!chatContent.trim()" @click="handleSend">
              <svg-icon icon-class="plane" size="1rem" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-toggle" @click="handleOpen">
      <div v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </div>
      <div class="toggle-icon">
        <img :src="chatroom" alt="聊天室" width="36" height="36" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore, useUserStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import { emojiList } from "@/utils/emoji";
import { tvList } from "@/utils/tv";
import chatroom from "@/assets/icons/chatroom.svg";
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import { AuthStorage } from "@/utils/auth.ts";

// 常量定义
const WS_CONFIG = {
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 10000,
  HEARTBEAT_OUTGOING: 10000,
  CHAT_TOPIC: "/topic/chatroom",
} as const;

const MESSAGE_TYPES = {
  ONLINE: "online",
  GREETING: "greeting",
  HISTORY: "history",
  MESSAGE: "message",
  EDIT: "edit",
  SEND: "send",
  TEXT: "text",
} as const;

const MESSAGE_STATUS = {
  NORMAL: 1,
  DELETED: 2,
} as const;

const EMOJI_CONFIG = {
  SIZE: 21,
  STYLE: "margin: 0 1px;vertical-align: text-bottom",
} as const;

const MESSAGES = {
  RECALLED: "[消息已撤回]",
  EMPTY_CONTENT: "内容不能为空",
  CONNECTION_CLOSED: "连接关闭",
  STOMP_ERROR: "STOMP 错误",
} as const;

// 类型定义
interface MessageEvent {
  type: string;
  data: string;
  timestamp: number;
}

interface ChatMessageEvent {
  id: number; // 主键
  user_id: string; // 用户id
  terminal_id: string; // 设备id
  nickname: string; // 昵称
  avatar: string; // 头像
  ip_address: string; // ip地址
  ip_source: string; // ip来源
  type: string; // 消息类型 1: 文本消息 2: 图片消息 3: 文件消息 4: 语音消息 5: 视频消息
  content: string; // 消息内容
  status: number; // 消息状态 0-正常 1-已编辑 2-已撤回 3-已删除
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

interface SendMessageEvent {
  type: string;
  content: string;
}

interface EditMessageEvent {
  id: number;
  type: string;
  content: string;
  status: number;
  updated_at: number;
}

interface OnlineMessageEvent {
  online: boolean;
  count: number;
  tips: string;
}

interface GreetingMessageEvent {
  content: string;
  ip_address: string;
  ip_source: string;
}

interface HistoryMessageEvent {
  list: ChatMessageEvent[];
  page: number;
  size: number;
  total: number;
}

interface ClientInfo {
  ip_address: string;
  ip_source: string;
}

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

const { show, recordList, chatContent, emojiType, unreadCount, onlineCount } = toRefs(data);

const stompClient = ref<Client | null>(null);
const subscription = ref<any>(null);
const backBtn = ref<HTMLElement[]>([]);

const defaultAvatar = ref(blogStore.blogInfo.website_config.tourist_avatar);

const clientInfo = reactive<ClientInfo>({
  ip_address: "",
  ip_source: "",
});

const isMy = computed(
  () => (chat: ChatMessageEvent) =>
    chat.ip_address === clientInfo.ip_address ||
    (chat.user_id !== "" && chat.user_id === userStore.userInfo.user_id)
);

// 打开聊天面板
const handleOpen = () => {
  try {
    if (!stompClient.value || !stompClient.value.connected) {
      initStomp();
    }
    unreadCount.value = 0;
    show.value = !show.value;
  } catch (error) {
    console.error("打开聊天面板失败:", error);
  }
};

// 初始化 STOMP 客户端
const initStomp = () => {
  try {
    const url =
      import.meta.env.VITE_APP_WS_ENDPOINT || blogStore.blogInfo.website_config.websocket_url;

    stompClient.value = new Client({
      connectHeaders: {
        login: AuthStorage.getUid() || "",
        passcode: AuthStorage.getToken() || "",
        client: AuthStorage.getTerminalId(),
      },
      brokerURL: url,
      reconnectDelay: WS_CONFIG.RECONNECT_DELAY,
      heartbeatIncoming: WS_CONFIG.HEARTBEAT_INCOMING,
      heartbeatOutgoing: WS_CONFIG.HEARTBEAT_OUTGOING,
      onConnect: handleConnect,
      onWebSocketClose: handleWebSocketClose,
      onStompError: handleStompError,
    });

    stompClient.value.activate();
  } catch (error) {
    console.error("初始化WebSocket失败:", error);
  }
};

// WebSocket 连接成功处理
const handleConnect = () => {
  try {
    subscription.value = stompClient.value?.subscribe(
      WS_CONFIG.CHAT_TOPIC,
      (message) => {
        handleMessage(message);
      },
      {}
    );
  } catch (error) {
    console.error("订阅消息失败:", error);
  }
};

// WebSocket 连接关闭处理
const handleWebSocketClose = () => {
  console.warn(MESSAGES.CONNECTION_CLOSED);
};

// STOMP 错误处理
const handleStompError = (frame: IFrame) => {
  console.error(MESSAGES.STOMP_ERROR, frame);
};

// 接收消息
const handleMessage = (message: IMessage) => {
  try {
    if (!message.body) return;

    const res: MessageEvent = JSON.parse(message.body);
    const data = JSON.parse(res.data);

    switch (res.type) {
      case MESSAGE_TYPES.ONLINE:
        handleOnlineMessage(data as OnlineMessageEvent);
        break;
      case MESSAGE_TYPES.GREETING:
        handleGreetingMessage(data as GreetingMessageEvent);
        break;
      case MESSAGE_TYPES.HISTORY:
        handleHistoryMessage(data as HistoryMessageEvent);
        break;
      case MESSAGE_TYPES.MESSAGE:
        handleNewMessage(data as ChatMessageEvent);
        break;
      case MESSAGE_TYPES.EDIT:
        handleEditMessage(data as EditMessageEvent);
        break;
    }
  } catch (error) {
    console.error("处理消息失败:", error);
  }
};

// 处理在线消息
const handleOnlineMessage = (data: OnlineMessageEvent) => {
  onlineCount.value = data.count;
};

// 处理问候消息
const handleGreetingMessage = (data: GreetingMessageEvent) => {
  clientInfo.ip_address = data.ip_address;
  clientInfo.ip_source = data.ip_source;
};

// 处理历史消息
const handleHistoryMessage = (data: HistoryMessageEvent) => {
  recordList.value = data.list.reverse();
};

// 处理新消息
const handleNewMessage = (data: ChatMessageEvent) => {
  recordList.value.push(data);
  if (!show.value) {
    unreadCount.value++;
  }
};

// 处理编辑消息
const handleEditMessage = (data: EditMessageEvent) => {
  const editIndex = recordList.value.findIndex((item) => item.id === data.id);
  if (editIndex !== -1) {
    recordList.value[editIndex].content = data.content;
    recordList.value[editIndex].status = data.status;
    recordList.value[editIndex].updated_at = data.updated_at;
  }
};

// 发送消息
const handleSend = () => {
  try {
    if (chatContent.value.trim() === "") {
      window.$message?.error(MESSAGES.EMPTY_CONTENT);
      return;
    }

    const processedContent = processEmojiContent(chatContent.value);

    const sendEvent: SendMessageEvent = {
      type: MESSAGE_TYPES.TEXT,
      content: processedContent,
    };

    const msg: MessageEvent = {
      type: MESSAGE_TYPES.SEND,
      data: JSON.stringify(sendEvent),
      timestamp: Date.now(),
    };

    publishMessage(msg);
    chatContent.value = "";
  } catch (error) {
    console.error("发送消息失败:", error);
    window.$message?.error("发送失败，请重试");
  }
};

// 处理表情内容
const processEmojiContent = (content: string): string => {
  return content.replace(/\[.+?\]/g, (str) => {
    if (emojiType.value === 0 && emojiList[str]) {
      return createEmojiImg(emojiList[str]);
    }
    if (emojiType.value === 1 && tvList[str]) {
      return createEmojiImg(tvList[str]);
    }
    return str;
  });
};

// 创建表情图片标签
const createEmojiImg = (src: string): string => {
  return `<img src="${src}" width="${EMOJI_CONFIG.SIZE}" height="${EMOJI_CONFIG.SIZE}" style="${EMOJI_CONFIG.STYLE}"/>`;
};

// 发布消息
const publishMessage = (msg: MessageEvent) => {
  stompClient.value?.publish({
    destination: WS_CONFIG.CHAT_TOPIC,
    body: JSON.stringify(msg),
  });
};

// 撤回消息 - 使用编辑功能来标记为已删除
const back = (item: ChatMessageEvent, index: number) => {
  try {
    const editEvent: EditMessageEvent = {
      id: item.id,
      type: item.type,
      content: MESSAGES.RECALLED,
      status: MESSAGE_STATUS.DELETED,
      updated_at: Date.now(),
    };

    const msg: MessageEvent = {
      type: MESSAGE_TYPES.EDIT,
      data: JSON.stringify(editEvent),
      timestamp: Date.now(),
    };

    publishMessage(msg);
  } catch (error) {
    console.error("撤回消息失败:", error);
  }
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
const showBack = (chat: ChatMessageEvent, index: number, e: MouseEvent) => {
  try {
    // 隐藏所有撤回按钮
    backBtn.value.forEach((item: HTMLElement) => {
      if (item) {
        item.style.display = "none";
      }
    });

    // 检查是否为当前用户的消息
    if (isMy.value(chat) && backBtn.value[index]) {
      const btnElement = backBtn.value[index];
      btnElement.style.left = e.offsetX + "px";
      btnElement.style.bottom = e.offsetY + "px";
      btnElement.style.display = "block";
    }
  } catch (error) {
    console.error("显示撤回按钮失败:", error);
  }
};

onUpdated(() => {
  const element = document.getElementById("chat-content");
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
});

// 清理资源
const cleanup = () => {
  try {
    if (subscription.value) {
      subscription.value.unsubscribe();
      subscription.value = null;
    }
    if (stompClient.value) {
      stompClient.value.deactivate();
      stompClient.value = null;
    }
  } catch (error) {
    console.error("清理资源失败:", error);
  }
};

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style lang="scss" scoped>
.chat-room {
  position: relative;
}

.chat-container {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
  z-index: 1200;

  @media (prefers-color-scheme: dark) {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 760px) {
  .chat-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 120px);
  }
}

@media (max-width: 760px) {
  .chat-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    border-radius: 0;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .chat-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;

    .title-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
    }
  }

  .online-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.9;

    .online-indicator {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 2px;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chat-content {
  height: calc(100% - 140px);
  padding: 16px;
  overflow-y: auto;
  background: var(--chat-bg, #f8fafc);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}

.chat-item {
  margin-bottom: 16px;

  &.my-chat {
    .message-wrapper {
      flex-direction: row-reverse;
    }

    .message-content {
      align-items: flex-end;
    }

    .message-header {
      flex-direction: row-reverse;
    }

    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
  }
}

.message-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .user-status {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #4ade80;
    border: 2px solid white;
    border-radius: 50%;
  }
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: calc(100% - 60px);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  .username {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-color, #374151);

    &.my-username {
      color: #667eea;
    }
  }

  .timestamp {
    font-size: 11px;
    color: var(--text-color-secondary, #9ca3af);
  }

  .ip-address {
    font-size: 10px;
    color: var(--text-color-secondary, #9ca3af);
    opacity: 0.8;
  }
}

.message-bubble {
  position: relative;
  padding: 10px 14px;
  background: white;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;

  &.recalled {
    background: #f3f4f6;
    color: #9ca3af;
    font-style: italic;
  }

  .message-text {
    line-height: 1.4;
    white-space: pre-wrap;
    font-size: 13px;
  }
}

.recall-menu {
  position: absolute;
  top: -40px;
  right: 0;
  display: none;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
}

.chat-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .chat-input {
    flex: 1;
    min-height: 20px;
    max-height: 80px;
    padding: 0;
    border: none;
    background: transparent;
    resize: none;
    outline: none;
    font-size: 14px;
    line-height: 1.4;
    color: var(--text-color, #374151);

    &::placeholder {
      color: #9ca3af;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .emoji-btn {
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    animation: bounce 0.5s ease-out;
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@media (max-width: 760px) {
  .chat-toggle {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }

  .chat-footer {
    padding: 12px;
  }

  .chat-content {
    padding: 12px;
  }
}
</style>
