interface AppState {
  /** 侧边栏展开 */
  isCollapse: boolean;
  /** 搜索框 */
  searchFlag: boolean;
  /** 登录框 */
  loginFlag: boolean;
  /** 注册框 */
  registerFlag: boolean;
  /** 忘记密码框 */
  forgetFlag: boolean;
  /** 邮箱登录弹框 */
  emailLoginFlag: boolean;
  /** 手机登录弹框 */
  phoneLoginFlag: boolean;
  /** 邮箱绑定弹框 */
  emailBindFlag: boolean;
  /** 手机号绑定弹框 */
  phoneBindFlag: boolean;
  /** 第三方账号绑定弹框 */
  thirdBindFlag: boolean;

  /** 左侧展开 */
  sideFlag: boolean;
}

export const useAppStore = defineStore("useAppStore", {
  state: (): AppState => ({
    isCollapse: false,
    searchFlag: false,
    loginFlag: false,
    registerFlag: false,
    forgetFlag: false,
    emailLoginFlag: false,
    phoneLoginFlag: false,
    emailBindFlag: false,
    phoneBindFlag: false,
    thirdBindFlag: false,
    sideFlag: false,
  }),
  actions: {
    setCollapse(flag: boolean) {
      this.isCollapse = flag;
    },
    setSearchFlag(flag: boolean) {
      this.searchFlag = flag;
    },
    setLoginFlag(flag: boolean) {
      this.loginFlag = flag;
    },
    setRegisterFlag(flag: boolean) {
      this.registerFlag = flag;
    },
    setForgetFlag(flag: boolean) {
      this.forgetFlag = flag;
    },
    setEmailLoginFlag(flag: boolean) {
      this.emailLoginFlag = flag;
    },
    setPhoneLoginFlag(flag: boolean) {
      this.phoneLoginFlag = flag;
    },
    setEmailBindFlag(flag: boolean) {
      this.emailBindFlag = flag;
    },
    setPhoneBindFlag(flag: boolean) {
      this.phoneBindFlag = flag;
    },
    setThirdBindFlag(flag: boolean) {
      this.thirdBindFlag = flag;
    }
  },
  getters: {},
  persist: {
    key: "app",
    storage: sessionStorage,
  },
});
