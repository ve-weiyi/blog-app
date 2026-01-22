import { router } from "@/router";
import { useUserStore } from "@/store";
import NProgress from "nprogress";
import { AuthAPI } from "@/api/auth.ts";
import { AuthStorage } from "@/utils/auth.ts";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 获取客户端信息
const getClientInfo = async (): Promise<void> => {
  try {
    const res = await AuthAPI.getClientInfoApi();
    AuthStorage.setTerminalId(res.data.terminal_id);
  } catch {
    window.$message?.warning("获取客户端信息失败");
  }
};

router.beforeEach(async (to, from, next) => {
  if (!AuthStorage.getTerminalId()) {
    await getClientInfo();
  }
  next();
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  if (AuthStorage.getToken()) {
    const userStore = useUserStore();
    if (userStore.userInfo.user_id === undefined) {
      userStore
        .getUserInfo()
        .then((res) => {
          next();
        })
        .catch(() => {
          userStore.logout().then(() => {
            window.$message?.warning("凭证失效，请重新登录");
            next();
          });
        });
    } else {
      next();
    }
  } else {
    next();
  }
});
router.afterEach(() => {
  NProgress.done();
});
