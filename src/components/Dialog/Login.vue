<template>
  <n-modal
    v-model:show="dialogVisible"
    class="bg"
    preset="dialog"
    :show-icon="false"
    transform-origin="center"
    :block-scroll="false"
  >
    <div class="login-title">登录账号</div>
    <n-input
      v-model:value="loginForm.username"
      class="mt-11"
      placeholder="邮箱号"
      @keyup.enter="handleLogin"
    ></n-input>
    <n-input
      v-model:value="loginForm.password"
      class="mt-11"
      type="password"
      show-password-on="click"
      placeholder="密码"
      @keyup.enter="handleLogin"
    ></n-input>
    <n-button
      class="mt-11"
      color="#ed6ea0"
      style="width: 100%"
      :loading="loading"
      @click="handleLogin"
    >
      登 录
    </n-button>
    <div class="mt-10 login-tip">
      <span class="colorFlag" @click="handleRegister">立即注册</span>
      <span class="colorFlag" @click="handleForget">忘记密码?</span>
    </div>
    <div>
      <div class="social-login-title">社交账号登录</div>
      <div class="social-login-wrapper">
        <template v-for="item in thirdPlatformList" :key="item.platform">
          <svg-icon
            v-if="item.enabled"
            class="icon"
            :icon-class="item.platform"
            size="2rem"
            @click="oauthLogin(item.platform)"
          />
        </template>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import { AuthAPI } from "@/api/auth";
import type { GetOauthAuthorizeUrlReq, LoginReq } from "@/api/types";

const appStore = useAppStore();
const userStore = useUserStore();
const blogStore = useBlogStore();
const route = useRoute();
const loading = ref(false);
const loginForm = ref<LoginReq>({
  username: "",
  password: "",
});
const dialogVisible = defineModel<boolean>();

const thirdPlatformList = computed(() => {
  return blogStore.blogInfo.website_config.social_login_list;
});

const handleRegister = () => {
  appStore.setLoginFlag(false);
  appStore.setRegisterFlag(true);
};
const handleForget = () => {
  appStore.setLoginFlag(false);
  appStore.setForgetFlag(true);
};

const oauthLogin = (platform: string) => {
  const oauth: GetOauthAuthorizeUrlReq = {
    platform: platform,
    state: route.path,
  };
  AuthAPI.getOauthAuthorizeUrlApi(oauth).then((res) => {
    appStore.setLoginFlag(false);
    console.log(res.data.authorize_url);
    // 新启页面跳转
    // window.open(res.data.url);

    // 当前页面跳转
    window.location.href = res.data.authorize_url;
  });
};
const handleLogin = () => {
  if (loginForm.value.username.trim().length == 0) {
    window.$message?.warning("用户名最小长度是6");
    return;
  }
  if (loginForm.value.password.trim().length == 0) {
    window.$message?.warning("密码不能为空");
    return;
  }
  loading.value = true;
  userStore
    .login(loginForm.value)
    .then((res) => {
      window.$message?.success("登录成功");

      userStore.getUserInfo().then((res) => {
        if (userStore.userInfo.email === "") {
          window.$message?.warning("请绑定邮箱以便及时收到回复");
        }
      });

      loginForm.value = {
        username: "",
        password: "",
      };
      appStore.setLoginFlag(false);
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style scoped>
.login-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.social-login-title {
  margin-top: 1rem;
  color: #b5b5b5;
  font-size: 0.75rem;
  text-align: center;
}

.social-login-title::before {
  content: "";
  display: inline-block;
  background-color: #d8d8d8;
  width: 60px;
  height: 1px;
  margin: 0 12px;
  vertical-align: middle;
}

.social-login-title::after {
  content: "";
  display: inline-block;
  background-color: #d8d8d8;
  width: 60px;
  height: 1px;
  margin: 0 12px;
  vertical-align: middle;
}

.social-login-wrapper {
  text-align: center;
  margin-top: 1.4rem;
}

.icon {
  margin: 0 0.3rem;
}
</style>
