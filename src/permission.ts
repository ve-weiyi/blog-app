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
const getGuestInfo = async (): Promise<void> => {
  try {
    const res = await GuestAPI.getGuest();
    AuthStorage.setDeviceId(res.data.device_id);
  } catch {
    window.$message?.warning("获取游客信息失败");
  }
};

// vue-router 5 起守卫不再接收 next()，改为返回布尔值放行
router.beforeEach(async () => {
  if (!AuthStorage.getDeviceId()) {
    await getGuestInfo();
  }
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
