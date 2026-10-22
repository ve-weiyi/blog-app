import { router } from "@/router";
import { useUserStore } from "@/stores";
import NProgress from "nprogress";
import { GuestAPI } from "@/api";
import { AuthStorage } from "@/utils/auth.ts";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 获取游客信息
const getGuestInfo = async (): Promise<boolean> => {
  try {
    const res = await GuestAPI.getGuest();
    AuthStorage.setDeviceId(res.data.device_id);
    return true;
  } catch {
    window.$message?.warning("获取游客信息失败");
    return false;
  }
};

const GUEST_BOOTSTRAP_KEY = "blog-web:guest:bootstrapped";

const hasBootstrapped = (): boolean => {
  try {
    return sessionStorage.getItem(GUEST_BOOTSTRAP_KEY) === "1";
  } catch {
    return false;
  }
};

const markBootstrapped = (): void => {
  try {
    sessionStorage.setItem(GUEST_BOOTSTRAP_KEY, "1");
  } catch {
    // sessionStorage 不可用时按未引导处理
  }
};

// vue-router 5 起守卫不再接收 next()，改为返回布尔值放行
router.beforeEach(async () => {
  const stored = AuthStorage.getDeviceId();
  if (stored) {
    if (!hasBootstrapped()) {
      // 已有本地标识：后台补一次，确保 Cookie 与服务端属性同步，不阻塞导航
      void getGuestInfo().then((ok) => {
        if (ok) markBootstrapped();
      });
    }
    return true;
  }

  // 首次访问或本地标识丢失：必须等到签发完成再继续
  if (await getGuestInfo()) {
    markBootstrapped();
  }
  return true;
});

router.beforeEach(async (to) => {
  NProgress.start();
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  if (!AuthStorage.getToken()) {
    return true;
  }
  const userStore = useUserStore();
  // user_id 为空串表示尚未拉取过用户信息（初始值即空串，见 stores/modules/user.ts）
  if (userStore.userInfo.user_id) {
    return true;
  }
  try {
    await userStore.getUserInfo();
  } catch {
    // 退出请求自身也会带着失效凭证失败，不能让它中断本次导航
    try {
      await userStore.logout();
    } catch {
      await userStore.forceLogOut();
    }
    window.$message?.warning("凭证失效，请重新登录");
  }
  return true;
});
router.afterEach(() => {
  NProgress.done();
});
