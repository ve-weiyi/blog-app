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
    <div class="login-title">绑定第三方账号</div>
    <div>
      <div class="social-login-wrapper">
        <template v-for="item in availablePlatforms" :key="item.platform">
          <svg-icon
            class="icon"
            style="margin: 10px"
            :icon-class="item.platform"
            size="2.5rem"
            @click="handleBindAccount(item.platform)"
          />
        </template>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import { AuthAPI } from "@/api/auth";

const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

const dialogVisible = computed({
  get: () => appStore.thirdBindFlag,
  set: (value) => (appStore.thirdBindFlag = value),
});

const availablePlatforms = computed(() => {
  return blogStore.blogInfo.website_config.social_login_list.filter((platform) => {
    return !userStore.userInfo.third_party?.some((item) => item.platform === platform.platform);
  });
});

const route = useRoute();
const handleBindAccount = (platform: string) => {
  console.log("绑定平台:", platform);

  // 这里添加绑定逻辑
  const state = route.query.redirect as string;
  AuthAPI.getOauthAuthorizeUrlApi({
    platform: platform,
    state: "bind_account",
  })
    .then((res) => {
      if (res.data?.authorize_url) {
        appStore.thirdBindFlag = false;
        // 跳转到授权页面
        let url = res.data.authorize_url;
        console.log("第三方登录平台:", platform, state, url);
        window.open(url, "_self");
      } else {
        window.$message?.error("获取授权地址失败");
      }
    })
    .catch((error) => {
      window.$message?.error("第三方登录失败，请稍后重试");
    });
};
</script>

<style scoped>
.social-login-wrapper {
  text-align: center;
  margin-top: 1.4rem;
}
</style>
