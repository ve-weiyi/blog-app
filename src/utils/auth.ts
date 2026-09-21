/**
 * 应用名称
 */
export const APP_NAME = "blog-web";

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  UID: `${APP_NAME}:auth:uid`,
  TOKEN: `${APP_NAME}:auth:token`,
  DEVICE_ID: `${APP_NAME}:auth:device_id`,
  REFRESH_TOKEN: `${APP_NAME}:auth:refresh_token`,
  REFRESH_EXPIRES_AT: `${APP_NAME}:auth:refresh_expires_at`,
} as const;

/**
 * 本地凭证与偏好的读写
 */
export const AuthStorage = {
  getUid() {
    return localStorage.getItem(STORAGE_KEYS.UID);
  },
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  getAccessToken() {
    return this.getToken();
  },
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  getRefreshExpiresAt(): number {
    const v = localStorage.getItem(STORAGE_KEYS.REFRESH_EXPIRES_AT);
    return v ? Number(v) : 0;
  },
  setTokens(uid: string, accessToken: string, refreshToken?: string, refreshExpiresAt?: number) {
    localStorage.setItem(STORAGE_KEYS.UID, uid);
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (refreshExpiresAt) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_EXPIRES_AT, String(refreshExpiresAt));
    }
  },
  getDeviceId() {
    return localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  },
  setDeviceId(did: string) {
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, did);
  },
  clearAuth() {
    localStorage.clear();
  },
};
