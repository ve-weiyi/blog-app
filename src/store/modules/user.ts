import { clearStorage, getToken, setToken, setUid } from "@/utils/token";
import { getUserInfoApi, getUserLikeApi } from "@/api/user";
import { loginApi, logoutApi, oauthLoginApi } from "@/api/auth";
import type { EmptyResp, LoginReq, LoginResp, OauthLoginReq, UserInfoResp, UserLikeResp } from "@/api/types";

/**
 * 用户
 */
interface UserState {
  userInfo: UserInfoResp;
  userLike: UserLikeResp;
}

export const useUserStore = defineStore("useUserStore", {
  state: (): UserState => <UserState>({
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
  }),
  actions: {
    oauthLogin(oauth: OauthLoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        oauthLoginApi(oauth)
          .then((res) => {
            const token = res.data.token;
            setUid(String(token.user_id));
            setToken(token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    login(user: LoginReq): Promise<IApiResponse<LoginResp>> {
      return new Promise((resolve, reject) => {
        loginApi(user)
          .then((res) => {
            const token = res.data.token;
            setUid(String(token.user_id));
            setToken(token.access_token);
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout(): Promise<IApiResponse<EmptyResp>> {
      return new Promise((resolve, reject) => {
        logoutApi()
          .then((res) => {
            this.forceLogOut();
            clearStorage();
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getUserInfo(): Promise<IApiResponse<UserInfoResp>> {
      if (!this.isLogin()) {
        return;
      }
      return new Promise((resolve, reject) => {
        getUserInfoApi()
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
        return;
      }
      return new Promise((resolve, reject) => {
        getUserLikeApi()
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
        clearStorage();
        resolve();
      });
    },

    isLogin() {
      const tk = getToken();
      // console.log("isLogin", tk != undefined);
      return tk != undefined;
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
