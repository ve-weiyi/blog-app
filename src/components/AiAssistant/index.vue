<template>
  <div class="ai-room">
    <div v-show="show" class="ai-container">
      <div class="ai-header">
        <div class="ai-title">
          <div class="title-icon">
            <img :src="ai" alt="" width="18" height="18" />
          </div>
          <span class="title-text">博客助手</span>
          <span v-if="quotaLabel" class="quota-pill">{{ quotaLabel }}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" title="清空对话" aria-label="清空对话" @click="handleClear">
            <svg-icon icon-class="delete" size="1rem" />
          </button>
          <button class="icon-btn" title="关闭" aria-label="关闭" @click="show = false">
            <svg-icon icon-class="close" size="1rem" />
          </button>
        </div>
      </div>

      <div ref="contentRef" class="ai-content" @scroll="handleScroll">
        <div v-if="messages.length === 0" class="welcome">
          <div class="welcome-icon">
            <img :src="ai" alt="" width="44" height="44" />
          </div>
          <h3>你好，我是博客助手</h3>
          <p>我会根据站内文章回答你的问题；找不到的内容会直接告诉你。</p>

          <div class="quick-questions">
            <button
              v-for="question in quickQuestions"
              :key="question"
              type="button"
              class="quick-btn"
              @click="askQuick(question)"
            >
              {{ question }}
            </button>
          </div>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          class="ai-item"
          :class="{ 'is-user': message.role === 'user' }"
        >
          <div class="avatar-wrapper">
            <img
              v-if="message.role === 'user' && userAvatar && !avatarFailed"
              :src="userAvatar"
              alt="我"
              class="avatar"
              @error="avatarFailed = true"
            />
            <span v-else-if="message.role === 'user'" class="avatar avatar--fallback">我</span>
            <div v-else class="ai-avatar">
              <img :src="ai" alt="助手" width="20" height="20" />
            </div>
          </div>

          <div class="message-body">
            <div
              class="message-bubble"
              :class="{
                'user-bubble': message.role === 'user',
                pending: message.pending,
                failed: message.failed,
              }"
            >
              <div v-if="message.activity" class="activity">{{ message.activity }}</div>
              <div v-else-if="message.pending && !message.content" class="loading-dots">
                <span></span><span></span><span></span>
              </div>

              <div
                v-if="message.role === 'user' && message.content"
                class="message-text plain-text"
              >
                {{ message.content }}
              </div>
              <div
                v-else-if="message.content"
                class="message-text markdown-body"
                v-html="renderedContent(message)"
              ></div>
            </div>

            <div v-if="message.citations?.length" class="citations">
              <a
                v-for="citation in message.citations"
                :key="citation.article_id"
                class="citation"
                :href="citation.url"
                :title="citation.summary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg-icon icon-class="article" size="0.9rem" />
                <span>{{ citation.title }}</span>
              </a>
            </div>

            <button v-if="message.failed" type="button" class="retry-btn" @click="retry">
              重试
            </button>
          </div>
        </div>

        <button v-if="hasNewBelow" type="button" class="new-message-btn" @click="scrollToBottom(true)">
          ↓ 新消息
        </button>
      </div>

      <div class="ai-footer">
        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="inputContent"
            class="ai-input"
            placeholder="问问站内的文章…"
            aria-label="输入问题"
            maxlength="1000"
            rows="1"
            @input="resizeInput"
            @keydown="handleKeyCode"
          ></textarea>
          <button
            v-if="streaming"
            type="button"
            class="stop-btn"
            aria-label="停止生成"
            @click="stop"
          >
            <span class="stop-square"></span>
          </button>
          <button
            v-else
            type="button"
            class="send-btn"
            aria-label="发送问题"
            :disabled="!canSend"
            @click="handleSend"
          >
            <svg-icon icon-class="plane" size="1rem" />
          </button>
        </div>
        <p v-if="errorText" class="error-hint">{{ errorText }}</p>
        <p class="composer-hint">Enter 发送 · Shift + Enter 换行</p>
      </div>
    </div>

    <div
      class="ai-toggle"
      role="button"
      tabindex="0"
      aria-label="打开博客助手"
      @click="handleOpen"
      @keydown.enter="handleOpen"
      @keydown.space.prevent="handleOpen"
    >
      <div v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </div>
      <div class="toggle-icon">
        <img :src="ai" alt="博客助手" width="36" height="36" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useBlogStore, useUserStore } from "@/stores";
import ai from "@/assets/icons/ai.svg";
import { renderMarkdown } from "./markdown";
import { useAiChat } from "./useAiChat";

const userStore = useUserStore();
const blogStore = useBlogStore();

const show = ref(false);
const unreadCount = ref(0);
const inputContent = ref("");
const contentRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const stickToBottom = ref(true);
const hasNewBelow = ref(false);

const {
  messages,
  streaming,
  quotaLabel,
  errorText,
  send,
  stop,
  retry,
  clear,
  refreshQuota,
} = useAiChat();

const userAvatar = computed(
  () => userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar
);
const avatarFailed = ref(false);
watch(userAvatar, () => {
  avatarFailed.value = false;
});
const canSend = computed(() => !streaming.value && inputContent.value.trim().length > 0);

const quickQuestions = [
  "这个博客主要写什么？",
  "最近更新了哪些文章？",
  "介绍一下博主",
];

const MAX_INPUT_HEIGHT = 96;

// 已渲染的 Markdown 按消息缓存：流式更新时只重算当前消息，历史消息不重复渲染
const markdownCache = new Map<number, { content: string; html: string }>();

function renderedContent(message: { id: number; content: string }): string {
  const cached = markdownCache.get(message.id);
  if (cached && cached.content === message.content) {
    return cached.html;
  }
  const html = renderMarkdown(message.content);
  markdownCache.set(message.id, { content: message.content, html });
  return html;
}

function handleOpen() {
  show.value = !show.value;
  unreadCount.value = 0;
  if (show.value) {
    void refreshQuota();
    stickToBottom.value = true;
    void scrollToBottom(true);
    void nextTick(() => inputRef.value?.focus());
  }
}

function handleClear() {
  clear();
  markdownCache.clear();
}

function askQuick(question: string) {
  inputContent.value = question;
  void handleSend();
}

function handleSend() {
  if (!canSend.value) {
    return;
  }
  send(inputContent.value);
  inputContent.value = "";
  void nextTick(() => {
    resizeInput();
    void scrollToBottom(true);
  });
}

function handleKeyCode(event: KeyboardEvent) {
  // Ctrl/Shift+Enter 与输入法组词的 Enter 都留给换行
  if (event.key !== "Enter" || event.ctrlKey || event.shiftKey || event.isComposing) {
    return;
  }
  event.preventDefault();
  handleSend();
}

function resizeInput() {
  const element = inputRef.value;
  if (!element) {
    return;
  }
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT)}px`;
}

function isNearBottom() {
  const element = contentRef.value;
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
  const element = contentRef.value;
  if (!element) {
    return;
  }
  element.scrollTop = element.scrollHeight;
  if (force) {
    stickToBottom.value = true;
    hasNewBelow.value = false;
  }
}

// 内容增长时跟随到底部；用户上翻时提示有新内容
watch(
  () => messages.value.reduce((total, message) => total + message.content.length, 0),
  async () => {
    if (!show.value) {
      return;
    }
    if (stickToBottom.value) {
      await scrollToBottom();
    } else {
      hasNewBelow.value = true;
    }
  }
);

// 流结束时若面板收起，计一次未读
watch(streaming, (value, previous) => {
  if (previous && !value && !show.value) {
    unreadCount.value++;
  }
});

onBeforeUnmount(() => {
  stop();
});
</script>

<style lang="scss" scoped>
.ai-room {
  position: relative;
}

.ai-container {
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
  .ai-container {
    position: fixed;
    right: 20px;
    bottom: 164px;
    width: 400px;
    height: min(600px, calc(100vh - 190px));
  }
}

@media (max-width: 760px) {
  .ai-container {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 100vh;
    height: 100dvh;
    border: none;
    border-radius: 0;
  }
}

.ai-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 12px 16px;
  color: #fff;
  background: linear-gradient(120deg, var(--color-pink) 0%, var(--primary-color) 100%);
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;

  .title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.18);
    border-radius: 9px;
  }
}

.quota-pill {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.7);
    outline-offset: 2px;
  }
}

.ai-content {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  background: var(--chat-bg, var(--grey-1));

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--grey-4);
    border-radius: 2px;
  }
}

.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  color: var(--grey-5);
  text-align: center;

  .welcome-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    background: var(--grey-0);
    border-radius: 50%;
    box-shadow: 0 6px 18px var(--grey-9-a1);
  }

  h3 {
    margin: 14px 0 6px;
    font-size: 15px;
    color: var(--text-color);
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
  }
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
}

.quick-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--grey-6);
  cursor: pointer;
  background: var(--chat-bubble, var(--grey-0));
  border: 1px solid var(--grey-2);
  border-radius: 999px;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    color: var(--primary-color);
    border-color: var(--color-pink);
  }
}

.ai-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 14px;

  &.is-user {
    flex-direction: row-reverse;

    .message-body {
      align-items: flex-end;
    }

    .message-bubble {
      color: #fff;
      background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
      border-radius: 16px 16px 6px 16px;
      box-shadow: 0 2px 8px var(--color-pink-a3);
    }
  }
}

.avatar-wrapper {
  flex: 0 0 auto;

  .avatar {
    width: 36px;
    height: 36px;
    object-fit: cover;
    background: var(--grey-2);
    border: 2px solid var(--grey-0);
    border-radius: 50%;
  }

  .avatar--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
  }

  .ai-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
    border: 2px solid var(--grey-0);
    border-radius: 50%;
    box-shadow: 0 1px 3px var(--grey-9-a1);
  }
}

.message-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: calc(100% - 56px);
}

.message-bubble {
  position: relative;
  max-width: 100%;
  padding: 9px 13px;
  color: var(--text-color);
  background: var(--chat-bubble, var(--grey-0));
  border-radius: 16px 16px 16px 6px;
  box-shadow: 0 1px 2px var(--grey-9-a1);
  word-wrap: break-word;
  word-break: break-word;

  &.pending {
    opacity: 0.85;
  }

  &.failed {
    box-shadow: 0 0 0 1px var(--color-red-a3);
  }
}

.message-text {
  font-size: 13px;
  line-height: 1.6;
}

// 纯文本消息保留换行；Markdown 内容不能 pre-wrap，否则块之间会多出空行
.plain-text {
  white-space: pre-wrap;
}

.activity {
  font-size: 12px;
  color: var(--grey-5);
}

.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 18px;

  span {
    width: 6px;
    height: 6px;
    background: var(--grey-4);
    border-radius: 50%;
    animation: dot 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes dot {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.citations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.citation {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 4px 10px;
  overflow: hidden;
  font-size: 12px;
  color: var(--primary-color);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--chat-bubble, var(--grey-0));
  border: 1px solid var(--grey-2);
  border-radius: 999px;

  &:hover {
    border-color: var(--color-pink);
  }
}

.retry-btn {
  margin-top: 6px;
  padding: 0;
  font-size: 12px;
  color: var(--color-red);
  cursor: pointer;
  background: transparent;
  border: none;
}

.ai-footer {
  flex: 0 0 auto;
  padding: 12px 14px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--grey-0);
  border-top: 1px solid var(--grey-2);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  background: var(--chat-bubble, var(--grey-1));
  border: 1px solid var(--grey-2);
  border-radius: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus-within {
    border-color: var(--color-pink);
    box-shadow: 0 0 0 4px var(--color-pink-a3);
  }
}

.ai-input {
  flex: 1;
  min-height: 22px;
  max-height: 96px;
  padding: 0;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
  resize: none;
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: var(--grey-4);
  }
}

.send-btn,
.stop-btn {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  border: none;
  border-radius: 11px;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.send-btn {
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
  box-shadow: 0 4px 10px var(--color-pink-a3);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px var(--color-pink-a3);
  }

  &:disabled {
    color: var(--grey-4);
    cursor: not-allowed;
    background: var(--grey-2);
    box-shadow: none;
  }
}

.stop-btn {
  background: var(--grey-6);

  &:hover {
    background: var(--grey-7);
  }

  .stop-square {
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 2px;
  }
}

.error-hint {
  margin: 6px 2px 0;
  font-size: 12px;
  color: var(--color-red);
}

.composer-hint {
  display: none;
  margin: 6px 2px 0;
  font-size: 11px;
  color: var(--grey-5);
  text-align: right;
}

@media (min-width: 761px) {
  .composer-hint {
    display: block;
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
}

.ai-toggle {
  position: fixed;
  right: 24px;
  bottom: 92px;
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

.markdown-body {
  :deep(p) {
    margin: 0 0 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 4px 0;
    padding-left: 20px;
  }

  :deep(ul) li {
    list-style: disc;
  }

  :deep(ol) li {
    list-style: decimal;
  }

  :deep(a) {
    color: var(--primary-color);
    text-decoration: underline;
  }

  :deep(code) {
    padding: 1px 4px;
    font-size: 12px;
    background: var(--grey-2);
    border-radius: 4px;
  }

  :deep(pre) {
    padding: 10px;
    overflow-x: auto;
    background: var(--grey-2);
    border-radius: 8px;

    code {
      padding: 0;
      background: transparent;
    }
  }

  :deep(blockquote) {
    margin: 6px 0;
    padding-left: 10px;
    color: var(--grey-6);
    border-left: 3px solid var(--grey-3);
  }
}

@media (max-width: 760px) {
  .ai-toggle {
    right: 16px;
    bottom: 76px;
    width: 48px;
    height: 48px;
  }

  .ai-content {
    padding: 12px;
  }

  .message-body {
    max-width: 82%;
  }
}
</style>
