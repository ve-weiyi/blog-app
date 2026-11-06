import { emojiList } from "@/utils/emoji";
import { tvList } from "@/utils/tv";

export type ChatContentPart =
  { type: "text"; text: string } | { type: "emoji"; src: string; alt: string };

// 只匹配短标记，避免用户输入的长方括号文本被当作表情
const TOKEN_PATTERN = /\[[^[\]]{1,20}\]/g;

/**
 * 把聊天正文拆成文本与表情。
 *
 * 聊天内容是用户输入，渲染时绝不能走 v-html：即使后端没做清洗，
 * 这里也只会生成文本节点与来自本地表情表的 img，HTML 永远不进入 DOM。
 */
export function parseChatContent(content: string): ChatContentPart[] {
  if (!content) {
    return [];
  }

  const parts: ChatContentPart[] = [];
  let last = 0;

  for (const match of content.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const src = emojiList[token] ?? tvList[token];
    if (!src) {
      continue;
    }

    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: "text", text: content.slice(last, index) });
    }
    parts.push({ type: "emoji", src, alt: token });
    last = index + token.length;
  }

  if (last < content.length) {
    parts.push({ type: "text", text: content.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", text: content }];
}
