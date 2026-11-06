import type { App } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { useNotificationStore } from "@/stores";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  //滚动行为
  scrollBehavior(to, from, savedPosition) {
    // to：即将进入的路由对象
    // from：当前导航正要离开的路由对象
    // savedPosition：上次记录的滚动位置
    // 默认行为，如果有记录的滚动位置，则恢复到该位置
    if (savedPosition) {
      return savedPosition;
    }
    // 没有记录的滚动位置，则滚动到页面顶部
    return { top: 0 };
  },
});

// 登录态只存在本地存储里，路由跳转是唯一能同时覆盖登录与退出的时机：
// 每次导航后对齐一次未读与信号连接，避免登录后收不到推送。
router.afterEach(() => {
  useNotificationStore().sync();
});

/** setup vue router. - [安装vue路由] */
export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
