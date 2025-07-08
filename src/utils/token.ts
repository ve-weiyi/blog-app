export function clearStorage() {
  // localStorage.clear();

  // TerminalId 不能清理，否则会使接口调用失败
  localStorage.removeItem(TokenKey);
  localStorage.removeItem(UidKey);
}

const TokenKey: string = "Token";

export function getToken() {
  return localStorage.getItem(TokenKey);
}

// 本地运行记得删除domain
export function setToken(token: string) {
  // 项目线上部署可以取消注释
  return localStorage.setItem(TokenKey, token);
}

const UidKey: string = "Uid";

export function getUid() {
  return localStorage.getItem(UidKey);
}

export function setUid(uid: string) {
  return localStorage.setItem(UidKey, uid);
}

const TerminalIdKey: string = "TerminalId";

export function getTerminalId() {
  return localStorage.getItem(TerminalIdKey);
}

export function setTerminalId(tid: string) {
  return localStorage.setItem(TerminalIdKey, tid);
}
