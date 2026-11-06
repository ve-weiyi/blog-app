<template>
  <div class="unsubscribe-page">
    <n-spin :show="loading">
      <div v-if="error" class="block">
        <h1>退订链接不可用</h1>
        <p class="hint">{{ error }}</p>
        <n-button @click="router.push('/')">回到首页</n-button>
      </div>

      <div v-else-if="done" class="block">
        <h1>已退订</h1>
        <p class="hint">你不会再收到「{{ groupLabel }}」的「{{ channelLabel }}」通知。</p>
        <n-button @click="router.push('/')">回到首页</n-button>
      </div>

      <div v-else-if="verified" class="block">
        <h1>确认退订</h1>
        <p class="hint">
          确认后将不再接收「{{ groupLabel }}」的「{{ channelLabel }}」通知。
        </p>
        <div class="actions">
          <n-button type="primary" :loading="submitting" @click="handleConfirm">确认退订</n-button>
          <n-button quaternary @click="router.push('/')">取消</n-button>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NotificationAPI } from "@/api";

defineOptions({ name: "Unsubscribe" });

const route = useRoute();
const router = useRouter();

const group = ref("");
const channel = ref("");
const verified = ref(false);
const done = ref(false);
const loading = ref(true);
const submitting = ref(false);
const error = ref("");

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

const groupLabel = computed(() => groupLabels[group.value] ?? group.value);
const channelLabel = computed(() => channelLabels[channel.value] ?? channel.value);

/**
 * 邮件里的链接指向这里。
 *
 * 先校验再执行：邮件安全扫描器会预取正文链接，GET 直接落地成退订会被误触，
 * 所以确认动作必须由用户点一次按钮触发。
 */
onMounted(async () => {
  const token = String(route.query.token ?? "");
  if (!token) {
    error.value = "链接缺少令牌";
    loading.value = false;
    return;
  }

  try {
    const { data } = await NotificationAPI.verifyUnsubscribe({ token });
    group.value = data.group;
    channel.value = data.channel;
    verified.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "链接已失效";
  } finally {
    loading.value = false;
  }
});

async function handleConfirm() {
  const token = String(route.query.token ?? "");
  submitting.value = true;
  try {
    await NotificationAPI.unsubscribe({ token });
    done.value = true;
    verified.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "退订失败，请稍后重试";
    verified.value = false;
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.unsubscribe-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.block {
  max-width: 32rem;
  padding: 2rem;
  border-radius: 0.75rem;
  background: var(--grey-0);
  color: var(--text-color);
  text-align: center;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);

  h1 {
    margin: 0 0 0.75rem;
    font-size: 1.25rem;
  }
}

.hint {
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: var(--grey-5);
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}
</style>
