import { computed, ref } from "vue";
import { useUserStore } from "@/stores";
import {
  AiAPI,
  streamAiChat,
  type AiChatMessage,
  type AiCitation,
  type AiQuotaResp,
  type AiStreamEvent,
  type AiStreamHandle,
} from "@/api/ai";

/** 单条问题的最大字符数，与服务端一致。 */
const MAX_MESSAGE_RUNES = 1000;
/** 游客携带的历史轮数与总字符上限。 */
const GUEST_HISTORY_TURNS = 6;
const GUEST_HISTORY_CHARS = 4000;

export interface UiMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  pending?: boolean;
  failed?: boolean;
  /** 工具阶段提示，如「正在检索站内文章…」 */
  activity?: string;
  citations?: AiCitation[];
}

/**
 * AI 助手的会话状态。
 *
 * 游客的历史在内存里保留并由请求携带，服务端不落库；登录用户由服务端建会话，
 * 后续请求带 session_id 续聊。
 */
export function useAiChat() {
  const userStore = useUserStore();

  const messages = ref<UiMessage[]>([]);
  const sessionId = ref(0);
  const streaming = ref(false);
  const quota = ref<AiQuotaResp | null>(null);
  const errorText = ref("");

  let handle: AiStreamHandle | null = null;
  let messageSeq = 0;

  const loggedIn = computed(() => !!userStore.userInfo.user_id);
  const quotaLabel = computed(() => {
    if (!quota.value) {
      return "";
    }
    if (quota.value.remaining < 0) {
      return "不限次数";
    }
    return `今日剩余 ${quota.value.remaining} 次`;
  });

  async function refreshQuota() {
    try {
      const { data } = await AiAPI.getQuota();
      quota.value = data;
    } catch {
      // 额度只是提示，拉取失败不影响对话
    }
  }

  function send(raw: string) {
    const text = raw.trim();
    if (!text) {
      return;
    }
    if ([...text].length > MAX_MESSAGE_RUNES) {
      errorText.value = `消息不能超过 ${MAX_MESSAGE_RUNES} 个字符`;
      return;
    }
    if (streaming.value) {
      return;
    }

    errorText.value = "";
    // 游客历史要在把本轮消息放进列表之前取
    const history = loggedIn.value ? undefined : buildGuestHistory();

    const now = Date.now();
    messages.value.push({ id: ++messageSeq, role: "user", content: text, createdAt: now });
    const assistant: UiMessage = {
      id: ++messageSeq,
      role: "assistant",
      content: "",
      createdAt: now,
      pending: true,
    };
    messages.value.push(assistant);
    streaming.value = true;

    handle = streamAiChat(
      {
        session_id: sessionId.value || undefined,
        message: text,
        history,
      },
      {
        onEvent: (event) => applyEvent(event, assistant.id),
        onError: (error) => failStream(assistant.id, error),
        onClose: () => {
          convergePending();
          streaming.value = false;
          handle = null;
        },
      }
    );
  }

  function applyEvent(event: AiStreamEvent, assistantId: number) {
    const message = findMessage(assistantId);

    switch (event.type) {
      case "meta":
        if (event.session_id) {
          sessionId.value = event.session_id;
        }
        if (typeof event.quota_left === "number") {
          quota.value = quota.value
            ? { ...quota.value, remaining: event.quota_left }
            : { daily_quota: 0, used: 0, remaining: event.quota_left };
        }
        break;

      case "tool":
        if (event.tool?.phase === "started") {
          if (message) {
            message.activity = event.tool.label || "正在检索站内文章…";
          }
        } else if (event.tool?.phase === "completed") {
          if (message) {
            message.activity = "";
            message.citations = event.tool.articles ?? [];
          }
        }
        break;

      case "delta":
        if (message) {
          message.activity = "";
          message.content += event.content ?? "";
        }
        break;

      case "done":
        if (message) {
          message.pending = false;
        }
        streaming.value = false;
        handle = null;
        void refreshQuota();
        break;

      case "error":
        if (message) {
          message.pending = false;
          message.failed = true;
          if (!message.content) {
            message.content = event.message || "AI 服务暂时不可用，请稍后重试";
          }
        }
        errorText.value = event.message || "AI 服务暂时不可用，请稍后重试";
        streaming.value = false;
        handle = null;
        break;
    }
  }

  /** 流异常结束（没有 done/error 事件）时收敛最后一条助手消息，避免永久转圈。 */
  function convergePending() {
    const last = messages.value[messages.value.length - 1];
    if (!last || last.role !== "assistant" || !last.pending) {
      return;
    }
    last.pending = false;
    last.failed = true;
    if (!last.content) {
      last.content = "AI 服务暂时不可用，请稍后重试";
    }
    errorText.value = "连接已断开，回答可能不完整";
  }

  function failStream(assistantId: number, error: unknown) {
    const message = findMessage(assistantId);
    if (message) {
      message.pending = false;
      message.failed = true;
      if (!message.content) {
        message.content = "AI 服务暂时不可用，请稍后重试";
      }
    }
    errorText.value = error instanceof Error ? error.message : "AI 服务暂时不可用，请稍后重试";
    streaming.value = false;
    handle = null;
  }

  /** 停止生成：保留已收到的内容，空回复直接移除。 */
  function stop() {
    handle?.abort();
    handle = null;
    streaming.value = false;

    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant" && last.pending) {
      last.pending = false;
      if (!last.content) {
        messages.value.pop();
      }
    }
  }

  /** 重试最后一次失败的回复。 */
  function retry() {
    const last = messages.value[messages.value.length - 1];
    if (!last || last.role !== "assistant" || !last.failed) {
      return;
    }
    messages.value.pop();
    const question = messages.value[messages.value.length - 1];
    if (!question || question.role !== "user") {
      return;
    }
    messages.value.pop();
    send(question.content);
  }

  function clear() {
    stop();
    messages.value = [];
    sessionId.value = 0;
    errorText.value = "";
  }

  function findMessage(id: number) {
    return messages.value.find((item) => item.id === id);
  }

  /** 从已完成的消息里取最近若干轮，按字符上限从旧到新丢弃。 */
  function buildGuestHistory(): AiChatMessage[] {
    const completed = messages.value.filter(
      (item) => !item.pending && !item.failed && item.content
    );
    const recent = completed.slice(-GUEST_HISTORY_TURNS * 2);

    const history: AiChatMessage[] = [];
    let chars = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      const item = recent[i];
      const size = [...item.content].length;
      if (chars + size > GUEST_HISTORY_CHARS && history.length > 0) {
        break;
      }
      history.unshift({ role: item.role, content: item.content });
      chars += size;
    }
    return history;
  }

  return {
    messages,
    streaming,
    quotaLabel,
    errorText,
    sessionId,
    send,
    stop,
    retry,
    clear,
    refreshQuota,
  };
}
