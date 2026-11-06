/** STOMP 连接与主题配置。 */
export const WS_CONFIG = {
  RECONNECT_DELAY: 5000,
  HEARTBEAT_INCOMING: 10000,
  HEARTBEAT_OUTGOING: 10000,
  CHAT_TOPIC: "/topic/chatroom",
} as const;

export const MESSAGE_TYPES = {
  ONLINE: "online",
  HISTORY: "history",
  MESSAGE: "message",
  EDIT: "edit",
  SEND: "send",
  TEXT: "text",
  HISTORY_MORE: "history_more",
} as const;

export const MESSAGE_STATUS = {
  NORMAL: 0,
  EDITED: 1,
  RECALLED: 2,
  DELETED: 3,
} as const;

export const MESSAGES = {
  RECALLED: "[消息已撤回]",
  EMPTY_CONTENT: "内容不能为空",
  CONNECTION_CLOSED: "连接关闭",
  STOMP_ERROR: "STOMP 错误",
} as const;

/** 单条消息的最大字符数，与服务端的权威边界一致。 */
export const MAX_CONTENT_LENGTH = 1000;

/** 发送后等待服务端回显的时长，超时视为失败。 */
export const SEND_TIMEOUT_MS = 8000;

/** 拉取更早消息的等待上限，超时解除按钮的禁用态。 */
export const HISTORY_TIMEOUT_MS = 8000;

/** 同一发送者的连续消息超过这个间隔就重新显示昵称与时间。 */
export const HEADER_GAP_MS = 5 * 60 * 1000;

export interface MessageEvent {
  type: string;
  data: string;
  timestamp: number;
}

export interface ChatMessageEvent {
  id: number;
  user_id: string;
  device_id: string;
  nickname: string;
  avatar: string;
  ip_source: string;
  type: string;
  content: string;
  /** 0-正常 1-已编辑 2-已撤回 3-已删除 */
  status: number;
  created_at: number;
  updated_at: number;
  /** 发送回显：把服务端消息与本地临时消息对上 */
  client_msg_id?: string;
}

export interface UiChatMessage extends ChatMessageEvent {
  local_id?: string;
  pending?: boolean;
  failed?: boolean;
}

export interface SendMessageEvent {
  type: string;
  content: string;
  client_msg_id?: string;
}

export interface EditMessageEvent {
  id: number;
  type: string;
  content: string;
  status: number;
  updated_at: number;
}

export interface OnlineMessageEvent {
  online: boolean;
  count: number;
  tips: string;
}

export interface HistoryMessageEvent {
  list: ChatMessageEvent[];
  page: number;
  size: number;
  total: number;
  /** 服务端按原始行数判定，不按过滤掉已删除后的条数推断 */
  has_more?: boolean;
  /** 下一页游标：本页最早一条（含已删除）的 created_at */
  next_before?: number;
}
