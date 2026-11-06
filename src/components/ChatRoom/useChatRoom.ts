import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import { useBlogStore, useUserStore } from "@/stores";
import { AuthStorage } from "@/utils/auth";
import { isRecalled } from "./message";
import {
  HISTORY_TIMEOUT_MS,
  MAX_CONTENT_LENGTH,
  MESSAGES,
  MESSAGE_STATUS,
  MESSAGE_TYPES,
  SEND_TIMEOUT_MS,
  WS_CONFIG,
  type ChatMessageEvent,
  type EditMessageEvent,
  type HistoryMessageEvent,
  type MessageEvent,
  type OnlineMessageEvent,
  type SendMessageEvent,
  type UiChatMessage,
} from "./types";

/** 合并两批消息：按 id 去重，再按时间与主键排序。 */
function mergeMessages(current: UiChatMessage[], incoming: ChatMessageEvent[]) {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming.slice().reverse()) {
    byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => a.created_at - b.created_at || a.id - b.id);
}

interface ChatRoomOptions {
  /** 面板是否打开：决定新消息是否计入未读数。 */
  show: Ref<boolean>;
  /**
   * 合并更早的历史消息前调用，返回一个在 DOM 更新后执行的收尾函数。
   * 组件用它把滚动位置固定在原来读到的位置。
   */
  preserveScroll?: () => (() => void) | undefined;
}

/**
 * 聊天室的连接与消息状态。
 *
 * 滚动位置依赖 DOM，留在组件里；这里只负责连接、消息合并、发送回显与历史分页。
 */
export function useChatRoom({ show, preserveScroll }: ChatRoomOptions) {
  const userStore = useUserStore();
  const blogStore = useBlogStore();

  const connectionState = ref<"idle" | "connecting" | "connected" | "disconnected">("idle");
  const recordList = ref<UiChatMessage[]>([]);
  const draft = ref("");
  const unreadCount = ref(0);
  const onlineCount = ref(0);
  const historyHasMore = ref(false);
  const historyLoading = ref(false);

  const stompClient = ref<Client | null>(null);
  const subscription = ref<{ unsubscribe: () => void } | null>(null);

  let localMessageSeq = 0;
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** 下一页游标：服务端返回的本页最早原始行时间 */
  let historyCursor = 0;
  let historyTimer: ReturnType<typeof setTimeout> | null = null;

  function clearHistoryTimer() {
    if (historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }
  }

  const connectionLabel = computed(() => {
    if (connectionState.value === "connected") {
      return `${onlineCount.value} 人在线`;
    }
    return connectionState.value === "connecting" ? "连接中…" : "已断开";
  });

  /** 用用户 id 认身份，游客退到设备标识；不拿 IP 充当身份。 */
  function isMine(chat: ChatMessageEvent) {
    const userId = userStore.userInfo.user_id;
    if (chat.user_id && userId) {
      return chat.user_id === userId;
    }
    const deviceId = AuthStorage.getDeviceId();
    return !!chat.device_id && chat.device_id === deviceId;
  }

  // CONNECT 帧的凭证。每次重连都重新读：登录/登出或令牌刷新后不能复用旧身份。
  function buildConnectHeaders() {
    return {
      // STOMP 1.1/1.2 规定 CONNECT 必带 host，而 stompjs 不会自动补上（它只加
      // accept-version 与 heart-beat），缺了服务端直接拒连。
      host: location.host,
      login: AuthStorage.getUid() || "",
      passcode: AuthStorage.getToken() || "",
      client: AuthStorage.getDeviceId() || "",
    };
  }

  function publishMessage(msg: MessageEvent) {
    const client = stompClient.value;
    if (!client || !client.connected) {
      throw new Error("聊天室未连接");
    }
    client.publish({
      destination: WS_CONFIG.CHAT_TOPIC,
      body: JSON.stringify(msg),
    });
  }

  function handleOnlineMessage(data: OnlineMessageEvent) {
    onlineCount.value = data.count;
  }

  /**
   * 合并一页历史，并采用服务端给出的「还有更早」与游标。
   *
   * 游标不能用过滤掉已删除记录后的最早一条：删除的记录同样占页，用它当游标
   * 会跳过边界，用过滤后条数推断则会让分页提前终止。
   */
  function applyHistoryPage(data: HistoryMessageEvent) {
    // 按 id 合并而不是整体替换：订阅与历史查询之间到达的新消息不能被覆盖
    recordList.value = mergeMessages(recordList.value, data.list);
    historyHasMore.value = data.has_more ?? (data.size > 0 && data.list.length >= data.size);

    if (data.next_before) {
      historyCursor = data.next_before;
    } else if (data.list.length > 0) {
      historyCursor = data.list.reduce((a, b) => (a.created_at <= b.created_at ? a : b)).created_at;
    } else {
      historyCursor = 0;
    }
  }

  function handleHistoryMessage(data: HistoryMessageEvent) {
    applyHistoryPage(data);
  }

  async function handleHistoryMore(data: HistoryMessageEvent) {
    clearHistoryTimer();
    const restoreScroll = preserveScroll?.();
    applyHistoryPage(data);
    await nextTick();
    restoreScroll?.();
    // 保持 loading 到合并与滚动复位之后，组件据此跳过「新消息」提示
    historyLoading.value = false;
  }

  /** 加载更早的一页；滚动位置由调用方在更新后修正。 */
  function loadOlder() {
    if (historyLoading.value || !historyHasMore.value) {
      return;
    }
    const before =
      historyCursor || recordList.value.find((item) => !item.local_id)?.created_at || 0;
    if (!before) {
      return;
    }

    historyLoading.value = true;
    historyTimer = setTimeout(() => {
      historyTimer = null;
      historyLoading.value = false;
      window.$message?.error("加载更早消息超时，请稍后重试");
    }, HISTORY_TIMEOUT_MS);

    try {
      publishMessage({
        type: MESSAGE_TYPES.HISTORY_MORE,
        data: JSON.stringify({ before, limit: 20 }),
        timestamp: Date.now(),
      });
    } catch (error) {
      clearHistoryTimer();
      historyLoading.value = false;
      window.$message?.error("加载更早消息失败，请稍后重试");
      console.error("加载更早消息失败:", error);
    }
  }

  // 回显先替换本地 pending，同一 id 的重复广播直接丢弃
  function handleNewMessage(data: ChatMessageEvent) {
    if (data.client_msg_id) {
      const localIndex = recordList.value.findIndex(
        (item) => item.local_id === data.client_msg_id && item.pending
      );
      if (localIndex !== -1) {
        recordList.value.splice(localIndex, 1);
      }
      const timer = pendingTimers.get(data.client_msg_id);
      if (timer) {
        clearTimeout(timer);
        pendingTimers.delete(data.client_msg_id);
      }
    }

    if (recordList.value.some((item) => item.id === data.id)) {
      return;
    }
    recordList.value.push(data);
    if (!show.value && !isMine(data)) {
      unreadCount.value++;
    }
  }

  function handleEditMessage(data: EditMessageEvent) {
    const target = recordList.value.find((item) => item.id === data.id);
    if (target) {
      target.content = data.content;
      target.status = data.status;
      target.updated_at = data.updated_at;
    }
  }

  function handleMessage(message: IMessage) {
    try {
      if (!message.body) {
        return;
      }

      const res: MessageEvent = JSON.parse(message.body);
      const data = JSON.parse(res.data);

      switch (res.type) {
        case MESSAGE_TYPES.ONLINE:
          handleOnlineMessage(data as OnlineMessageEvent);
          break;
        case MESSAGE_TYPES.HISTORY:
          handleHistoryMessage(data as HistoryMessageEvent);
          break;
        case MESSAGE_TYPES.HISTORY_MORE:
          void handleHistoryMore(data as HistoryMessageEvent);
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
  }

  function handleConnect() {
    connectionState.value = "connected";
    try {
      subscription.value = stompClient.value?.subscribe(WS_CONFIG.CHAT_TOPIC, handleMessage, {});
    } catch (error) {
      console.error("订阅消息失败:", error);
    }
  }

  function handleWebSocketClose() {
    connectionState.value = "disconnected";
    // 断线后这一页的请求不会再有回音，解除禁用态，重连后由订阅补发兜底
    clearHistoryTimer();
    historyLoading.value = false;
    console.warn(MESSAGES.CONNECTION_CLOSED);
  }

  // 应用层拒绝（例如消息过长）只回 ERROR、不关连接，
  // 因此这里不把连接状态改成断开，交给 onWebSocketClose 处理真正的断线。
  function handleStompError(frame: IFrame) {
    const clientMsgId = frame.headers?.["client-msg-id"];
    if (clientMsgId) {
      const item = recordList.value.find((message) => message.local_id === clientMsgId);
      if (item) {
        item.pending = false;
        item.failed = true;
      }
      const timer = pendingTimers.get(clientMsgId);
      if (timer) {
        clearTimeout(timer);
        pendingTimers.delete(clientMsgId);
      }
    }
    clearHistoryTimer();
    historyLoading.value = false;
    const message = frame.headers?.message || frame.body || "聊天室发生错误";
    window.$message?.error(message);
    console.error(MESSAGES.STOMP_ERROR, frame);
  }

  async function cleanup() {
    const client = stompClient.value;
    stompClient.value = null;
    connectionState.value = "idle";
    clearHistoryTimer();
    historyLoading.value = false;

    try {
      subscription.value?.unsubscribe();
      subscription.value = null;
    } catch (error) {
      console.error("取消订阅失败:", error);
    }

    if (client) {
      try {
        await client.deactivate();
      } catch (error) {
        console.error("关闭WebSocket失败:", error);
      }
    }
  }

  /** 按需连接：已有活跃客户端时复用，避免重复建连。 */
  function ensureConnected() {
    if (!stompClient.value?.active) {
      void connect();
    }
  }

  async function connect() {
    await cleanup();
    connectionState.value = "connecting";

    try {
      const url =
        import.meta.env.VITE_APP_WS_ENDPOINT || blogStore.blogInfo.website_config.websocket_url;
      const client = new Client({
        connectHeaders: buildConnectHeaders(),
        beforeConnect: () => {
          client.connectHeaders = buildConnectHeaders();
        },
        brokerURL: url,
        reconnectDelay: WS_CONFIG.RECONNECT_DELAY,
        heartbeatIncoming: WS_CONFIG.HEARTBEAT_INCOMING,
        heartbeatOutgoing: WS_CONFIG.HEARTBEAT_OUTGOING,
        onConnect: handleConnect,
        onWebSocketClose: handleWebSocketClose,
        onStompError: handleStompError,
      });

      stompClient.value = client;
      client.activate();
    } catch (error) {
      connectionState.value = "disconnected";
      console.error("初始化WebSocket失败:", error);
    }
  }

  /** 发送消息：先落一条本地 pending，服务端回显或报错后再收敛。 */
  function send() {
    if (connectionState.value !== "connected") {
      window.$message?.error("聊天室未连接，请稍后重试");
      return;
    }

    const content = draft.value.trim();
    if (content === "") {
      window.$message?.error(MESSAGES.EMPTY_CONTENT);
      return;
    }
    if ([...content].length > MAX_CONTENT_LENGTH) {
      window.$message?.error(`消息不能超过 ${MAX_CONTENT_LENGTH} 个字符`);
      return;
    }

    const localId = `local-${Date.now()}-${++localMessageSeq}`;
    const now = Date.now();
    const pending: UiChatMessage = {
      id: -localMessageSeq,
      user_id: userStore.userInfo.user_id || "",
      device_id: AuthStorage.getDeviceId() || "",
      nickname: userStore.userInfo.nickname || "",
      avatar: userStore.userInfo.avatar || "",
      ip_source: "",
      type: MESSAGE_TYPES.TEXT,
      content,
      status: MESSAGE_STATUS.NORMAL,
      created_at: now,
      updated_at: now,
      local_id: localId,
      pending: true,
    };
    recordList.value.push(pending);

    pendingTimers.set(
      localId,
      setTimeout(() => {
        const item = recordList.value.find(
          (message) => message.local_id === localId && message.pending
        );
        if (item) {
          item.pending = false;
          item.failed = true;
        }
        pendingTimers.delete(localId);
      }, SEND_TIMEOUT_MS)
    );

    try {
      // 只发原始文本与表情标记，不拼 HTML；渲染层负责把标记变成图片
      const sendEvent: SendMessageEvent = {
        type: MESSAGE_TYPES.TEXT,
        content,
        client_msg_id: localId,
      };
      publishMessage({
        type: MESSAGE_TYPES.SEND,
        data: JSON.stringify(sendEvent),
        timestamp: Date.now(),
      });
      draft.value = "";
    } catch (error) {
      const item = recordList.value.find((message) => message.local_id === localId);
      if (item) {
        item.pending = false;
        item.failed = true;
      }
      console.error("发送消息失败:", error);
      window.$message?.error("发送失败，请重试");
    }
  }

  /** 重试失败消息：去掉本地气泡后把正文放回输入框，由用户再确认一次。 */
  function retry(chat: UiChatMessage) {
    if (!chat.failed) {
      return;
    }
    const index = recordList.value.indexOf(chat);
    if (index !== -1) {
      recordList.value.splice(index, 1);
    }
    draft.value = chat.content;
    send();
  }

  /** 撤回自己的消息：改状态而不是删记录，历史查询仍能读到撤回标记。 */
  function recall(chat: ChatMessageEvent) {
    try {
      const editEvent: EditMessageEvent = {
        id: chat.id,
        type: chat.type,
        content: MESSAGES.RECALLED,
        status: MESSAGE_STATUS.RECALLED,
        updated_at: Date.now(),
      };
      publishMessage({
        type: MESSAGE_TYPES.EDIT,
        data: JSON.stringify(editEvent),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("撤回消息失败:", error);
    }
  }

  function canRecall(chat: UiChatMessage) {
    return !chat.pending && !chat.failed && !isRecalled(chat) && isMine(chat);
  }

  // 登录/登出后重建连接：CONNECT 帧里的身份不能沿用旧会话
  watch(
    () => userStore.userInfo.user_id,
    () => {
      if (stompClient.value) {
        void connect();
      }
    }
  );

  let connectTimer: ReturnType<typeof setTimeout> | null = null;

  onMounted(() => {
    // 延迟连接，避免每个访客一进站就占用一条长连接；未读角标也能在打开前生效
    connectTimer = setTimeout(ensureConnected, 2000);
  });

  onBeforeUnmount(() => {
    if (connectTimer) {
      clearTimeout(connectTimer);
    }
    void cleanup();
  });

  return {
    connectionState,
    connectionLabel,
    recordList,
    draft,
    unreadCount,
    onlineCount,
    historyHasMore,
    historyLoading,
    isMine,
    canRecall,
    ensureConnected,
    cleanup,
    send,
    retry,
    recall,
    loadOlder,
  };
}
