import { formatDateTime } from "@/utils/date";
import { HEADER_GAP_MS, MESSAGE_STATUS, type ChatMessageEvent } from "./types";

/** created_at 可能是秒或毫秒时间戳，统一换算成毫秒后再比较与展示。 */
export function toMillis(timestamp: number) {
  return String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dateKey(timestamp: number) {
  const date = new Date(toMillis(timestamp));
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function senderKey(chat: ChatMessageEvent) {
  return chat.user_id || chat.device_id;
}

/** 是否需要在两条消息之间插入日期分隔符。 */
export function showDate(list: ChatMessageEvent[], index: number) {
  const current = list[index];
  const previous = list[index - 1];
  return !previous || dateKey(previous.created_at) !== dateKey(current.created_at);
}

export function dateLabel(timestamp: number) {
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(toMillis(timestamp)))) / (24 * 60 * 60 * 1000)
  );
  if (days === 0) {
    return "今天";
  }
  if (days === 1) {
    return "昨天";
  }
  return formatDateTime(timestamp, "YYYY年M月D日");
}

/** 同一发送者 5 分钟内的连续消息合并为一组，省略头像与昵称。 */
export function showHeader(list: ChatMessageEvent[], index: number) {
  const current = list[index];
  const previous = list[index - 1];
  if (!previous || showDate(list, index)) {
    return true;
  }
  return (
    senderKey(previous) !== senderKey(current) ||
    toMillis(current.created_at) - toMillis(previous.created_at) > HEADER_GAP_MS
  );
}

export function isRecalled(chat: ChatMessageEvent) {
  return chat.status === MESSAGE_STATUS.RECALLED || chat.status === MESSAGE_STATUS.DELETED;
}

export function recalledText(chat: ChatMessageEvent) {
  return chat.status === MESSAGE_STATUS.DELETED ? "[消息已删除]" : "[消息已撤回]";
}
