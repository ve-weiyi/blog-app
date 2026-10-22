import { defineMock } from "./base";

const MOCK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23409eff'/%3E%3Ctext x='20' y='27' font-size='20' font-family='sans-serif' text-anchor='middle' fill='%23fff'%3EU%3C/text%3E%3C/svg%3E";

const baseTime = 1700000000000;

const ok = (data: unknown) => ({ code: "SUCCESS", data, message: "ok" });

const mockGuestInfo = {
  device_id: "mock-device-id",
  os: "macOS",
  browser: "Chrome",
  ip_address: "127.0.0.1",
  ip_source: "本地",
};

const mockUserInfo = {
  user_id: "00000000-0000-0000-0000-000000000001",
  username: "visitor",
  avatar: MOCK_AVATAR,
  nickname: "访客",
  user_type: "user",
};

const mockComments = [
  {
    id: 1,
    user_id: mockUserInfo.user_id,
    device_id: "mock-device-id",
    topic_id: 1,
    parent_id: 0,
    reply_id: 0,
    reply_user_id: "",
    comment_content: "写得很清楚，学到了。",
    status: 1,
    type: 1,
    created_at: baseTime,
    like_count: 3,
    guest_info: mockGuestInfo,
    user_info: mockUserInfo,
    reply_user_info: mockUserInfo,
    reply_count: 1,
    comment_reply_list: [],
  },
];

const mockReplies = [
  {
    id: 2,
    user_id: mockUserInfo.user_id,
    device_id: "mock-device-id",
    topic_id: 1,
    parent_id: 1,
    reply_id: 1,
    reply_user_id: mockUserInfo.user_id,
    comment_content: "同感。",
    status: 1,
    type: 1,
    created_at: baseTime,
    like_count: 0,
    guest_info: mockGuestInfo,
    user_info: mockUserInfo,
    reply_user_info: mockUserInfo,
  },
];

const mockMessages = [
  {
    id: 1,
    user_id: mockUserInfo.user_id,
    device_id: "mock-device-id",
    message_content: "欢迎来到留言板。",
    status: 1,
    created_at: baseTime,
    updated_at: baseTime,
    user_info: mockUserInfo,
  },
];

const mockTalks = [
  {
    id: 1,
    user_id: mockUserInfo.user_id,
    content: "今天天气不错。",
    img_list: [],
    is_top: 0,
    status: 1,
    like_count: 2,
    comment_count: 0,
    created_at: baseTime,
    updated_at: baseTime,
    user_info: mockUserInfo,
  },
];

export default defineMock([
  // 静态路径需排在 :id 之前
  { url: "comments/recent", method: ["GET"], body: ok({ list: mockComments, total: mockComments.length }) },
  { url: "comments/:comment_id/replies", method: ["GET"], body: ok({ list: mockReplies, total: mockReplies.length }) },
  { url: "comments/:id/like", method: ["POST"], body: ok({}) },
  { url: "comments/:id", method: ["PUT"], body: ok({}) },
  { url: "comments", method: ["GET"], body: ok({ list: mockComments, total: mockComments.length }) },
  { url: "comments", method: ["POST"], body: ok(mockComments[0]) },

  { url: "messages", method: ["GET"], body: ok({ list: mockMessages, total: mockMessages.length }) },
  { url: "messages", method: ["POST"], body: ok(mockMessages[0]) },

  { url: "talks/:id", method: ["GET"], body: ok(mockTalks[0]) },
  { url: "talks/:id/like", method: ["POST"], body: ok({}) },
  { url: "talks", method: ["GET"], body: ok({ list: mockTalks, total: mockTalks.length }) },
]);
