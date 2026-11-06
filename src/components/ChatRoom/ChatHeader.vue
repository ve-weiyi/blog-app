<template>
  <div class="chat-header">
    <div class="chat-title">
      <div class="title-icon">
        <img :src="chatroom" alt="" width="18" height="18" />
      </div>
      <span class="title-text">聊天室</span>
    </div>

    <div class="header-actions">
      <span class="status-pill" :class="statusClass">
        <span class="status-dot"></span>
        {{ connectionLabel }}
      </span>
      <button type="button" class="close-btn" aria-label="关闭聊天室" @click="emit('close')">
        <svg-icon icon-class="close" size="0.95rem" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import chatroom from "@/assets/icons/chatroom.svg";

const props = defineProps<{
  /** 在线人数或连接状态文案。 */
  connectionLabel: string;
  /** 用于区分在线（绿点）与连接中 / 断开（黄点 / 红点）。 */
  state: "idle" | "connecting" | "connected" | "disconnected";
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const statusClass = computed(() => `is-${props.state}`);
</script>

<style lang="scss" scoped>
.chat-header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 12px 16px;
  background: linear-gradient(120deg, var(--color-pink) 0%, var(--primary-color) 100%);
  color: #fff;
}

.chat-title {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 999px;

  .status-dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.25);
  }

  &.is-connecting .status-dot {
    background: #fbbf24;
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.25);
    animation: pulse 1.4s infinite;
  }

  &.is-disconnected .status-dot,
  &.is-idle .status-dot {
    background: #fca5a5;
    box-shadow: 0 0 0 2px rgba(252, 165, 165, 0.25);
  }
}

.close-btn {
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@media (max-width: 760px) {
  .chat-header {
    padding-top: calc(10px + env(safe-area-inset-top));
    padding-bottom: 10px;
  }

  .chat-title {
    font-size: 14px;
  }
}
</style>
