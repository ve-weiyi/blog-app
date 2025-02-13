<template>
  <div>
    <n-modal
      v-model:show="dialogVisible"
      class="bg"
      preset="dialog"
      :show-icon="false"
      transform-origin="center"
      :block-scroll="false"
      :closable="false"
    >
      <div style="width: 100%; height: 300px">
        <vue-cropper
          ref="cropperRef"
          :img="imageSrc"
          :info="true"
          :config="cropperConfig"
        ></vue-cropper>
      </div>
      <n-upload
        class="mt-4"
        action="#"
        accept="image/*"
        :show-file-list="false"
        :custom-request="customUpload"
      >
        <n-button>点击上传</n-button>
      </n-upload>
      <template #action>
        <n-button color="#3e999f" @click="cancel"> 取消</n-button>
        <n-button color="#e9546b" @click="confirm"> 提交</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { UploadCustomRequestOptions } from "naive-ui";
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";
import { uploadFileApi } from "@/api/upload";

// 父组件向子组件传输的数据
const props = defineProps({
  src: {
    type: String,
    required: false,
  },
});

// 父组件向子组件传输的事件
const emit = defineEmits([
  // 定义事件
  "onCancel",
  "onConfirm",
]);

const userStore = useUserStore();
const dialogVisible = ref(true);
const cropperRef = ref();
const cropperConfig = reactive({
  img: userStore.userInfo.avatar, // 裁剪图片的地址
  autoCrop: true, // 是否默认生成截图框
  autoCropWidth: 200, // 默认生成截图框宽度
  autoCropHeight: 200, // 默认生成截图框高度
  fixedBox: true, // 固定截图框大小 不允许改变
  outputType: "png", // 默认生成截图为PNG格式
});
const imageSrc = ref(props.src);

const customUpload = ({ file }: UploadCustomRequestOptions) => {
  const reader = new FileReader();
  reader.readAsDataURL(file.file as File);
  reader.onload = () => {
    imageSrc.value = reader.result as string;
  };
};

function cancel() {
  // 触发事件
  emit("onCancel");
}

function confirm() {
  // 触发事件
  cropperRef.value.getCropBlob((blob: Blob) => {
    // 将 base64 格式的图像数据转换为 Blob 对象
    const file = new File([blob], `cropped-image-${userStore.userInfo.user_id}.jpg`, {
      type: "image/jpeg",
    });
    console.log("croppedData", file);
    // 创建一个新的 File 对象
    const data = {
      file_path: "/avatar",
      file: file,
    };
    uploadFileApi(data).then((res) => {
      console.log("res", res);
      emit("onConfirm", res.data);
    });
  });
}
</script>

<style scoped>
.user-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
}
</style>
