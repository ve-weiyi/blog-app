import { defineMock } from "./base";

const baseTime = 1700000000000;

const ok = (data: unknown) => ({ code: "SUCCESS", data, message: "ok" });

/** 文章预览 */
const mockPreviews = [
  {
    id: 1,
    article_cover: "",
    article_title: "Vue3 组合式 API 实践",
    like_count: 12,
    view_count: 340,
    created_at: baseTime,
  },
  {
    id: 2,
    article_cover: "",
    article_title: "Go 并发模式笔记",
    like_count: 5,
    view_count: 120,
    created_at: baseTime,
  },
];

/** 文章详情 */
const mockArticles = [
  {
    id: 1,
    article_cover: "",
    article_title: "Vue3 组合式 API 实践",
    article_content: "<p>模拟正文</p>",
    article_type: 1,
    original_url: "",
    is_top: 1,
    status: 1,
    created_at: baseTime,
    updated_at: baseTime,
    category_name: "技术",
    tag_name_list: ["Vue", "前端"],
    like_count: 12,
    view_count: 340,
  },
];

const mockCategories = [
  { id: 1, category_name: "技术", article_count: 32, created_at: baseTime, updated_at: baseTime },
  { id: 2, category_name: "生活", article_count: 18, created_at: baseTime, updated_at: baseTime },
];

const mockTags = [
  { id: 1, tag_name: "Vue", article_count: 12, created_at: baseTime, updated_at: baseTime },
  { id: 2, tag_name: "Go", article_count: 8, created_at: baseTime, updated_at: baseTime },
];

export default defineMock([
  // 静态路径需排在 :id 之前，否则会被参数路由匹配走
  { url: "articles/archived", method: ["GET"], body: ok({ list: mockPreviews, total: mockPreviews.length }) },
  { url: "articles/recommended", method: ["GET"], body: ok({ list: mockPreviews, total: mockPreviews.length }) },
  { url: "articles/:id", method: ["GET"], body: ok(mockArticles[0]) },
  { url: "articles/:id/like", method: ["POST"], body: ok({}) },
  { url: "articles", method: ["GET"], body: ok({ list: mockPreviews, total: mockPreviews.length }) },

  { url: "categories", method: ["GET"], body: ok({ list: mockCategories, total: mockCategories.length }) },
  { url: "tags", method: ["GET"], body: ok({ list: mockTags, total: mockTags.length }) },
]);
