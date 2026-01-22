import { AuthStorage } from "@/utils/auth.ts";
import { UserAPI } from "@/api/user";
import { AuthAPI } from "@/api/auth";
import type {
  EmailLoginReq,
  EmptyResp,
  LoginReq,
  LoginResp,
  PhoneLoginReq,
  ThirdLoginReq,
  UserInfoResp,
  UserLikeResp,
} from "@/api/types";

/**
 * 用户
 */
interface UserState {
  userInfo: UserInfoResp;
  userLike: UserLikeResp;
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
      },
      userLike: {
        article_like_set: [],
        comment_like_set: [],
        talk_like_set: [],
      },
    },
  actions: {
    login(loginData: LoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.loginApi(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    emailLogin(loginData: EmailLoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.emailLoginApi(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    phoneLogin(loginData: PhoneLoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.phoneLoginApi(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    thirdLogin(loginData: ThirdLoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.thirdLoginApi(loginData)
          .then((res) => {
            AuthStorage.setTokens(res.data.user_id, res.data.token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout(): Promise<IApiResponse<EmptyResp>> {
      return new Promise((resolve, reject) => {
        AuthAPI.logoutApi()
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
    getUserInfo(): Promise<IApiResponse<UserInfoResp>> {
      if (!this.isLogin()) {
        return Promise.reject("未登录");
      }
      return new Promise((resolve, reject) => {
        UserAPI.getUserInfoApi()
          .then((res) => {
            this.userInfo = res.data;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getUserLike(): Promise<IApiResponse<UserLikeResp>> {
      if (!this.isLogin()) {
        return Promise.reject("未登录");
      }
      return new Promise((resolve, reject) => {
        UserAPI.getUserLikeApi()
          .then((res) => {
            this.userLike = res.data;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
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
    articleLike(articleId: number) {
      const articleLikeSet = this.userLike.article_like_set;
      if (articleLikeSet.indexOf(articleId) != -1) {
        articleLikeSet.splice(articleLikeSet.indexOf(articleId), 1);
      } else {
        articleLikeSet.push(articleId);
      }
    },
    commentLike(commentId: number) {
      const commentLikeSet = this.userLike.comment_like_set;
      if (commentLikeSet.indexOf(commentId) != -1) {
        commentLikeSet.splice(commentLikeSet.indexOf(commentId), 1);
      } else {
        commentLikeSet.push(commentId);
      }
    },
    talkLike(talkId: number) {
      const talkLikeSet = this.userLike.talk_like_set;
      if (talkLikeSet.indexOf(talkId) != -1) {
        talkLikeSet.splice(talkLikeSet.indexOf(talkId), 1);
      } else {
        talkLikeSet.push(talkId);
      }
    },
    isArticleLike(articleId: number) {
      return this.userLike.article_like_set.indexOf(articleId) != -1;
    },
    isCommentLike(commentId: number) {
      return this.userLike.comment_like_set.indexOf(commentId) != -1;
    },
    isTalkLike(talkId: number) {
      return this.userLike.talk_like_set.indexOf(talkId) != -1;
    },
  },
  getters: {},
  persist: {
    key: "user",
    storage: sessionStorage,
  },
});
