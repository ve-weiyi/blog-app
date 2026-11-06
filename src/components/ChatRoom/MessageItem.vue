<template>
  <div class="chat-item" :class="{ 'my-chat': mine, compact: !showHeader }">
    <div class="message-wrapper">
      <div class="avatar-wrapper">
        <img
          v-if="avatarSrc && !avatarFailed"
          :src="avatarSrc"
          :alt="displayName"
          class="user-avatar"
          @error="avatarFailed = true"
        />
        <span v-else class="user-avatar user-avatar--fallback" :style="fallbackStyle">
          {{ initial }}
        </span>
        <span v-if="!mine" class="user-status"></span>
      </div>

      <div class="message-content">
        <!-- 连续消息的昵称与时间保留给读屏，只是视觉上隐藏 -->
        <div class="message-header" :class="{ 'sr-only': !showHeader }">
          <span class="username" :class="{ 'my-username': mine }">{{ displayName }}</span>
          <span class="timestamp">{{ formatDateTime(chat.created_at) }}</span>
        </div>

        <div
          class="message-bubble"
          :class="{
            'my-message': mine,
            recalled: recalled,
            pending: chat.pending,
            failed: chat.failed,
          }"
          @contextmenu.prevent.stop="openMenu"
        >
          <div v-if="recalled" class="message-text message-text--recalled">
            {{ statusText }}
          </div>
          <div v-else class="message-text">
            <template v-for="(part, partIndex) in parts" :key="partIndex">
              <img
                v-if="part.type === 'emoji'"
                :src="part.src"
                :alt="part.alt"
                class="message-emoji"
              />
              <template v-else>{{ part.text }}</template>
            </template>
          </div>

          <span
            v-if="chat.pending"
            class="message-flag message-flag--pending"
            title="发送中"
          ></span>
          <button
            v-else-if="chat.failed"
            type="button"
            class="message-flag message-flag--failed"
            title="发送失败，点击重试"
            aria-label="发送失败，点击重试"
            @click.stop="emit('retry', chat)"
          >
            !
          </button>

          <div
            v-if="menuVisible"
            ref="menuRef"
            class="recall-menu"
            role="button"
            tabindex="0"
            :style="menuStyle"
            @click.stop="chooseRecall"
            @keydown.enter="chooseRecall"
          >
            <svg-icon icon-class="delete" size="0.8rem" />
            撤回
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { formatDateTime } from "@/utils/date";
import { parseChatContent } from "./content";
import { isRecalled, recalledText } from "./message";
import type { UiChatMessage } from "./types";

const props = defineProps<{
  chat: UiChatMessage;
  mine: boolean;
  /** 与上一条同一发送者的连续消息时为 false，省略头像与昵称。 */
  showHeader: boolean;
  avatarFallback: string;
  recallable: boolean;
}>();

const emit = defineEmits<{
  (e: "retry", chat: UiChatMessage): void;
  (e: "recall", chat: UiChatMessage): void;
}>();

const displayName = computed(() => props.chat.nickname || props.chat.ip_source || "访客");
const initial = computed(() => [...displayName.value][0] ?? "访");
const avatarSrc = computed(() => props.chat.avatar || props.avatarFallback);
const avatarFailed = ref(false);

watch(avatarSrc, () => {
  avatarFailed.value = false;
});

// 没有头像时用名字派生的色相，保证同一个人每次颜色一致
const fallbackStyle = computed(() => {
  let hue = 0;
  for (const char of displayName.value) {
    hue = (hue * 31 + (char.codePointAt(0) ?? 0)) % 360;
  }
  return {
    background: `linear-gradient(135deg, hsl(${hue} 72% 70%), hsl(${(hue + 28) % 360} 66% 58%))`,
  };
});

const parts = computed(() => parseChatContent(props.chat.content));
const recalled = computed(() => isRecalled(props.chat));
const statusText = computed(() => recalledText(props.chat));

const menuRef = ref<HTMLElement | null>(null);
const menuVisible = ref(false);
const menuStyle = ref<Record<string, string>>({});

function closeMenu() {
  menuVisible.value = false;
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!menuRef.value?.contains(event.target as Node)) {
    closeMenu();
  }
}

function openMenu(event: MouseEvent) {
  closeMenu();
  if (!props.recallable) {
    return;
  }
  menuStyle.value = {
    left: `${event.offsetX}px`,
    bottom: `${event.offsetY}px`,
    top: "auto",
    right: "auto",
  };
  menuVisible.value = true;
  document.addEventListener("pointerdown", handleDocumentPointerDown);
}

function chooseRecall() {
  closeMenu();
  emit("recall", props.chat);
}

onBeforeUnmount(closeMenu);
</script>

<style lang="scss" scoped>
.chat-item {
  margin-bottom: 14px;

  // 同一发送者的连续消息：头像留位不显示，气泡与上一行对齐
  &.compact {
    margin-bottom: 5px;

    .avatar-wrapper {
      visibility: hidden;
    }
  }

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
      color: #fff;
      background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
      border-radius: 16px 16px 6px 16px;
      box-shadow: 0 2px 8px var(--color-pink-a3);
    }
  }
}

.message-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;

  .user-avatar {
    width: 38px;
    height: 38px;
    object-fit: cover;
    background: var(--grey-2);
    border: 2px solid var(--grey-0);
    border-radius: 50%;
    box-shadow: 0 1px 3px var(--grey-9-a1);
  }

  .user-avatar--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0;
  }

  .user-status {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 9px;
    height: 9px;
    background: #4ade80;
    border: 2px solid var(--grey-0);
    border-radius: 50%;
  }
}

.message-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: calc(100% - 58px);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;

  .username {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-color);

    &.my-username {
      color: var(--primary-color);
    }
  }

  .timestamp {
    font-size: 11px;
    color: var(--grey-5);
  }
}

.message-bubble {
  position: relative;
  max-width: 100%;
  padding: 9px 13px;
  background: var(--chat-bubble, var(--grey-0));
  border-radius: 16px 16px 16px 6px;
  box-shadow: 0 1px 2px var(--grey-9-a1);
  word-wrap: break-word;
  word-break: break-word;

  &.recalled {
    color: var(--grey-5);
    font-style: italic;
    background: var(--grey-2);
    box-shadow: none;
  }

  .message-text {
    font-size: 13px;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  .message-emoji {
    width: 21px;
    height: 21px;
    margin: 0 1px;
    vertical-align: text-bottom;
  }

  &.pending {
    opacity: 0.7;
  }

  &.failed {
    box-shadow: 0 0 0 1px var(--color-red-a3);
  }
}

// 发送状态挂在气泡右下角，不占正文的一行
.message-flag {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;

  &--pending {
    background: var(--grey-0);
    border: 2px solid var(--grey-3);
    border-top-color: var(--primary-color);
    animation: spin 0.8s linear infinite;
  }

  &--failed {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    background: var(--color-red);
    border: none;
    box-shadow: 0 2px 6px var(--color-red-a3);
  }
}

.recall-menu {
  position: absolute;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.82);
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);

  &:hover {
    background: rgba(0, 0, 0, 0.92);
  }

  &:focus-visible {
    outline: 2px solid var(--color-pink);
    outline-offset: 2px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .message-content {
    max-width: 78%;
  }
}
</style>
