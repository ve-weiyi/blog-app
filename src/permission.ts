import { router } from "@/router";
import { useUserStore } from "@/store";
import { getToken } from "@/utils/token";
import NProgress from "nprogress";
import { getUserInfoApi } from "@/api/user";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  const userStore = useUserStore();
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  if (getToken()) {
    if (userStore.userInfo.user_id === undefined) {
      userStore.getUserInfo()
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
