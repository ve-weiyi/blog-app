import request, { buildRequestHeaders } from "@/utils/request";
import type { ListResult } from "@/api/types";

const BASE_URL = (import.meta.env.VITE_APP_AI_API_URL || "/api/v1/ai").replace(/\/$/, "");

export type AiRole = "user" | "assistant";

export interface AiChatMessage {
  role: AiRole;
  content: string;
}

export interface AiChatStreamReq {
  /** 登录用户续聊时传入；游客不传 */
  session_id?: number;
  message: string;
  /** 游客携带的最近若干轮历史，服务端会再次裁剪 */
  history?: AiChatMessage[];
}

export interface AiCitation {
  article_id: number;
  title: string;
  url: string;
  /** 片段摘要，用于引用卡片 */
  summary?: string;
}

export interface AiToolEvent {
  name: string;
  phase: "started" | "completed" | "failed";
  label?: string;
  summary?: string;
  articles?: AiCitation[];
}

export interface AiUsage {
  prompt_tokens: number;
  completion_tokens: number;
}

export interface AiStreamEvent {
  type: "meta" | "tool" | "delta" | "done" | "error";
  session_id?: number;
  guest?: boolean;
  quota_left?: number;
  content?: string;
  tool?: AiToolEvent;
  usage?: AiUsage;
  code?: string;
  message?: string;
}

export interface AiQuotaResp {
  daily_quota: number;
  used: number;
  remaining: number;
}

export interface AiSessionVO {
  id: number;
  title: string;
  model: string;
  message_count: number;
  created_at: number;
  updated_at: number;
  last_message_at: number;
}

export interface AiMessageVO {
  id: number;
  session_id: number;
  role: AiRole;
  content: string;
  created_at: number;
}

export class AiStreamError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message);
    this.name = "AiStreamError";
    this.code = options.code;
    this.status = options.status;
  }
}

export interface StreamHandlers {
  onEvent: (event: AiStreamEvent) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

export interface AiStreamHandle {
  abort: () => void;
}

/**
 * 发起问答流。
 *
 * 用 fetch 而不是 EventSource：需要 POST 与自定义请求头。按空行切帧并保留跨 chunk
 * 缓冲；心跳是注释帧（`: ping`），解析时跳过。收到 done / error 后停止读取。
 */
export function streamAiChat(payload: AiChatStreamReq, handlers: StreamHandlers): AiStreamHandle {
  const controller = new AbortController();

  const run = async () => {
    const headers = await buildRequestHeaders();
    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw await toStreamError(response);
    }
    if (!response.body) {
      throw new AiStreamError("AI 助手返回为空", { status: response.status });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        if (handleFrame(frame, handlers)) {
          finished = true;
          break;
        }
        boundary = buffer.indexOf("\n\n");
      }
    }

    if (finished) {
      await reader.cancel().catch(() => undefined);
    } else if (buffer.trim()) {
      handleFrame(buffer, handlers);
    }
    handlers.onClose?.();
  };

  run().catch((error) => {
    if (controller.signal.aborted) {
      return;
    }
    handlers.onError?.(error);
  });

  return { abort: () => controller.abort() };
}

/** 解析一帧 SSE；返回 true 表示流已结束。 */
function handleFrame(frame: string, handlers: StreamHandlers): boolean {
  const lines = frame.split("\n");
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!data) {
    return false;
  }

  try {
    const event = JSON.parse(data) as AiStreamEvent;
    handlers.onEvent(event);
    return event.type === "done" || event.type === "error";
  } catch {
    return false;
  }
}

async function toStreamError(response: Response): Promise<AiStreamError> {
  let message = `AI 请求失败（HTTP ${response.status}）`;
  let code: string | undefined;
  try {
    const body = (await response.json()) as { code?: string; message?: string };
    if (body?.message) {
      message = body.message;
    }
    code = body?.code;
  } catch {
    // 非 JSON 错误体保留状态码文案
  }
  return new AiStreamError(message, { code, status: response.status });
}

export const AiAPI = {
  /** 今日剩余额度 */
  getQuota(): Promise<ApiResponse<AiQuotaResp>> {
    return request({ url: "/api/v1/ai/quota", method: "GET" });
  },

  /** 我的会话列表（仅登录） */
  querySessions(params?: {
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<ListResult>> {
    return request({ url: "/api/v1/ai/sessions", method: "GET", params });
  },

  /** 会话消息（仅登录） */
  queryMessages(
    sessionId: number,
    params?: { after?: number; limit?: number }
  ): Promise<ApiResponse<{ list: AiMessageVO[] }>> {
    return request({
      url: `/api/v1/ai/sessions/${sessionId}/messages`,
      method: "GET",
      params,
    });
  },

  /** 删除会话（仅登录） */
  deleteSession(sessionId: number): Promise<ApiResponse<{ success_count: number }>> {
    return request({ url: `/api/v1/ai/sessions/${sessionId}`, method: "DELETE" });
  },
};
