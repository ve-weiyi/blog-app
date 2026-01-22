<template>
  <div class="ai-room">
    <div v-show="show" class="ai-container" :class="{ fullscreen: isFullscreen }">
      <div class="ai-header">
        <div class="header-content">
          <div class="ai-title">
            <div class="title-icon">
              <img :src="ai" alt="AI助手" width="20" height="20" />
            </div>
            <span class="title-text">AI助手</span>
          </div>
          <div class="status-info">
            <div class="status-indicator"></div>
            <span class="status-text">在线</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="close-btn" @click="clearChat" title="清除记录">
            <svg-icon icon-class="delete" size="1rem" />
          </button>
          <button
            class="close-btn"
            @click="toggleFullscreen"
            :title="isFullscreen ? '退出全屏' : '全屏显示'"
          >
            <svg-icon :icon-class="isFullscreen ? 'compress' : 'expand'" size="1rem" />
          </button>
          <button class="close-btn" @click="show = false" title="关闭">
            <svg-icon icon-class="close" size="1.2rem" />
          </button>
        </div>
      </div>

      <div v-if="showRolePanel" class="role-panel">
        <div class="role-header">
          <h4>选择角色</h4>
          <button class="close-role-btn" @click="showRolePanel = false">×</button>
        </div>
        <div class="role-list">
          <div v-for="role in roles" :key="role.id" class="role-item" @click="selectRole(role)">
            <div class="role-avatar">{{ role.emoji }}</div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div id="ai-content" class="ai-content">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <img :src="ai" alt="AI助手" width="48" height="48" />
          </div>
          <h3>你好！我是博客AI助手</h3>
          <p>我可以帮助您解答问题、提供建议和进行对话</p>

          <div class="quick-actions">
            <div class="action-title">快速开始：</div>
            <div class="action-buttons">
              <button @click="sendQuickMessage('请你介绍一下这个博客项目')" class="quick-btn">
                📝 博客介绍
              </button>
              <button @click="sendQuickMessage('有什么技术问题可以咨询？')" class="quick-btn">
                💻 技术咨询
              </button>
              <button @click="sendQuickMessage('推荐一些博客项目学习资源')" class="quick-btn">
                📚 学习资源
              </button>
              <button @click="sendQuickMessage('如何联系博主？')" class="quick-btn">
                📞 联系方式
              </button>
            </div>
          </div>

          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>智能对话</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <span>快速响应</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span>精准回答</span>
            </div>
          </div>
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="ai-item"
          :class="{ 'my-ai': message.isUser }"
        >
          <div class="message-wrapper">
            <div class="avatar-wrapper">
              <img v-if="message.isUser" :src="userAvatar" :alt="'用户'" class="user-avatar" />
              <div v-else class="ai-avatar">
                {{ currentRole?.emoji || "🤖" }}
              </div>
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="username" :class="{ 'my-username': message.isUser }">
                  {{ message.isUser ? "我" : "AI助手" }}
                </span>
                <span class="timestamp">
                  {{ formatDateTime(message.timestamp) }}
                </span>
              </div>

              <div class="message-bubble" :class="{ 'my-message': message.isUser }">
                <div v-if="message.isLoading" class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <div v-else v-html="message.content" class="message-text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-footer">
        <div class="quick-input-bar">
          <div class="quick-input-items">
            <button @click="toggleRolePanel" class="quick-input-btn">🎭 切换角色</button>
            <button @click="sendQuickMessage('你好')" class="quick-input-btn">👋 你好</button>
            <button @click="sendQuickMessage('帮助')" class="quick-input-btn">❓ 帮助</button>
            <button @click="sendQuickMessage('技术问题')" class="quick-input-btn">💻 技术</button>
            <button @click="sendQuickMessage('联系方式')" class="quick-input-btn">📞 联系</button>
          </div>
        </div>
        <div class="input-wrapper">
          <textarea
            v-model="inputContent"
            class="ai-input"
            placeholder="请输入您的问题..."
            @keydown="handleKeyCode($event)"
            :disabled="isLoading"
            rows="1"
          ></textarea>
          <div class="input-actions">
            <button
              class="send-btn"
              :disabled="!inputContent.trim() || isLoading"
              @click="handleSend"
            >
              <svg-icon v-if="isLoading" icon-class="loading" size="1rem" class="loading-icon" />
              <svg-icon v-else icon-class="plane" size="1rem" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-toggle" @click="handleOpen">
      <div v-if="unreadCount > 0" class="unread-badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </div>
      <div class="toggle-icon">
        <img :src="ai" alt="AI助手" width="36" height="36" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore, useUserStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import ai from "@/assets/icons/ai.svg";
import promptsData from "@/components/AiAssistant/prompts-zh.json";

// 消息接口定义
interface Message {
  content: string;
  isUser: boolean;
  timestamp: number;
  isLoading?: boolean;
}

const userStore = useUserStore();
const blogStore = useBlogStore();

const show = ref(false);
const messages = ref<Message[]>([]);
const inputContent = ref("");
const isLoading = ref(false);
const unreadCount = ref(0);
const isFullscreen = ref(false);
const showRolePanel = ref(false);
const currentRole = ref(null);

const userAvatar = computed(
  () => userStore.userInfo.avatar || blogStore.blogInfo.website_config.tourist_avatar
);

// 角色列表
const roles = promptsData.map((item, index) => ({
  id: index + 1,
  name: item.act,
  emoji: item.emoji,
  description: item.act,
  prompt: item.prompt,
}));

// 打开AI助手面板
const handleOpen = () => {
  unreadCount.value = 0;
  show.value = !show.value;
};

// 切换角色面板
const toggleRolePanel = () => {
  showRolePanel.value = !showRolePanel.value;
};

// 选择角色
const selectRole = async (role) => {
  currentRole.value = role;
  showRolePanel.value = false;
  messages.value = [];

  // 发送角色prompt给AI
  const aiMessage = {
    content: "",
    isUser: false,
    timestamp: Date.now(),
    isLoading: true,
  };
  messages.value.push(aiMessage);
  const aiMessageIndex = messages.value.length - 1;

  isLoading.value = true;

  try {
    await getAIResponseStream(role.prompt, (chunk) => {
      messages.value[aiMessageIndex].content += chunk;
      messages.value[aiMessageIndex].isLoading = false;
    });
  } catch (error) {
    console.error("角色初始化失败:", error);
    messages.value[aiMessageIndex].content = "角色初始化失败，请重试。";
    messages.value[aiMessageIndex].isLoading = false;
  } finally {
    isLoading.value = false;
  }
};

// 切换全屏显示
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 清空聊天记录
const clearChat = () => {
  messages.value = [];
  currentRole.value = null;
};

// 快速消息发送
const sendQuickMessage = (message: string) => {
  inputContent.value = message;
  handleSend();
};

// 调用OpenAI API (Stream)
const getAIResponseStream = async (
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch(import.meta.env.VITE_APP_AI_API_URL + "/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
          {
            role: "system",
            content: currentRole.value ? currentRole.value.prompt : roles[0].prompt,
          },
          ...messages.value
            .filter((m) => !m.isLoading)
            .map((m) => ({
              role: m.isUser ? "user" : "assistant",
              content: m.content,
            })),
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error("OpenAI API调用失败:", error);
    onChunk("抱歉，服务暂时不可用，请稍后再试。");
  }
};

// 发送消息
const handleSend = async () => {
  if (!inputContent.value.trim() || isLoading.value) return;

  const userMessage = inputContent.value.trim();
  inputContent.value = "";

  // 添加用户消息
  messages.value.push({
    content: userMessage,
    isUser: true,
    timestamp: Date.now(),
  });

  // 添加AI回复消息（初始为空）
  const aiMessage: Message = {
    content: "",
    isUser: false,
    timestamp: Date.now(),
    isLoading: true,
  };
  messages.value.push(aiMessage);
  const aiMessageIndex = messages.value.length - 1;

  isLoading.value = true;

  try {
    await getAIResponseStream(userMessage, (chunk: string) => {
      // 更新AI消息内容
      messages.value[aiMessageIndex].content += chunk;
      messages.value[aiMessageIndex].isLoading = false;
    });

    if (!show.value) {
      unreadCount.value++;
    }
  } catch (error) {
    console.error("AI回复失败:", error);
    messages.value[aiMessageIndex].content = "抱歉，我现在无法回复您的消息，请稍后再试。";
    messages.value[aiMessageIndex].isLoading = false;
  } finally {
    isLoading.value = false;
  }
};

// 输入事件处理
const handleKeyCode = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === "Enter") {
    inputContent.value += "\n";
  } else if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

// 自动滚动到底部
watch(
  messages,
  () => {
    nextTick(() => {
      const element = document.getElementById("ai-content");
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.ai-room {
  position: relative;
}

.ai-container {
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
  .ai-container {
    position: fixed;
    bottom: 166px;
    right: 20px;
    width: 400px;
    height: 600px;
    max-height: calc(100vh - 186px);

    &.fullscreen {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100vw;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }
  }
}

@media (max-width: 760px) {
  .ai-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    border-radius: 0;
  }
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ai-title {
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

  .status-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.9;

    .status-indicator {
      width: 8px;
      height: 8px;
      background: #60a5fa;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
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
    position: relative;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
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

.role-panel {
  position: absolute;
  bottom: 120px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1300;
  max-height: 300px;
  overflow-y: auto;
  animation: slideUp 0.2s ease-out;

  .role-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color, #374151);
    }

    .close-role-btn {
      width: 20px;
      height: 20px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      color: #666;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }

  .role-list {
    padding: 8px;

    .role-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(59, 130, 246, 0.05);
      }

      .role-avatar {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 50%;
        font-size: 16px;
      }

      .role-info {
        flex: 1;

        .role-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-color, #374151);
          margin-bottom: 2px;
        }

        .role-desc {
          font-size: 11px;
          color: var(--text-color-secondary, #9ca3af);
          line-height: 1.3;
        }
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-content {
  height: calc(100% - 200px);
  padding: 16px;
  overflow-y: auto;
  background: var(--ai-bg, #f8fafc);

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

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-color-secondary, #9ca3af);
  padding: 20px;

  .welcome-icon {
    margin-bottom: 16px;
    opacity: 0.8;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #374151);
  }

  p {
    margin: 0 0 24px 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .quick-actions {
    width: 100%;
    margin-bottom: 24px;

    .action-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-color, #374151);
      margin-bottom: 12px;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      .quick-btn {
        padding: 8px 12px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        font-size: 12px;
        color: #3b82f6;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(59, 130, 246, 0.15);
          transform: translateY(-1px);
        }

        &.role-select-btn {
          background: rgba(156, 39, 176, 0.1);
          border-color: rgba(156, 39, 176, 0.2);
          color: #9c27b0;

          &:hover {
            background: rgba(156, 39, 176, 0.15);
          }
        }
      }
    }
  }

  .features {
    display: flex;
    gap: 16px;

    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--text-color-secondary, #9ca3af);

      .feature-icon {
        font-size: 16px;
      }
    }
  }
}

.ai-item {
  margin-bottom: 16px;

  &.my-ai {
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
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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

  .ai-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
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
      color: #3b82f6;
    }
  }

  .timestamp {
    font-size: 11px;
    color: var(--text-color-secondary, #9ca3af);
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

  .message-text {
    line-height: 1.4;
    white-space: pre-wrap;
    font-size: 13px;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
    align-items: center;

    span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      animation: loading-bounce 1.4s infinite ease-in-out;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }
      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.quick-input-bar {
  padding: 12px 16px 4px;

  .quick-input-items {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      display: none;
    }

    .quick-input-btn {
      flex-shrink: 0;
      padding: 6px 12px;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.15);
      border-radius: 16px;
      font-size: 12px;
      color: #3b82f6;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: rgba(59, 130, 246, 0.12);
        transform: translateY(-1px);
      }
    }
  }
}

.ai-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    margin: 0 16px 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .ai-input {
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

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-icon {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ai-toggle {
  position: fixed;
  bottom: calc(24px + 56px + 10px);
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
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
  .ai-toggle {
    bottom: calc(16px + 56px + 5px);
    right: 16px;
    width: 48px;
    height: 48px;
  }

  .ai-footer {
    padding: 12px;
  }

  .ai-content {
    padding: 12px;
  }
}
</style>
