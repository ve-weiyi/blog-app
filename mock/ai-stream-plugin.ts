import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";

/**
 * AI 助手的预览用流式 mock。
 *
 * vite-plugin-mock-dev-server 只能返回一次性响应，无法逐帧输出 SSE，因此这里用
 * 一个 Vite 中间件模拟 `/api/v1/ai/*`。只在 VITE_MOCK_DEV_SERVER=true 时挂载，
 * 不会进入生产构建。
 *
 * 触发约定（方便手动验证不同状态）：
 * - 问题里含「错误」→ 返回 error 事件
 * - 问题里含「无结果」→ 返回零引用 + 固定文案，模拟未命中
 * - 其余 → 正常的检索 + 流式回答
 */
const CHAT_STREAM_PATH = "/api/v1/ai/chat/stream";
const QUOTA_PATH = "/api/v1/ai/quota";

const ANSWER = `这个博客主要写 **技术笔记** 和日常随笔。

- 它基于 Vue 3 与 Go 构建
- 文章、标签与留言都围绕个人记录展开
- 你可以在文章页直接留言交流`;

const CITATIONS = [
  { article_id: 1, title: "如何搭建这个博客", url: "/article/1", summary: "站点搭建过程的记录" },
  { article_id: 2, title: "近期随笔", url: "/article/2", summary: "日常记录与思考" },
];

export function aiStreamMockPlugin(): Plugin {
  return {
    name: "blog-ai-stream-mock",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(handle);
    },
  };
}

function handle(req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) {
  const path = (req.url ?? "").split("?")[0];

  if (req.method === "GET" && path === QUOTA_PATH) {
    writeJSON(res, { code: "SUCCESS", message: "", data: { daily_quota: 20, used: 2, remaining: 18 } });
    return;
  }

  if (req.method === "POST" && path === CHAT_STREAM_PATH) {
    readBody(req)
      .then((raw) => streamChat(res, raw))
      .catch(() => {
        if (!res.headersSent) {
          res.statusCode = 400;
          res.end();
        }
      });
    return;
  }

  next();
}

async function streamChat(res: ServerResponse, raw: string) {
  let message = "";
  try {
    message = String((JSON.parse(raw) as { message?: string }).message ?? "");
  } catch {
    // 忽略非法 JSON，按空问题处理
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  let closed = false;
  res.on("close", () => {
    closed = true;
  });
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const send = async (event: unknown, delay = 80) => {
    if (closed) {
      return false;
    }
    await sleep(delay);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    return !closed;
  };

  await send({ type: "meta", session_id: 0, guest: true, quota_left: 18 }, 0);
  await send({
    type: "tool",
    tool: { name: "search_articles", phase: "started", label: "检索站内文章" },
  });

  if (message.includes("错误")) {
    await send({ type: "error", code: "upstream_error", message: "AI 服务暂时不可用，请稍后重试" }, 200);
    res.end();
    return;
  }

  if (message.includes("无结果")) {
    await send({
      type: "tool",
      tool: { name: "search_articles", phase: "completed", summary: "命中 0 篇文章", articles: [] },
    });
    await send({ type: "delta", content: "站内没有找到相关内容。" });
    await send({ type: "done", usage: { prompt_tokens: 0, completion_tokens: 0 } });
    res.end();
    return;
  }

  await send({
    type: "tool",
    tool: {
      name: "search_articles",
      phase: "completed",
      summary: `命中 ${CITATIONS.length} 篇文章`,
      articles: CITATIONS,
    },
  });

  // 按 2-4 个字符切分，模拟逐 token 输出
  for (let i = 0; i < ANSWER.length; ) {
    const size = 2 + Math.floor(Math.random() * 3);
    const chunk = ANSWER.slice(i, i + size);
    i += size;
    if (!(await send({ type: "delta", content: chunk }, 45))) {
      return;
    }
  }

  await send({ type: "done", usage: { prompt_tokens: 128, completion_tokens: 46 } }, 120);
  res.end();
}

function writeJSON(res: ServerResponse, body: unknown) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}
