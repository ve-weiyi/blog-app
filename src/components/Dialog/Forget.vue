<template>
  <n-modal
    v-model:show="dialogVisible"
    class="bg"
    preset="dialog"
    :show-icon="false"
    transform-origin="center"
    :block-scroll="false"
  >
    <div class="login-title">忘记密码</div>
    <n-input v-model:value="forgetForm.email" class="mt-11" placeholder="邮箱号"></n-input>
    <n-input-group class="mt-11">
      <n-input v-model:value="forgetForm.verify_code" placeholder="验证码" />
      <n-button color="#49b1f5" :disabled="flag" @click="sendCode">
        {{ timer == 0 ? "发送" : `${timer}s` }}
      </n-button>
    </n-input-group>
    <n-input
      v-model:value="forgetForm.password"
      class="mt-11"
      type="password"
      show-password-on="click"
      placeholder="密码"
    ></n-input>
    <n-button
      class="mt-11"
      color="#4caf50"
      style="width: 100%"
      :loading="loading"
      @click="handleForget"
    >
      确定
    </n-button>
    <div class="mt-10">
      <span class="dialog-text">已有账号？</span
      ><span class="colorFlag" @click="handleLogin">登录</span>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import { useIntervalFn } from "@vueuse/core";
import { AuthAPI } from "@/api/auth";
import type { ResetPasswordReq } from "@/api/types";

const appStore = useAppStore();
const data = reactive({
  timer: 0,
  flag: false,
  loading: false,
  forgetForm: {
    email: "",
    password: "",
    confirm_password: "",
    verify_code: "",
  } as ResetPasswordReq,
});
const { timer, flag, loading, forgetForm } = toRefs(data);
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
  if (!reg.test(forgetForm.value.email)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  start(60);
  AuthAPI.sendEmailVerifyCodeApi({
    email: forgetForm.value.email,
    type: "reset_password",
  }).then((res) => {
    window.$message?.success("发送成功");
  });
};
const handleForget = () => {
  if (forgetForm.value.verify_code.trim().length != 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  if (forgetForm.value.password.trim().length < 6) {
    window.$message?.warning("密码不能少于6位");
    return;
  }
  loading.value = true;
  AuthAPI.resetPasswordApi(forgetForm.value).then((res) => {
    window.$message?.success("修改成功");
    forgetForm.value = {
      email: "",
      password: "",
      confirm_password: "",
      verify_code: "",
    };
    appStore.setForgetFlag(false);

    loading.value = false;
  });
};
const dialogVisible = defineModel<boolean>();
const handleLogin = () => {
  appStore.setForgetFlag(false);
  appStore.setLoginFlag(true);
};
</script>

<style scoped></style>
