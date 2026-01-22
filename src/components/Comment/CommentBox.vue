<template>
  <div v-if="show" class="reply-box">
    <div class="box-normal">
      <div class="reply-box-avatar">
        <img v-if="avatar" class="shoka-avatar" :src="avatar" alt="" />
      </div>
      <div class="reply-box-warp">
        <textarea
          v-model="content"
          class="reply-box-textarea"
          :style="sendActive ? lineStyle : ''"
          :placeholder="placeholder"
          @input.prevent="inputActive"
        ></textarea>
      </div>
    </div>
    <div class="box-expand">
      <Emoji @add-emoji="handleEmoji" @choose-type="handleType"></Emoji>
      <div style="margin-left: auto">
        <button class="cancel-btn v-comment-btn" @click="cancelReply">取消</button>
        <button class="confirm-btn v-comment-btn" @click="confirmReply">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    required: false,
    default: () => true,
  },
  avatar: {
    type: String,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
  },
});

// 父组件向子组件传输的事件
const emit = defineEmits([
  // 定义事件
  "cancel",
  "confirm",
]);

const content = defineModel({
  type: String,
  default: "",
  required: false,
});

// 评论内容
const placeholder = ref(props.placeholder);

const sendActive = ref(true);
const emojiType = ref(1);
const lineStyle = {
  lineHeight: "normal",
  borderColor: "#ed6ea0",
  backgroundColor: "var(--grey-0)",
};

const handleEmoji = (key: string) => {
  content.value += key;
  sendActive.value = true;
};
const handleType = (key: number) => {
  emojiType.value = key;
};

const cancelReply = () => {
  console.log("cancelReply", content.value);
  emit("cancel", content.value);
  // replyRef.value.style.display = "none"
};

const confirmReply = () => {
  console.log("confirmReply", content.value);
  emit("confirm", content.value);
};

const inputActive = () => {
  if (content.value.length == 0) {
    sendActive.value = false;
  } else {
    sendActive.value = true;
  }
};

watchEffect(() => {
  placeholder.value = props.placeholder;
});

defineExpose({ content, placeholder });
</script>

<style scoped>
.v-comment-btn {
  border: 1px solid #ededed;
  border-radius: 4px;
  text-align: center;
  padding: 6px 16px;
  font-size: 14px;
  transition: all 0.3s;
  outline: none;
}

.confirm-btn {
  color: #fff;
  margin-left: 1rem;
  background-color: #49b1f5;
}

.cancel-btn {
  background-color: #90939910;
  border-color: #90939950;
  color: #4c4948;
}
</style>
