import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

/**
 * 助手正文的 Markdown 渲染。
 *
 * html: false 让原始 HTML 直接转义；渲染结果再用 DOMPurify 过一遍白名单，
 * 避免模型输出把任意标签带进页面。外链统一新窗口打开。
 */
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const renderLinkOpen = markdown.renderer.rules.link_open;
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index].attrSet("target", "_blank");
  tokens[index].attrSet("rel", "noopener noreferrer");
  if (renderLinkOpen) {
    return renderLinkOpen(tokens, index, options, env, self);
  }
  return self.renderToken(tokens, index, options);
};

export function renderMarkdown(content: string): string {
  if (!content) {
    return "";
  }
  // 禁止远程图片：模型输出一张外链图片就是一次无需点击的 IP/UA 上报
  return DOMPurify.sanitize(markdown.render(content), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["img"],
  });
}
