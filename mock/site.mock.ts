import { defineMock } from "./base";

const baseTime = 1700000000000;

const ok = (data: unknown) => ({ code: "SUCCESS", data, message: "ok" });

const mockPages = [
  {
    id: 1,
    page_name: "about",
    page_label: "关于",
    page_cover: "",
    is_carousel: 1,
    created_at: baseTime,
    updated_at: baseTime,
  },
];

const mockFriends = [
  {
    id: 1,
    link_name: "示例站点",
    link_avatar: "",
    link_address: "https://example.com",
    link_intro: "一个示例友链",
    created_at: baseTime,
    updated_at: baseTime,
  },
];

const mockWebsiteInfo = {
  website_name: "与梦",
  website_author: "与梦",
  website_avatar: "",
  website_intro: "分享个人学习记录的个人博客",
  website_notice: "欢迎来到我的博客。",
  // 侧栏「运行时长」拿它算天数，缺失会渲染成 NaN天
  website_create_time: "2023-11-15 00:00:00",
  website_record_no: "",
};

const mockWebsiteConfig = {
  admin_url: "https://admin.example.com",
  websocket_url: "ws://localhost:9420/api/v1/websocket",
  tourist_avatar: "",
  user_avatar: "",
  website_feature: {},
  website_info: mockWebsiteInfo,
  reward_qr_code: {},
  social_login_list: [],
  social_url_list: [],
};

const mockHomeInfo = {
  article_count: 42,
  category_count: 4,
  tag_count: 12,
  total_user_view_count: 12000,
  total_page_view_count: 55000,
  page_list: mockPages,
  notice_list: [],
  website_config: mockWebsiteConfig,
};

export default defineMock([
  { url: "about-me", method: ["GET"], body: ok({ content: "欢迎来到我的博客。" }) },
  { url: "friends", method: ["GET"], body: ok({ list: mockFriends, total: mockFriends.length }) },
  { url: "home", method: ["GET"], body: ok(mockHomeInfo) },
  { url: "pages", method: ["GET"], body: ok({ list: mockPages, total: mockPages.length }) },
]);
