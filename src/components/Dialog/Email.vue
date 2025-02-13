<template>
  <n-modal
    v-model:show="dialogVisible"
    class="bg"
    preset="dialog"
    :show-icon="false"
    transform-origin="center"
    style="padding-bottom: 2rem"
    :block-scroll="false"
  >
    <div class="login-title">绑定邮箱</div>
    <n-input v-model:value="emailForm.email" class="mt-11" placeholder="邮箱号"></n-input>
    <n-input-group class="mt-11">
      <n-input v-model:value="emailForm.verify_code" placeholder="验证码" />
      <n-button color="#49b1f5" :disabled="flag" @click="sendCode">
        {{ timer == 0 ? "发送" : `${timer}s` }}
      </n-button>
    </n-input-group>
    <n-button
      class="mt-11"
      color="#4caf50"
      style="width: 100%"
      :loading="loading"
      @click="handleUpdate"
    >
      绑定
    </n-button>
  </n-modal>
</template>

<script setup lang="ts">
import { useAppStore, useUserStore } from "@/store";
import { useIntervalFn } from "@vueuse/core";
import { bindUserEmailApi, sendBindEmailApi } from "@/api/auth";

const userStore = useUserStore();
const appStore = useAppStore();
const data = reactive({
  timer: 0,
  flag: false,
  loading: false,
  emailForm: {
    email: "",
    verify_code: "",
  },
});
const { timer, flag, loading, emailForm } = toRefs(data);
const { pause, resume } = useIntervalFn(
  () => {
    timer.value--;
    if (timer.value <= 0) {
      // 停止定时器
      pause();
      flag.value = false;
    }
  },
  1000,
  { immediate: false }
);
const start = (time: number) => {
  flag.value = true;
  timer.value = time;
  // 启动定时器
  resume();
};
const sendCode = () => {
  let reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!reg.test(emailForm.value.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  start(60);
  sendBindEmailApi({ username: emailForm.value.email }).then((res) => {
    window.$message?.success("发送成功");
  });
};
const dialogVisible = computed({
  get: () => appStore.emailFlag,
  set: (value) => (appStore.emailFlag = value),
});
const handleUpdate = () => {
  if (emailForm.value.verify_code.trim().length != 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  loading.value = true;
  bindUserEmailApi(emailForm.value)
    .then((res) => {
      window.$message?.success("修改成功");
      userStore.userInfo.email = emailForm.value.email;
      emailForm.value = {
        email: "",
        verify_code: "",
      };
      dialogVisible.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style scoped></style>
