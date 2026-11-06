import { buildRequestHeaders } from "@/utils/request";

/**
 * 读者端通知信号流。
 *
 * 服务端只推「收件箱变了」，不带正文；收到任意一帧就回查未读与列表。
 * 连接本身不可靠：断线、重启、网关回收都会发生，所以这里做指数退避重连，
 * 并用静默超时覆盖 TCP 半开——长时间收不到任何字节（含心跳注释行）即判定链路已死。
 */

/** go-zero 用等值判断决定是否豁免长连接超时，Accept 必须精确等于这个值 */
const AcceptEventStream = "text/event-stream";

const ReconnectBase = 5000;
const ReconnectMax = 120000;
/** 服务端心跳 15s，这里取 3 倍作为静默上限 */
const StaleTimeout = 45000;

export type NotificationStream = {
  start: () => void;
  stop: () => void;
};

export function useNotificationStream(onChange: () => void): NotificationStream {
  let abortController: AbortController | null = null;
  let staleTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = ReconnectBase;
  let manualStop = false;

  const clearStale = () => {
    if (staleTimer) {
      clearTimeout(staleTimer);
      staleTimer = null;
    }
  };

  const armStale = () => {
    clearStale();
    staleTimer = setTimeout(() => {
      teardown();
      scheduleReconnect();
    }, StaleTimeout);
  };

  const teardown = () => {
    clearStale();
    abortController?.abort();
    abortController = null;
  };

  const scheduleReconnect = () => {
    if (manualStop || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      reconnectDelay = Math.min(reconnectDelay * 2, ReconnectMax);
      void connect();
    }, reconnectDelay);
  };

  const consume = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      // 收到任何字节都算链路活着
      armStale();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        // 只关心「有数据」这件事：帧内容是固定的 notify 信号
        if (line.startsWith("data:")) {
          onChange();
        }
      }
    }
  };

  const connect = async () => {
    if (manualStop) return;

    abortController = new AbortController();
    try {
      const headers = await buildRequestHeaders();
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/notifications/stream`, {
        method: "GET",
        headers: { ...headers, Accept: AcceptEventStream },
        signal: abortController.signal,
      });
      if (!response.ok || !response.body) {
        scheduleReconnect();
        return;
      }

      // 连上即补拉一次：断线期间的变更不会因为漏帧而永久不可见
      reconnectDelay = ReconnectBase;
      onChange();
      armStale();

      await consume(response.body.getReader());
      scheduleReconnect();
    } catch (err) {
      if (manualStop || (err instanceof Error && err.name === "AbortError")) {
        return;
      }
      scheduleReconnect();
    }
  };

  return {
    start() {
      manualStop = false;
      void connect();
    },
    stop() {
      manualStop = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      teardown();
    },
  };
}
