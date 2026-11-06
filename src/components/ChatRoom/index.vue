<template>
  <div class="chat-room">
    <div v-show="show" class="chat-container">
      <ChatHeader
        :connection-label="connectionLabel"
        :state="connectionState"
        @close="show = false"
      />

      <div
        id="chat-content"
        ref="chatContentRef"
        class="chat-content"
        role="log"
        aria-live="polite"
        @scroll="handleScroll"
      >
        <div v-if="recordList.length === 0" class="chat-placeholder">
          <template v-if="connectionState === 'connected'">
            <svg-icon class="placeholder-icon" icon-class="message" size="2.4rem" />
            <p class="placeholder-title">还没有人发言</p>
            <p class="placeholder-text">来说第一句吧</p>
          </template>
          <template v-else>
            <div
              v-for="(width, row) in skeletonWidths"
              :key="row"
              class="skeleton-row"
              :class="{ 'is-mine': row === 1 }"
            >
              <span class="skeleton-avatar"></span>
              <span class="skeleton-bubble" :style="{ width }"></span>
            </div>
          </template>
        </div>

        <button
          v-if="historyHasMore"
          type="button"
          class="load-older-btn"
          :disabled="historyLoading"
          @click="loadOlder"
        >
          {{ historyLoading ? "加载中…" : "加载更早" }}
        </button>

        <template v-for="(chat, index) in recordList" :key="chat.local_id ?? chat.id">
          <div v-if="showDate(recordList, index)" class="chat-date">
            <span>{{ dateLabel(chat.created_at) }}</span>
          </div>
          <MessageItem
            :chat="chat"
            :mine="isMine(chat)"
            :show-header="showHeader(recordList, index)"
            :avatar-fallback="defaultAvatar"
            :recallable="canRecall(chat)"
            @retry="retry"
            @recall="recall"
          />
        </template>

        <button
          v-if="hasNewBelow"
          type="button"
          class="new-message-btn"
          @click="scrollToBottom(true)"
        >
          ↓ 新消息
        </button>
      </div>

      <MessageComposer v-model="draft" :connected="connectionState === 'connected'" @send="send" />
    </div>

    <div
      class="chat-toggle"
      role="button"
      tabindex="0"
      aria-label="打开聊天室"
      @click="handleOpen"
      @keydown.enter="handleOpen"
      @keydown.space.prevent="handleOpen"
    >
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
import { nextTick, ref, watch } from "vue";
import { useBlogStore } from "@/stores";
import chatroom from "@/assets/icons/chatroom.svg";
import ChatHeader from "./ChatHeader.vue";
import MessageComposer from "./MessageComposer.vue";
import MessageItem from "./MessageItem.vue";
import { dateLabel, showDate, showHeader } from "./message";
import { useChatRoom } from "./useChatRoom";

const blogStore = useBlogStore();
const show = ref(false);
const defaultAvatar = ref(blogStore.blogInfo.website_config.tourist_avatar);

const chatContentRef = ref<HTMLElement | null>(null);
const stickToBottom = ref(true);
const hasNewBelow = ref(false);

/** 首连时的骨架屏宽度，纯为观感不要看起来像加载失败 */
const skeletonWidths = ["68%", "52%", "60%"];

/** 记录合并前的滚动位置，返回合并后的恢复函数：新内容插在上方，视图不应跳动。 */
function rememberScroll() {
  const element = chatContentRef.value;
  if (!element) {
    return undefined;
  }
  const previousHeight = element.scrollHeight;
  const previousTop = element.scrollTop;
  return () => {
    element.scrollTop = previousTop + (element.scrollHeight - previousHeight);
  };
}

const {
  connectionState,
  connectionLabel,
  recordList,
  draft,
  unreadCount,
  historyHasMore,
  historyLoading,
  isMine,
  canRecall,
  ensureConnected,
  send,
  retry,
  recall,
  loadOlder,
} = useChatRoom({ show, preserveScroll: rememberScroll });

function isNearBottom() {
  const element = chatContentRef.value;
  if (!element) {
    return true;
  }
  return element.scrollHeight - element.scrollTop - element.clientHeight < 80;
}

function handleScroll() {
  stickToBottom.value = isNearBottom();
  if (stickToBottom.value) {
    hasNewBelow.value = false;
  }
}

async function scrollToBottom(force = false) {
  await nextTick();
  const element = chatContentRef.value;
  if (!element) {
    return;
  }
  element.scrollTop = element.scrollHeight;
  if (force) {
    stickToBottom.value = true;
    hasNewBelow.value = false;
  }
}

// 只有用户本来就在底部时才跟随新消息；否则提示有新消息，不打断阅读
watch(
  () => recordList.value.length,
  async () => {
    await nextTick();
    if (!show.value) {
      return;
    }
    // 加载更早是往列表头部插入，不是新消息，不能亮「新消息」提示
    if (historyLoading.value) {
      return;
    }
    if (stickToBottom.value) {
      await scrollToBottom();
    } else {
      hasNewBelow.value = true;
    }
  }
);

function handleOpen() {
  show.value = !show.value;
  unreadCount.value = 0;
  ensureConnected();
  if (show.value) {
    stickToBottom.value = true;
    void scrollToBottom(true);
  }
}
</script>

<style lang="scss" scoped>
.chat-room {
  position: relative;
}

.chat-container {
  z-index: 1200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--grey-0) 96%, transparent);
  border: 1px solid var(--grey-2);
  border-radius: 16px;
  box-shadow:
    0 24px 48px var(--grey-9-a1),
    0 0 0 1px var(--grey-2);
  backdrop-filter: blur(20px);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 760px) {
  .chat-container {
    position: fixed;
    right: 20px;
    bottom: 96px;
    width: 400px;
    height: 620px;
    max-height: calc(100vh - 120px);
  }
}

@media (max-width: 760px) {
  .chat-container {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 100vh;
    // dvh 随软键盘收缩，键盘弹起时输入框不会被遮挡
    height: 100dvh;
    border: none;
    border-radius: 0;
  }
}

.chat-content {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  background: var(--chat-bg, var(--grey-1));

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--grey-4);
    border-radius: 2px;
  }
}

.chat-placeholder {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--grey-5);

  .placeholder-icon {
    color: var(--color-pink);
    opacity: 0.55;
  }

  .placeholder-title {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--grey-6);
  }

  .placeholder-text {
    margin: 0;
    font-size: 12px;
  }
}

.skeleton-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 16px;

  &.is-mine {
    flex-direction: row-reverse;
  }

  .skeleton-avatar {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    background: var(--grey-2);
    border-radius: 50%;
  }

  .skeleton-bubble {
    height: 34px;
    background: linear-gradient(90deg, var(--grey-2) 25%, var(--grey-3) 37%, var(--grey-2) 63%);
    background-size: 400% 100%;
    border-radius: 14px;
    animation: shimmer 1.4s ease infinite;
  }
}

@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

.chat-date {
  display: flex;
  justify-content: center;
  margin: 18px 0 12px;

  span {
    padding: 2px 10px;
    font-size: 11px;
    color: var(--grey-5);
    background: var(--chat-bubble, var(--grey-0));
    border-radius: 999px;
    box-shadow: 0 1px 2px var(--grey-9-a1);
  }
}

.load-older-btn {
  display: block;
  margin: 2px auto 10px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--grey-6);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 999px;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;

  &:hover:not(:disabled) {
    background: var(--chat-bubble, var(--grey-0));
    box-shadow: 0 1px 2px var(--grey-9-a1);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
}

.new-message-btn {
  position: sticky;
  bottom: 8px;
  display: block;
  margin: 10px auto 0;
  padding: 6px 14px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
  border: none;
  border-radius: 999px;
  box-shadow: 0 6px 16px var(--color-pink-a3);
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-toggle {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
  border-radius: 50%;
  box-shadow: 0 10px 24px var(--color-pink-a3);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 14px 28px var(--color-pink-a3);
    transform: translateY(-2px) scale(1.03);
  }

  &:focus-visible {
    outline: 2px solid var(--color-pink);
    outline-offset: 3px;
  }

  .unread-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    background: var(--color-red);
    border: 2px solid var(--grey-0);
    border-radius: 9px;
    animation: bounce 0.5s ease-out;
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    img {
      display: block;
    }
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
    right: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }

  .chat-content {
    padding: 12px;
  }
}
</style>
