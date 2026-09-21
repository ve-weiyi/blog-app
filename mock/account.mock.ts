import { defineMock } from "./base";

/** 模拟验证码，生成可读的 SVG 图片便于开发态登录 */
const MOCK_CAPTCHA_CODE = "1234";

const mockCaptchaImage = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
     <rect width="120" height="40" fill="#f2f3f5"/>
     <text x="60" y="27" font-size="20" font-family="monospace" text-anchor="middle" fill="#303133">${MOCK_CAPTCHA_CODE}</text>
   </svg>`
)}`;

const MOCK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23409eff'/%3E%3Ctext x='20' y='27' font-size='20' font-family='sans-serif' text-anchor='middle' fill='%23fff'%3EA%3C/text%3E%3C/svg%3E";


const mockToken = {
  token_type: "Bearer",
  access_token: "mock-access-token",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  refresh_expires_in: 604800,
  refresh_expires_at: Math.floor(Date.now() / 1000) + 604800,
};

const mockLoginResp = {
  user_id: "00000000-0000-0000-0000-000000000001",
  user_type: "user",
  scope: "app",
  token: mockToken,
};

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

const mockProfile = {
  ...mockGuestInfo,
  user_info: mockUserInfo,
  guest_info: mockGuestInfo,
  third_party: [],
};

export default defineMock([
  {
    url: "auth/captchas",
    method: ["GET"],
    body: {
      code: "SUCCESS",
      data: {
        captcha_key: "mock-captcha-key",
        captcha_base64: mockCaptchaImage,
        captcha_code: MOCK_CAPTCHA_CODE,
      },
      message: "ok",
    },
  },

  { url: "auth/login-by-password", method: ["POST"], body: { code: "SUCCESS", data: mockLoginResp, message: "ok" } },
  { url: "auth/login-by-email", method: ["POST"], body: { code: "SUCCESS", data: mockLoginResp, message: "ok" } },
  { url: "auth/login-by-mobile", method: ["POST"], body: { code: "SUCCESS", data: mockLoginResp, message: "ok" } },

  {
    // 第三方登录按平台建模为子资源
    url: "auth/oauth/:platform/authorize",
    method: ["GET"],
    body: { code: "SUCCESS", data: { authorize_url: "https://example.com/oauth/authorize" }, message: "ok" },
  },
  { url: "auth/oauth/:platform/login", method: ["POST"], body: { code: "SUCCESS", data: mockLoginResp, message: "ok" } },

  { url: "auth/refresh-token", method: ["POST"], body: { code: "SUCCESS", data: mockLoginResp, message: "ok" } },
  { url: "auth/register", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "auth/password-resets", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "auth/session", method: ["DELETE"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "auth/email-verification-codes", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "auth/mobile-verification-codes", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },

  {
    url: "guests/current",
    method: ["GET"],
    body: { code: "SUCCESS", data: { id: 1, ...mockGuestInfo }, message: "ok" },
  },

  { url: "me/profile", method: ["GET"], body: { code: "SUCCESS", data: mockProfile, message: "ok" } },
  { url: "me/profile", method: ["PUT"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  {
    url: "me/likes",
    method: ["GET"],
    body: {
      code: "SUCCESS",
      data: { article_like_set: [1], comment_like_set: [1], talk_like_set: [1] },
      message: "ok",
    },
  },
  { url: "me/bind-email", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "me/bind-mobile", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "me/bind-third-party", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "me/unbind-third-party", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "me/deactivate", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
  { url: "me/reactivate", method: ["POST"], body: { code: "SUCCESS", data: {}, message: "ok" } },
]);
