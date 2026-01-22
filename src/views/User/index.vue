<template>
  <div class="page-header">
    <h1 class="page-title">说说</h1>
    <img class="page-cover" :src="cover" alt="" />
    <Waves></Waves>
  </div>
  <div class="bg">
    <div class="page-container">
      <div class="title">基本信息</div>
      <div class="info-container">
        <div class="avatar">
          <img class="user-avatar" :src="userForm.avatar" @click="showCropper = true" />
          <user-avatar
            v-if="showCropper"
            class="avatar"
            :src="userForm.avatar"
            @onCancel="showCropper = false"
            @onConfirm="handleAvatarUpload"
          >
          </user-avatar>
        </div>
        <div class="info mt-4">
          <n-form
            ref="formInstRef"
            label-align="left"
            :label-width="80"
            :model="userForm"
            :rules="rules"
          >
            <n-form-item label="昵称" label-style="color: var(--text-color);" path="nickname">
              <n-input v-model:value="userForm.nickname" placeholder="输入您的昵称" />
            </n-form-item>
            <n-form-item label="个人网站" label-style="color: var(--text-color);" path="website">
              <n-input v-model:value="userForm.website" placeholder="请输入个人网站" />
            </n-form-item>
            <n-form-item label="简介" label-style="color: var(--text-color);" path="intro">
              <n-input v-model:value="userForm.intro" placeholder="介绍一下自己吧" />
            </n-form-item>
            <n-form-item label="邮箱" label-style="color: var(--text-color);" path="email">
              <n-input-group>
                <n-input
                  v-model:value="userStore.userInfo.email"
                  placeholder="请输入邮箱"
                  disabled
                ></n-input>
                <n-button
                  v-if="userStore.userInfo.email"
                  color="#49b1f5"
                  @click="appStore.emailBindFlag = true"
                >
                  修改邮箱
                </n-button>
                <n-button v-else color="#49b1f5" @click="appStore.emailBindFlag = true">
                  立即绑定
                </n-button>
              </n-input-group>
            </n-form-item>
            <n-form-item label="手机号" label-style="color: var(--text-color);" path="phone">
              <n-input-group>
                <n-input
                  v-model:value="userStore.userInfo.phone"
                  placeholder="请输入手机号"
                  disabled
                ></n-input>
                <n-button
                  v-if="userStore.userInfo.phone"
                  color="#49b1f5"
                  @click="appStore.setPhoneBindFlag(true)"
                >
                  修改手机号
                </n-button>
                <n-button v-else color="#49b1f5" @click="appStore.setPhoneBindFlag(true)">
                  立即绑定
                </n-button>
              </n-input-group>
            </n-form-item>
            <n-form-item label-style="color: var(--text-color);" path="third">
              <template #label>
                第三方账号 -
                <n-a
                  :underline="false"
                  :focusable="false"
                  style="color: #2080f0; --n-text-color-hover: #4098fc"
                  @click.prevent="appStore.setThirdBindFlag(true)"
                >
                  去绑定
                </n-a>
              </template>

              <template v-if="availablePlatforms.length === 0">
                <n-empty size="small" description="暂无绑定账号" style="margin: 2px 0" />
              </template>

              <template v-else>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px">
                  <n-tooltip
                    v-for="item in availablePlatforms"
                    :key="item.platform"
                    trigger="hover"
                    placement="top"
                  >
                    <template #trigger>
                      <div class="platform-icon-wrapper">
                        <svg-icon class="icon" :icon-class="item.platform" size="2rem" />
                      </div>
                    </template>
                    <div style="text-align: center; padding: 8px">
                      <n-avatar
                        round
                        :size="48"
                        :src="getUserPlatformInfo(item.platform).avatar"
                        style="margin-bottom: 4px"
                      />
                      <div style="font-weight: 500">
                        {{ getUserPlatformInfo(item.platform).nickname || "未设置昵称" }}
                      </div>
                    </div>
                  </n-tooltip>
                </div>
              </template>
            </n-form-item>
          </n-form>
          <n-button color="#3e999f" @click="handleUpdate"> 修改</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserAPI } from "@/api/user";
import type { UserInfoResp } from "@/api/types";
import type { FormInst } from "naive-ui";
import { useAppStore, useBlogStore, useUserStore } from "@/store";
import UserAvatar from "@/components/UserAvatar/index.vue";

const userStore = useUserStore();
const appStore = useAppStore();
const blogStore = useBlogStore();

const cover = blogStore.getCover("user");
const formInstRef = ref<FormInst | null>(null);
const router = useRouter();
const rules = {
  nickname: {
    required: true,
    message: "昵称不能为空",
  },
};
const userForm = ref<UserInfoResp>(<UserInfoResp>{
  avatar: userStore.userInfo.avatar,
  nickname: userStore.userInfo.nickname,
  intro: userStore.userInfo.intro,
  website: userStore.userInfo.website,
});
const handleUpdate = () => {
  formInstRef.value?.validate((errors) => {
    if (!errors) {
      UserAPI.updateUserInfoApi(userForm.value).then((res) => {
        userStore.getUserInfo();
        window.$message?.success("修改成功");
      });
    }
  });
};

const handleAvatarUpload = (data) => {
  console.log("handleAvatarUpload", data);
  userForm.value.avatar = data.file_url;
  UserAPI.updateUserInfoApi(userForm.value).then((res) => {
    userStore.getUserInfo();
    window.$message?.success("修改成功");
    showCropper.value = false;
  });
};

const showCropper = ref(false);

onMounted(() => {
  if (!userStore.isLogin()) {
    router.push("/");
  }
});

const availablePlatforms = computed(() => {
  return blogStore.blogInfo.website_config.social_login_list.filter((platform) => {
    return !userStore.userInfo.third_party?.some((item) => item.platform === platform.platform);
  });
});

const getUserPlatformInfo = (platform: string) => {
  return userStore.userInfo.third_party?.find((item) => item.platform === platform);
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;

.title {
  font-size: 1.25rem;
  font-weight: 700;
}

.info-container {
  @include flex;
  flex-wrap: wrap;
  margin-top: 1rem;

  .avatar {
    display: inline-flex;
    width: 230px;
    height: 140px;
  }

  .info {
    width: 530px;
  }
}

@media (max-width: 850px) {
  .avatar {
    justify-content: center;
  }
}

.user-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
}
</style>
