<template>
  <div class="chat-footer">
    <div class="input-wrapper">
      <textarea
        ref="inputRef"
        :value="modelValue"
        class="chat-input"
        placeholder="说点什么…"
        aria-label="消息输入框"
        maxlength="1000"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
      ></textarea>
      <div class="input-actions">
        <Emoji class="emoji-btn" @add-emoji="appendEmoji" />
        <button
          class="send-btn"
          aria-label="发送消息"
          :disabled="!modelValue.trim() || !connected"
          @click="emit('send')"
        >
          <svg-icon icon-class="plane" size="1rem" />
        </button>
      </div>
    </div>
    <p class="composer-hint">Enter 发送 · Shift + Enter 换行</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
  /** 连接未就绪时禁用发送，避免用户以为消息已经发出。 */
  connected: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "send"): void;
}>();

const inputRef = ref<HTMLTextAreaElement | null>(null);
/** 输入框最多长到 4 行，再长就内部滚动。 */
const MAX_INPUT_HEIGHT = 96;

function resize() {
  const element = inputRef.value;
  if (!element) {
    return;
  }
  element.style.height = "auto";
  element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT)}px`;
}

function handleInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
  resize();
}

function appendEmoji(key: string) {
  emit("update:modelValue", props.modelValue + key);
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl/Shift+Enter 与输入法组词的 Enter 都留给换行
  if (event.key !== "Enter" || event.ctrlKey || event.shiftKey || event.isComposing) {
    return;
  }
  event.preventDefault();
  emit("send");
}

watch(
  () => props.modelValue,
  () => void nextTick(resize)
);
onMounted(resize);
</script>

<style lang="scss" scoped>
.chat-footer {
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

.chat-input {
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

.input-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--grey-5);
  cursor: pointer;
  border-radius: 50%;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    color: var(--primary-color);
    background: var(--grey-2);
  }
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--primary-color) 100%);
  border: none;
  border-radius: 11px;
  box-shadow: 0 4px 10px var(--color-pink-a3);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;

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
</style>
