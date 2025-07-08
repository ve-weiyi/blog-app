import { useDateFormat } from "@vueuse/core";

export function formatDate(date: number | string | Date, format = "YYYY-MM-DD") {
  if (!date) {
    return "";
  }
  // 检查是否为字符串
  if (typeof date === "number") {
    if (isSecondTimestamp(date)) {
      date = date * 1000;
    }

    const dateTime = new Date(date);
    return formatDate(dateTime, format);
  }

  const formatted = useDateFormat(date, format);
  return formatted.value;
}

export function formatDateTime(date: number | string | Date, format = "YYYY-MM-DD HH:mm:ss") {
  return formatDate(date, format);
}

function isSecondTimestamp(ts: number): boolean {
  return ts.toString().length === 10;
}

function isMillisecondTimestamp(ts: number): boolean {
  return ts.toString().length === 13;
}
