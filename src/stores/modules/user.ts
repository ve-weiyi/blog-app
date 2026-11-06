import { AuthStorage } from "@/utils/auth.ts";
import { MeAPI, AuthAPI } from "@/api";
import type {
  EmailLoginReq,
  EmptyResp,
  OauthLoginReq,
  PasswordLoginReq,
  MobileLoginReq,
  LoginResp,
  GetMeResp,
} from "@/api";

/**
 * 用户
 */
interface UserState {
  userInfo: GetMeResp;
}

// 多个并发请求遇到 token 过期时，共享同一次 refresh 请求
let refreshPromise: Promise<void> | null = null;

async function doRefreshToken(): Promise<void> {
  const currentRefreshToken = AuthStorage.getRefreshToken();

  if (!currentRefreshToken) {
    throw new Error("没有有效的刷新令牌");
  }

  const res = await AuthAPI.refreshToken({
    user_id: AuthStorage.getUid() ?? "",
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
  });

  const token = res.data?.token;
  if (!token || !token.access_token) {
    throw new Error("令牌刷新失败");
  }

  AuthStorage.setTokens(
    res.data.user_id ?? "",
    token.access_token,
    token.refresh_token ?? "",
    token.refresh_expires_at ?? 0
  );
}

export const useUserStore = defineStore("useUserStore", {
  state: (): UserState =>
    <UserState>{
      userInfo: {
        user_id: "",
        username: "",
        nickname: "",
        avatar: "",
        intro: "",
        website: "",
        email: "",
        mobile: "",
        status: 0,
        plan: "",
        balance: 0,
        coin: 0,
        created_at: 0,
        third_party: [],
      },
    },
  actions: {
    login(loginData: PasswordLoginReq): Promise<ApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.passwordLogin(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token, res.data.token.refresh_token, res.data.token.refresh_expires_at);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    emailLogin(loginData: EmailLoginReq): Promise<ApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.emailLogin(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token, res.data.token.refresh_token, res.data.token.refresh_expires_at);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    mobileLogin(loginData: MobileLoginReq): Promise<ApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.mobileLogin(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token, res.data.token.refresh_token, res.data.token.refresh_expires_at);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    thirdLogin(loginData: OauthLoginReq): Promise<ApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.oauthLogin(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token, res.data.token.refresh_token, res.data.token.refresh_expires_at);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout(): Promise<ApiResponse<EmptyResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.logout()
          .then((res) => {
            this.forceLogOut();
            AuthStorage.clearAuth()
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getUserInfo(): Promise<ApiResponse<GetMeResp>> {
      if (!this.isLogin()) {
        return Promise.reject("未登录");
      }
      return new Promise((resolve, reject) => {
        MeAPI.getMe()
          .then((res) => {
            this.userInfo = res.data;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    refreshTokenOnce(): Promise<void> {
      if (refreshPromise) return refreshPromise;

      refreshPromise = doRefreshToken().finally(() => {
        refreshPromise = null;
      });

      return refreshPromise;
    },
    forceLogOut() {
      return new Promise<void>((resolve) => {
        this.$reset();
        AuthStorage.clearAuth()
        resolve();
      });
    },

    isLogin() {
      return AuthStorage.getToken() != undefined;
    },
  },
  getters: {},
  persist: {
    key: "user",
    storage: sessionStorage,
  },
});
