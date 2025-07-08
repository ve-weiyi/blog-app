import { router } from "@/router";
import { useUserStore } from "@/store";
import { getTerminalId, getToken, setTerminalId } from "@/utils/token";
import NProgress from "nprogress";
import { AuthAPI } from "@/api/auth.ts";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 获取游客ID
router.beforeEach((to, from, next) => {
  if (!getTerminalId()) {
    AuthAPI.getTouristInfoApi()
      .then((res) => {
        setTerminalId(res.data.tourist_id);
        next();
      })
      .catch(() => {
        window.$message?.warning("获取游客ID失败");
        next();
      });
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  if (getToken()) {
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
