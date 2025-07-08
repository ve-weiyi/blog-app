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
    <div class="login-title">绑定手机号</div>
    <n-input v-model:value="phoneForm.phone" class="mt-11" placeholder="手机号"></n-input>
    <n-input-group class="mt-11">
      <n-input v-model:value="phoneForm.verify_code" placeholder="验证码" />
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
import { AuthAPI } from "@/api/auth";
import { UserAPI } from "@/api/user.ts";

const userStore = useUserStore();
const appStore = useAppStore();
const data = reactive({
  timer: 0,
  flag: false,
  loading: false,
  phoneForm: {
    phone: "",
    verify_code: "",
  },
});
const { timer, flag, loading, phoneForm } = toRefs(data);
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
  let reg = /^1[3-9]\d{9}$/;
  if (!reg.test(phoneForm.value.phone)) {
    window.$message?.warning("手机号格式不正确");
    return;
  }
  start(60);
  AuthAPI.sendPhoneVerifyCodeApi({
    phone: phoneForm.value.phone,
    type: "bind_phone",
  }).then((res) => {
    window.$message?.success("发送成功");
  });
};
const dialogVisible = computed({
  get: () => appStore.phoneBindFlag,
  set: (value) => (appStore.phoneBindFlag = value),
});
const handleUpdate = () => {
  if (phoneForm.value.verify_code.trim().length != 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  loading.value = true;
  UserAPI.updateUserBindPhoneApi({
    phone: phoneForm.value.phone,
    verify_code: phoneForm.value.verify_code,
  })
    .then((res) => {
      window.$message?.success("修改成功");
      userStore.userInfo.phone = phoneForm.value.phone;
      phoneForm.value = {
        phone: "",
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
