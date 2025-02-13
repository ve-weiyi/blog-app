<template>
  <n-modal
    v-model:show="dialogVisible"
    class="bg"
    preset="dialog"
    :show-icon="false"
    transform-origin="center"
    :block-scroll="false"
  >
    <div class="login-title">注册账号</div>
    <n-input v-model:value="registerForm.username" class="mt-11" placeholder="邮箱号"></n-input>
    <n-input-group class="mt-11">
      <n-input v-model:value="registerForm.verify_code" placeholder="验证码"></n-input>
      <n-button color="#49b1f5" :disabled="flag" @click="sendCode">
        {{ timer == 0 ? "发送" : `${timer}s` }}
      </n-button>
    </n-input-group>
    <n-input
      v-model:value="registerForm.password"
      class="mt-11"
      type="password"
      show-password-on="click"
      placeholder="密码"
    ></n-input>
    <n-button
      ref="registerRef"
      class="mt-11"
      color="#e9546b"
      style="width: 100%"
      :loading="loading"
      @click="handleRegister"
    >
      注册
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
import { registerApi, sendRegisterEmailApi } from "@/api/auth";
import { RegisterReq } from "@/api/types";

const appStore = useAppStore();
const registerRef = ref();
const data = reactive({
  timer: 0,
  flag: false,
  loading: false,
  registerForm: {
    username: "",
    password: "",
    verify_code: "",
  } as RegisterReq,
});
const { timer, flag, loading, registerForm } = toRefs(data);
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
  if (!reg.test(registerForm.value.username)) {
    window.$message?.warning("邮箱格式不正确");
    return;
  }
  start(60);
  sendRegisterEmailApi(registerForm.value).then((res) => {
    window.$message?.success("发送成功");
  });
};
const handleRegister = () => {
  if (registerForm.value.verify_code.trim().length != 6) {
    window.$message?.warning("请输入6位验证码");
    return;
  }
  if (registerForm.value.password.trim().length < 6) {
    window.$message?.warning("密码不能少于6位");
    return;
  }
  loading.value = true;
  registerApi(registerForm.value).then((res) => {
    window.$message?.success("注册成功");
    appStore.setRegisterFlag(false);
    appStore.setLoginFlag(true);
    loading.value = false;
  });
};
const dialogVisible = computed({
  get: () => appStore.registerFlag,
  set: (value) => (appStore.registerFlag = value),
});
const handleLogin = () => {
  appStore.setRegisterFlag(false);
  appStore.setLoginFlag(true);
};
</script>

<style scoped></style>
