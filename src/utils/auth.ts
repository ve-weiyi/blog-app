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
  TERMINAL_ID: `${APP_NAME}:auth:terminal_id`,
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
  setTokens(uid: string, token: string) {
    localStorage.setItem(STORAGE_KEYS.UID, uid);
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  getTerminalId() {
    return localStorage.getItem(STORAGE_KEYS.TERMINAL_ID);
  },
  setTerminalId(tid: string) {
    localStorage.setItem(STORAGE_KEYS.TERMINAL_ID, tid);
  },
  clearAuth() {
    localStorage.clear();
  },
};
