import { defineStore } from "pinia";
import { NotificationAPI } from "@/api";
import { AuthStorage } from "@/utils/auth";
import { useNotificationStream, type NotificationStream } from "@/composables/useNotificationStream";

interface NotificationState {
  /** 未读分组数 */
  total: number;
  /** 按偏好分组的未读分组数 */
  groupCounts: Record<string, number>;
  /** 实时信号连接 */
  stream: NotificationStream | null;
}

/**
 * 通知未读数与实时信号
 *
 * 未读数由服务端派生，客户端只负责取回与展示；信号丢失由定时/连上补拉兜底，
 * 所以这里没有本地加减计数，避免与服务端漂移。
 */
export const useNotificationStore = defineStore("useNotificationStore", {
  state: (): NotificationState => ({
    total: 0,
    groupCounts: {},
    stream: null,
  }),

  actions: {
    /** 拉取未读数；未登录时清零 */
    async fetchUnread() {
      if (!AuthStorage.getToken()) {
        this.total = 0;
        this.groupCounts = {};
        return;
      }
      try {
        const { data } = await NotificationAPI.getUnreadCount();
        this.total = data.total ?? 0;
        this.groupCounts = data.group_counts ?? {};
      } catch {
        // 拉取失败不清零：保留上一次的值比闪回 0 更不打扰用户
      }
    },

    /** 建立实时信号；重复调用无副作用 */
    startStream() {
      if (this.stream || !AuthStorage.getToken()) {
        return;
      }
      this.stream = useNotificationStream(() => {
        void this.fetchUnread();
      });
      this.stream.start();
    },

    /** 断开实时信号；退出登录时调用 */
    stopStream() {
      this.stream?.stop();
      this.stream = null;
    },

    /** 按当前登录态对齐：登录了就拉未读并连信号，退出就清空 */
    sync() {
      if (AuthStorage.getToken()) {
        void this.fetchUnread();
        this.startStream();
        return;
      }
      this.reset();
    },

    /** 退出登录时重置 */
    reset() {
      this.stopStream();
      this.total = 0;
      this.groupCounts = {};
    },
  },
});
