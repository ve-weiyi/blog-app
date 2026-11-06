<template>
  <section class="notification-page">
    <header class="page-head">
      <div>
        <h1 class="page-heading">消息中心</h1>
        <p class="page-subtitle">
          {{ unreadTotal > 0 ? `${unreadTotal} 条未读消息` : "所有消息都已读" }}
        </p>
      </div>
      <n-button
        v-if="tab === 'inbox' && unreadTotal > 0"
        text
        type="primary"
        class="read-all"
        @click="handleReadAll"
      >
        全部已读
      </n-button>
    </header>

    <n-tabs v-model:value="tab" type="segment" animated class="page-tabs">
      <n-tab-pane name="inbox" tab="收件箱">
        <div class="inbox-toolbar">
          <div class="filter-pills">
            <button
              type="button"
              class="filter-pill"
              :class="{ active: !onlyUnread }"
              @click="setUnreadFilter(false)"
            >
              全部
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="{ active: onlyUnread }"
              @click="setUnreadFilter(true)"
            >
              未读
            </button>
          </div>
          <span class="list-hint">共 {{ total }} 条</span>
        </div>

        <n-skeleton v-if="loading" text :repeat="5" class="skeleton" />
        <n-empty
          v-else-if="!groups.length"
          class="empty"
          :description="onlyUnread ? '没有未读消息' : '暂无消息'"
        >
          <template #icon>
            <svg-icon icon-class="laba" size="2.5rem" />
          </template>
        </n-empty>

        <ul v-else class="notice-list">
          <li
            v-for="item in groups"
            :key="item.group_key"
            class="notice-card"
            :class="{ unread: item.unread }"
            @click="handleOpen(item)"
          >
            <div class="notice-icon" :class="`notice-icon--${sceneTone(item.scene)}`">
              <svg-icon :icon-class="sceneIcon(item.scene)" size="1.15rem" />
            </div>

            <div class="notice-body">
              <div class="notice-title-row">
                <span class="notice-title">{{ item.title }}</span>
                <span v-if="item.unread" class="unread-dot" />
              </div>
              <p v-if="item.content" class="notice-content">{{ item.content }}</p>
              <div class="notice-meta">
                <span>{{ sceneLabel(item.scene) }}</span>
                <span v-if="item.actor_count > 1">{{ item.actor_count }} 人参与</span>
                <span v-else-if="item.latest_actor_name">{{ item.latest_actor_name }}</span>
                <span>{{ formatDateTime(item.latest_at, "MM-DD HH:mm") }}</span>
              </div>
            </div>

            <n-button
              class="notice-delete"
              text
              size="small"
              @click.stop="handleDelete(item)"
            >
              删除
            </n-button>
          </li>
        </ul>

        <div v-if="total > pageSize" class="pager">
          <n-pagination
            v-model:page="page"
            :page-size="pageSize"
            :item-count="total"
            @update:page="reload"
          />
        </div>
      </n-tab-pane>

      <n-tab-pane name="preference" tab="偏好">
        <p class="hint">
          关闭「站内信」等于关闭该分组的全部渠道；安全与公告不可退订。
        </p>

        <n-skeleton v-if="prefLoading" text :repeat="4" class="skeleton" />
        <div v-else class="pref-grid">
          <section v-for="group in prefGroups" :key="group.name" class="pref-card">
            <div class="pref-card-head">
              <span class="pref-card-title">{{ group.label }}</span>
              <n-tag v-if="group.mandatory" size="small" type="warning" round>
                不可退订
              </n-tag>
            </div>

            <label v-for="ch in group.channels" :key="ch.channel" class="pref-item">
              <span class="pref-label">{{ channelLabel(ch.channel) }}</span>
              <span class="pref-control">
                <span v-if="ch.mandatory" class="locked">强制</span>
                <n-switch
                  :value="ch.enabled"
                  :disabled="ch.mandatory"
                  size="small"
                  @update:value="(v: boolean) => handleToggle(group.name, ch.channel, v)"
                />
              </span>
            </label>
          </section>
        </div>
      </n-tab-pane>
    </n-tabs>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { NotificationAPI } from "@/api";
import type { NotificationGroupVO, NotificationPreferenceVO } from "@/api";
import { useNotificationStore, useUserStore } from "@/stores";
import { formatDateTime } from "@/utils/date";

defineOptions({ name: "Notification" });

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const tab = ref<"inbox" | "preference">("inbox");
const onlyUnread = ref(false);
const loading = ref(false);
const groups = ref<NotificationGroupVO[]>([]);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const prefLoading = ref(false);
const preferences = ref<NotificationPreferenceVO[]>([]);

const sceneLabels: Record<string, string> = {
  announcement: "公告",
  "content.commented": "新评论",
  "comment.replied": "回复",
  "comment.liked": "评论获赞",
  "article.liked": "文章获赞",
  "talk.liked": "说说获赞",
  "content.reviewed": "审核",
  "account.security": "安全",
};

const groupLabels: Record<string, string> = {
  announcement: "公告",
  comment: "评论",
  like: "点赞",
  review: "审核",
  security: "安全",
};

const channelLabels: Record<string, string> = {
  inbox: "站内信",
  email: "邮件",
};

function sceneLabel(scene: string) {
  return sceneLabels[scene] ?? "通知";
}

function channelLabel(channel: string) {
  return channelLabels[channel] ?? channel;
}

const sceneIcons: Record<string, string> = {
  announcement: "trumpet",
  "content.commented": "comment",
  "comment.replied": "comment",
  "comment.liked": "heart",
  "article.liked": "heart",
  "talk.liked": "heart",
  "content.reviewed": "badge",
  "account.security": "author",
};

const sceneTones: Record<string, string> = {
  announcement: "blue",
  "content.commented": "green",
  "comment.replied": "green",
  "comment.liked": "pink",
  "article.liked": "pink",
  "talk.liked": "pink",
  "content.reviewed": "orange",
  "account.security": "red",
};

function sceneIcon(scene: string) {
  return sceneIcons[scene] ?? "laba";
}

function sceneTone(scene: string) {
  return sceneTones[scene] ?? "grey";
}

/** 未读分组数由通知 store 维护 */
const unreadTotal = computed(() => notificationStore.total);

/** 偏好按分组聚合；接口返回的是分组 × 渠道的扁平矩阵 */
const prefGroups = computed(() => {
  const map = new Map<string, NotificationPreferenceVO[]>();
  for (const item of preferences.value) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return [...map.entries()].map(([name, channels]) => ({
    name,
    label: groupLabels[name] ?? name,
    channels,
    mandatory: channels.some((channel) => channel.mandatory),
  }));
});

async function reload() {
  if (!userStore.isLogin()) {
    groups.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const { data } = await NotificationAPI.queryNotificationList({
      page: page.value,
      page_size: pageSize.value,
      unread_only: onlyUnread.value,
    });
    groups.value = (data.list ?? []) as NotificationGroupVO[];
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function loadPreferences() {
  prefLoading.value = true;
  try {
    const { data } = await NotificationAPI.getNotifyPreference();
    preferences.value = data.list ?? [];
  } finally {
    prefLoading.value = false;
  }
}

/** 打开一条：未读先置已读，再按服务端下发的跳转打开 */
async function handleOpen(item: NotificationGroupVO) {
  if (item.unread) {
    await NotificationAPI.readNotification({ group_key: item.group_key });
    await Promise.all([reload(), notificationStore.fetchUnread()]);
  }
  if (item.link) {
    router.push(item.link);
  }
}

async function handleDelete(item: NotificationGroupVO) {
  await NotificationAPI.deleteNotification({ group_key: item.group_key });
  await Promise.all([reload(), notificationStore.fetchUnread()]);
}

async function handleReadAll() {
  await NotificationAPI.readAllNotification();
  await Promise.all([reload(), notificationStore.fetchUnread()]);
}

function setUnreadFilter(unread: boolean) {
  if (onlyUnread.value === unread) {
    return;
  }
  onlyUnread.value = unread;
  page.value = 1;
  void reload();
}

async function handleToggle(group: string, channel: string, enabled: boolean) {
  const { data } = await NotificationAPI.updateNotifyPreference({
    list: [{ group, channel, enabled, mandatory: false }],
  });
  preferences.value = data.list ?? [];
  // 关掉站内信会影响未读，重新取一次
  await notificationStore.fetchUnread();
}

watch(tab, (value) => {
  if (value === "preference" && !preferences.value.length) {
    void loadPreferences();
  }
});

onMounted(() => {
  void reload();
  void notificationStore.fetchUnread();
});
</script>

<style lang="scss" scoped>
.notification-page {
  width: 100%;
  max-width: 96rem;
  margin: 6rem auto 2rem;
  padding: 1.5rem 2rem;
  color: var(--text-color);
}

.page-tabs :deep(.n-tabs-nav) {
  max-width: 24rem;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-heading {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.4;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--grey-5);
}

.read-all {
  flex-shrink: 0;
}

.inbox-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.filter-pills {
  display: inline-flex;
  padding: 0.2rem;
  background: var(--grey-2);
  border-radius: 999px;
}

.filter-pill {
  padding: 0.3rem 0.95rem;
  font-size: 0.85rem;
  color: var(--grey-6);
  border-radius: 999px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &.active {
    color: var(--grey-0);
    background: var(--primary-color);
  }
}

.list-hint {
  font-size: 0.8rem;
  color: var(--grey-5);
}

.skeleton {
  padding: 0.5rem 0;
}

.empty {
  padding: 3rem 0;
}

.notice-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-card {
  position: relative;
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem 1.1rem;
  overflow: hidden;
  cursor: pointer;
  background: var(--grey-1);
  border: 1px solid var(--grey-2);
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1.5rem -1.25rem var(--box-bg-shadow);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    content: "";
    background: transparent;
  }

  &:hover {
    border-color: var(--color-pink-a3);
    box-shadow: 0 0.75rem 1.75rem -1.1rem var(--box-bg-shadow);
    transform: translateY(-1px);
  }

  &.unread {
    background: linear-gradient(90deg, var(--color-red-a1), var(--grey-1) 35%);

    &::before {
      background: var(--primary-color);
    }

    .notice-title {
      font-weight: 600;
      color: var(--grey-8);
    }
  }
}

.notice-icon {
  display: flex;
  flex: 0 0 2.4rem;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  background: var(--grey-2);
  border-radius: 50%;

  &--blue {
    color: var(--color-blue);
  }

  &--green {
    color: var(--color-green);
  }

  &--pink {
    color: var(--color-pink);
  }

  &--orange {
    color: var(--color-orange);
  }

  &--red {
    color: var(--color-red);
  }

  &--grey {
    color: var(--color-grey);
  }
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-title-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.notice-title {
  overflow: hidden;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--grey-7);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  flex: 0 0 0.42rem;
  width: 0.42rem;
  height: 0.42rem;
  background: var(--primary-color);
  border-radius: 50%;
}

.notice-content {
  display: -webkit-box;
  margin: 0.25rem 0 0;
  overflow: hidden;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--grey-5);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin-top: 0.45rem;
  font-size: 0.78rem;
  color: var(--grey-5);

  span + span::before {
    margin-right: 0.75rem;
    color: var(--grey-4);
    content: "·";
  }
}

.notice-delete {
  flex-shrink: 0;
  align-self: center;
  opacity: 0.55;
  transition: opacity 0.2s ease;

  .notice-card:hover &,
  .notice-card:focus-within & {
    opacity: 1;
  }
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--grey-5);
}

.pref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.9rem;
}

.pref-card {
  padding: 1rem 1.1rem;
  background: var(--grey-1);
  border: 1px solid var(--grey-2);
  border-radius: 0.75rem;
}

.pref-card-head {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.pref-card-title {
  font-weight: 600;
  color: var(--grey-8);
}

.pref-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0;
  cursor: pointer;
}

.pref-label {
  font-size: 0.9rem;
  color: var(--grey-6);
}

.pref-control {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.locked {
  font-size: 0.72rem;
  color: var(--grey-5);
}

@media (max-width: 640px) {
  .notification-page {
    margin: 5rem auto 1.5rem;
    padding: 1rem;
  }

  .page-head {
    align-items: flex-start;
  }

  .inbox-toolbar {
    flex-wrap: wrap;
  }

  .notice-card {
    padding: 0.9rem;
  }

  .notice-icon {
    flex-basis: 2rem;
    width: 2rem;
    height: 2rem;
  }

  .notice-delete {
    opacity: 1;
  }

  .pref-grid {
    grid-template-columns: 1fr;
  }
}
</style>
