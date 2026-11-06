import { defineMock } from "./base";
import type { NotificationGroupVO, NotificationPreferenceVO } from "@/api/types";

const now = Date.now();

let groups: NotificationGroupVO[] = [
  {
    group_key: "group-comment-1",
    scene: "content.commented",
    title: "有人评论了你的文章",
    content: "Vue3 组合式 API 实践",
    link: "/article/1",
    level: "info",
    actor_count: 2,
    latest_actor_name: "小明",
    latest_at: now - 600000,
    unread: true,
  },
  {
    group_key: "group-reply-1",
    scene: "comment.replied",
    title: "有人回复了你的评论",
    content: "说得很有道理",
    link: "/article/1",
    level: "info",
    actor_count: 1,
    latest_actor_name: "小红",
    latest_at: now - 1800000,
    unread: true,
  },
  {
    group_key: "group-like-1",
    scene: "article.liked",
    title: "你的文章收到了赞",
    content: "Go 并发模式",
    link: "/article/2",
    level: "info",
    actor_count: 5,
    latest_actor_name: "小刚",
    latest_at: now - 7200000,
    unread: false,
  },
  {
    group_key: "group-security-1",
    scene: "account.security",
    title: "账号邮箱已变更",
    content: "",
    link: "",
    level: "warning",
    actor_count: 1,
    latest_actor_name: "",
    latest_at: now - 86400000,
    unread: false,
  },
];

const preferences: NotificationPreferenceVO[] = [
  { group: "announcement", channel: "inbox", enabled: true, mandatory: true },
  { group: "announcement", channel: "email", enabled: true, mandatory: true },
  { group: "comment", channel: "inbox", enabled: true, mandatory: false },
  { group: "comment", channel: "email", enabled: true, mandatory: false },
  { group: "like", channel: "inbox", enabled: true, mandatory: false },
  { group: "like", channel: "email", enabled: false, mandatory: false },
  { group: "review", channel: "inbox", enabled: true, mandatory: false },
  { group: "review", channel: "email", enabled: true, mandatory: false },
  { group: "security", channel: "inbox", enabled: true, mandatory: true },
  { group: "security", channel: "email", enabled: true, mandatory: true },
];

const sceneGroup: Record<string, string> = {
  announcement: "announcement",
  "content.commented": "comment",
  "comment.replied": "comment",
  "comment.liked": "like",
  "article.liked": "like",
  "talk.liked": "like",
  "content.reviewed": "review",
  "account.security": "security",
};

function ok(data: unknown) {
  return { code: "SUCCESS", data, message: "ok" };
}

function fail(code: string, message: string) {
  return { code, data: {}, message };
}

function str(value: unknown): string {
  return value == null ? "" : String(value);
}

function num(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pageOf<T>(list: T[], query: Record<string, unknown>) {
  const page = Math.max(1, num(query.page, 1));
  const pageSize = Math.max(1, num(query.page_size, 20));
  const start = (page - 1) * pageSize;
  return {
    page,
    page_size: pageSize,
    total: list.length,
    list: list.slice(start, start + pageSize),
  };
}

function queryGroups(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  return str(value).split(",").filter(Boolean);
}

function groupOfScene(scene: string): string {
  return sceneGroup[scene] ?? "comment";
}

function unreadGroupCounts(list: NotificationGroupVO[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of list) {
    if (!item.unread) {
      continue;
    }
    const group = groupOfScene(item.scene);
    counts[group] = (counts[group] ?? 0) + 1;
  }
  return counts;
}

export default defineMock([
  {
    url: "notifications",
    method: ["GET"],
    body: (req) => {
      const query = req.query;
      const groupsFilter = queryGroups(query.groups);
      const unreadOnly = query.unread_only === true || str(query.unread_only) === "true";
      const list = groups.filter(
        (item) =>
          (!groupsFilter.length || groupsFilter.includes(groupOfScene(item.scene))) &&
          (!unreadOnly || item.unread)
      );
      return ok(pageOf(list, query));
    },
  },
  {
    url: "notifications/unread-count",
    method: ["GET"],
    body: () =>
      ok({
        total: groups.filter((item) => item.unread).length,
        group_counts: unreadGroupCounts(groups),
      }),
  },
  {
    url: "notifications/read",
    method: ["POST"],
    body: (req) => {
      const item = groups.find((row) => row.group_key === str(req.body.group_key));
      if (!item) {
        return ok({ success_count: 0 });
      }
      item.unread = false;
      return ok({ success_count: 1 });
    },
  },
  {
    url: "notifications/read-all",
    method: ["POST"],
    body: () => {
      const count = groups.filter((item) => item.unread).length;
      for (const item of groups) {
        item.unread = false;
      }
      return ok({ success_count: count });
    },
  },
  {
    url: "notifications/delete",
    method: ["POST"],
    body: (req) => {
      const before = groups.length;
      groups = groups.filter((item) => item.group_key !== str(req.body.group_key));
      return ok({ success_count: before - groups.length });
    },
  },
  {
    url: "notifications/preferences",
    method: ["GET"],
    body: () => ok({ list: preferences }),
  },
  {
    url: "notifications/preferences",
    method: ["PUT"],
    body: (req) => {
      const updates = Array.isArray(req.body.list) ? req.body.list : [];
      for (const update of updates) {
        const target = preferences.find(
          (item) => item.group === str(update.group) && item.channel === str(update.channel)
        );
        if (target && !target.mandatory) {
          target.enabled = Boolean(update.enabled);
        }
      }
      return ok({ list: preferences });
    },
  },
  {
    url: "notifications/unsubscribe",
    method: ["GET"],
    body: (req) => {
      const token = str(req.query.token);
      if (!token) {
        return fail("INVALID_PARAM", "链接缺少令牌");
      }
      if (token === "expired") {
        return fail("PRECONDITION_FAILED", "退订链接已过期");
      }
      return ok({ group: "comment", channel: "email" });
    },
  },
  {
    url: "notifications/unsubscribe",
    method: ["POST"],
    body: () => ok({}),
  },
  // 读者端通知信号流（SSE）：只发送心跳，保持连接不重连
  {
    url: "notifications/stream",
    method: ["GET"],
    response(_req, res) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(": ping\n\n");
      const timer = setInterval(() => res.write(": ping\n\n"), 15000);
      res.on("close", () => clearInterval(timer));
    },
  },
]);
