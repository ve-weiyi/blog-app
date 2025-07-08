<template>
  <div>
    <transition name="dis_list">
      <div class="list_box" v-if="listIsDis">
        <transition name="music_alert">
          <span class="music_alert" v-if="musicAlertState">{{ musicAlertVal }}</span>
        </transition>
        <div class="list_close" @click="DisList">x</div>
        <div class="music_list">
          <div class="list_l">
            <ul class="music_type">
              <li
                v-for="(item, index) in musicTypeList"
                :key="index"
                @click="_getMusicType(item.id)"
                :class="{ type_active: item.id == thisMusicType }"
              >
                {{ item.name }}
              </li>
            </ul>
            <div class="list_title">
              <span style="font-size: 14px">歌曲列表</span>
              <img :src="musicStateButton" alt="" class="music_state" @click="MusicStateChange" />
              <div class="music_search_box">
                <input
                  type="text"
                  class="music_search"
                  v-model="musicSearchVal"
                  placeholder="搜索歌曲"
                />
                <transition name="music_search">
                  <ul class="search_list" v-if="musicSearchVal != ''">
                    <li
                      v-for="(item, index) in musicSearchList"
                      :key="index"
                      @click="ListAdd(item.id)"
                    >
                      <span class="music_search_name">{{ item.name }}</span>
                      <span class="music_search_ar">{{ item.artists[0].name }}</span>
                    </li>
                  </ul>
                </transition>
              </div>
            </div>
            <div class="music_ul_title"><span>歌曲</span><span>歌手</span><span>专辑</span></div>
            <ul class="list">
              <li
                v-for="(item, index) in thisMusicList"
                :key="index"
                @mouseover="ButtonActive(index)"
                @dblclick="ListPlay((thisListPage - 1) * 10 + index)"
              >
                <div
                  class="this_music_shlter"
                  v-if="(thisListPage - 1) * 10 + index == thisMusicIndex"
                ></div>
                <span>{{ item.name }}</span>
                <span>{{ item.ar[0].name }}</span>
                <span>{{ item.al.name }}</span>
                <transition name="list_button">
                  <div class="music_button" v-if="listButtonActiveIndex == index">
                    <div
                      class="list_play"
                      title="播放这首歌"
                      :style="{ backgroundImage: 'url(' + listPlay + ')' }"
                      @click="ListPlay((thisListPage - 1) * 10 + index)"
                    ></div>
                    <div
                      class="list_play"
                      title="添加到 My Songs"
                      :style="{ backgroundImage: 'url(' + add + ')' }"
                      @click="ListAdd(item.id)"
                      v-if="thisMusicType != -1"
                    ></div>
                  </div>
                </transition>
              </li>
            </ul>
            <div class="list_page">
              <div class="page_last" v-if="thisListPage != 1" @click="ListChange(true)">&lt;</div>
              <div
                class="page_next"
                v-if="thisListPage != Math.ceil(musicList.length / 10)"
                @click="ListChange(false)"
              >
                >
              </div>
            </div>
          </div>
          <div class="list_r">
            <img class="music_list_bg" :src="musicImg" />
            <div
              class="music_list_shlter"
              :style="{ backgroundImage: 'url(' + shlter + ')' }"
            ></div>
            <ul class="music_talk_list">
              <li v-for="(item, index) in hotTalkList" :key="index">
                <div class="talk_head">
                  <img :src="item.user.avatarUrl" alt="" class="talk_head_img" />
                  <span class="talk_head_name">{{ item.user.nickname }}</span>
                </div>
                <p class="talk_content">
                  <img class="talk_icon_l" :src="talkicon1" />
                  {{ item.content }}
                  <img class="talk_icon_r" :src="talkicon2" />
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
    <div class="bbox" :class="{ bbox_active: disActive }">
      <div
        class="pan"
        :style="{ backgroundImage: 'url(' + pan + ')' }"
        :class="{ pan_active: disActive }"
        @click="DisActive"
      >
        <img :src="musicImg" alt="" class="pan_c" />
      </div>
      <div
        class="box"
        :style="{ backgroundImage: 'url(' + musicImg + ')' }"
        :class="{ box_active: disActive }"
        @dblclick="DisList"
      >
        <div
          class="music_shlter_2"
          :style="{ backgroundImage: 'url(' + musicImg + ')' }"
          :class="{ shlter_active: disActive }"
        ></div>
        <div
          class="music_shlter"
          :style="{ backgroundImage: 'url(' + musicImg + ')' }"
          :class="{ shlter_active: disActive }"
        ></div>
        <div class="music_shlter_3"></div>
        <div class="music_dis">
          <div class="dis_list" @click="DisList">···</div>
          <p class="music_title">{{ musicTitle }}</p>
          <p class="music_intro">歌手: {{ musicName }}</p>
          <ul class="music_words" ref="musicWordsRef">
            <div class="music_words_box" :style="{ top: wordsTop + 'px' }">
              <li
                v-for="(item, index) in musicWords"
                :key="index"
                class="music_word"
                :class="{ word_highlight: wordIndex == index }"
              >
                {{ item }}
              </li>
            </div>
          </ul>
        </div>
        <div class="control_box">
          <div class="control_button">
            <img
              :src="playIcon"
              alt=""
              class="control_icon"
              ref="controlIconRef"
              @click="togglePlay"
            />
          </div>
          <div
            class="progress"
            ref="progressBarRef"
            @mousedown="onProgressMouseDown"
            @mousemove="onProgressMouseMove"
            @mouseup="onProgressMouseUp"
            @mouseleave="onProgressMouseLeave"
          >
            <div class="progress_c" :style="{ width: currentProgress }">
              <div class="progress_circle">
                <div class="progress_circle_c"></div>
              </div>
            </div>
          </div>
          <!-- 播放时长 -->
          <div class="duration-time">
            <span id="currentTime">{{ currentStr }}</span
            >/<span id="durationTime">{{ durationStr }}</span>
          </div>
        </div>
      </div>
      <video id="music" :src="musicUrl" name="media" ref="playerRef"></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import {
  getHotMusic,
  getHotTalk,
  getMusicInfo,
  getMusicUrl,
  getSearchSuggest,
  getWords,
} from "./api/music";
import type { Comment, MusicInfo, MusicType } from "./types";
// 导入图片，直接作为变量使用
import pan from "./img/pan.png";
import play from "./img/play.png";
import pause from "./img/pause.png";
import add from "./img/add.png";
import shlter from "./img/list_pan.png";
import listPlay from "./img/list_play_hover.png";
import state0 from "./img/state_0.png";
import state1 from "./img/state_1.png";
import talkicon1 from "./img/talkicon1.png";
import talkicon2 from "./img/talkicon2.png";

// 定义响应式数据
const o = ref<number>(0);
const top = ref<number>(0);
const playState = ref<boolean>(true);
const playIcon = ref<string>(pause);
const musicImg = ref<string>("");
const musicUrl = ref<string>("");
const musicWords = ref<string[]>([]);
const musicTitle = ref<string>("");
const musicName = ref<string>("");
const wordsTime = ref<number[]>([]);
const wordsTop = ref<number>(0);
const wordIndex = ref<number>(0);
const currentProgress = ref<string>("0%");
const musicList = ref<MusicInfo[]>([]); // 音乐列表，初始为空
const myMusicList = ref<MusicInfo[]>([]); // 存储在本地，可以开始判断有没有，让用户一开始就听这个列表
const thisMusicIndex = ref<number>(1);
const disActive = ref<boolean>(false);
const listIsDis = ref<boolean>(false);
const listButtonActiveIndex = ref<number>(-1);
const thisListPage = ref<number>(1);
const musicSearchVal = ref<string>("");
const musicSearchList = ref<MusicInfo[]>([]);
const musicAlertVal = ref<string>("");
const musicAlertState = ref<boolean>(false);
const musicAlertTimer = ref<NodeJS.Timeout | null>(null);
// 新增歌词评论
const hotTalkList = ref<Comment[]>([]);

// 使用 ref 引用 DOM 元素
const playerRef = ref<HTMLAudioElement>();
const controlIconRef = ref<HTMLElement>();
const progressBarRef = ref<HTMLElement>();
const musicWordsRef = ref<HTMLElement>();

// 进度条拖拽相关状态
const isDragging = ref<boolean>(false);
const playerTimer = ref<NodeJS.Timeout | null>(null);

const musicTypeList: MusicType[] = [
  { name: "热歌榜", id: 3778678 },
  { name: "新歌榜", id: 3779629 },
  { name: "飙升榜", id: 19723756 },
  { name: "嘻哈榜", id: 991319590 },
  { name: "My Songs", id: -1 },
];
const thisMusicType = ref<number>(0);
const notPlay = ref<number[]>([]); // 用于存储不能播放的歌曲列表
const musicState = ref<number>(0); // 0 列表循环，1 单曲循环
const musicStateButton = ref<string>(state1);

const thisMusicList = computed<MusicInfo[]>(() => {
  return [...musicList.value].splice((thisListPage.value - 1) * 10, 10); // 分页
});

const currentTime = ref<number>(0);
const durationTime = ref<number>(0);
const currentStr = computed<string>(() => {
  return formatSeconds(currentTime.value);
});

const durationStr = computed<string>(() => {
  return formatSeconds(durationTime.value);
});

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60); // 计算分钟，省略小数部分
  const remainingSeconds = Math.floor(seconds % 60); // 计算剩余秒数，省略小数部分

  // 格式化为两位数
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// 提示音乐信息
function MusicAlert(val: string): void {
  musicAlertState.value = true;
  musicAlertVal.value = val;
  clearTimeout(musicAlertTimer.value!);
  musicAlertTimer.value = setTimeout(() => {
    musicAlertState.value = false;
    musicAlertVal.value = "";
  }, 2000);
}

// 切换播放状态（列表循环、单曲循环）
function MusicStateChange(): void {
  if (musicState.value === 0) {
    musicState.value = 1;
    musicStateButton.value = state0;
    MusicAlert("已切换为单曲循环模式");
  } else {
    musicState.value = 0;
    musicStateButton.value = state1;
    MusicAlert("已切换为列表循环模式");
  }
}

// 设置播放列表按钮的激活状态
function ButtonActive(id: number): void {
  listButtonActiveIndex.value = id;
}

// 切换播放器的激活状态
function DisActive(): void {
  disActive.value = !disActive.value;
}

// 控制播放列表显示
function DisList(): void {
  listIsDis.value = !listIsDis.value;
}

// 切换播放列表的页码
function ListChange(isLast: boolean): void {
  if (isLast) {
    thisListPage.value--;
  } else {
    thisListPage.value++;
  }
}

// 将歌曲添加到我的歌单
function ListAdd(id: number): void {
  getMusicInfo(id).then((res) => {
    musicSearchVal.value = "";
    if (myMusicList.value.length === 0) {
      myMusicList.value = [res.data.songs[0]];
      _getMusicType(-1);
      // 第一次搜索直接播放
      _getInfo();
      // ListPlay(0);
    } else {
      myMusicList.value.push(res.data.songs[0]);
      // 提示已经添加进去
    }
    MusicAlert("添加成功");
  });
}

// 切换播放的歌曲
function ListPlay(index: number): void {
  thisMusicIndex.value = index > musicList.value.length - 1 ? 0 : index;
  _getInfo().then(() => {
    top.value = 0;
    o.value = 0;
    wordIndex.value = 0;
    wordsTop.value = 0;
    currentProgress.value = "0%";
    if (!playState.value && controlIconRef.value) {
      togglePlay();
    } else {
      playerRef.value.play();
    }
  });
}

// 获取音乐类型
function _getMusicType(id: number): void {
  if (thisMusicType.value !== id) {
    notPlay.value = [];
    if (id === -1) {
      if (myMusicList.value.length !== 0) {
        musicList.value = myMusicList.value;
        thisMusicType.value = id;
        thisMusicIndex.value = 0;
        thisListPage.value = 1;
        // ListPlay(0);
      } else {
        // 自定义库没有歌曲，提示需要搜索才能添加
        MusicAlert("没有歌曲,需要自己添加");
      }
    } else {
      getHotMusic(id).then((res) => {
        musicList.value = res.data.playlist.tracks.splice(0, 200);
        thisMusicType.value = id;
        thisMusicIndex.value = 0;
        thisListPage.value = 1;
        // ListPlay(0);
      });
    }
  }
}

// 获取歌曲信息
function _getInfo(): Promise<void> {
  let music = musicList.value[thisMusicIndex.value];
  return getMusicUrl(music.id).then((res) => {
    if (!res.data.data[0].url) {
      if (notPlay.value.length !== musicList.value.length) {
        let nextIndex = thisMusicIndex.value + 1;
        if (!notPlay.value.includes(thisMusicIndex.value)) {
          notPlay.value.push(thisMusicIndex.value);
        }
        MusicAlert(`${music.name} 因为一些原因不能播放`);
        ListPlay(nextIndex); // 寻找下一首歌，直到找到可播放的
      } else {
        MusicAlert("此列表所有歌都不能播放");
      }
    } else {
      musicUrl.value = res.data.data[0].url.replace("http://", "https://");
      musicImg.value = music.al.picUrl.replace("http://", "https://") + "?param=300y300";
      musicTitle.value = music.name;
      musicName.value = music.ar.map((i: any) => i.name).join("/");

      getWords(music.id).then((res) => {
        if (!res.data.nolyric) {
          let info = Cut(res.data.lrc.lyric);
          musicWords.value = info.wordArr;
          wordsTime.value = info.timeArr;
        }
      });

      getHotTalk(music.id).then((res) => {
        let count = 0;
        hotTalkList.value = res.data.hotComments.slice(0, 3);
        hotTalkList.value.forEach((e) => {
          count += e.content.length;
          e.user.avatarUrl = e.user.avatarUrl + "?param=50y50"; // Modify avatar URL
        });
        if (count >= 200) {
          hotTalkList.value = hotTalkList.value.slice(0, 2);
        }
      });
    }
  });
}

// 歌词解析结果接口
interface LyricParseResult {
  wordArr: string[];
  timeArr: number[];
}

// 处理歌词文本
function Cut(str: string): LyricParseResult {
  let wordArr: string[] = [];
  let timeArr: number[] = [];
  let arr = str.split("\n");
  arr.forEach((i: string) => {
    let reg = /\[([0-9]+):([0-9]+)\.([0-9]+)\](.+)/;
    let result = i.match(reg);
    if (result) {
      wordArr.push(result[4]);
      timeArr.push(parseInt(result[1]) * 60 + parseInt(result[2]) + parseInt(result[3]) / 1000);
    }
  });
  return { wordArr, timeArr };
}

// 定时器函数
function timer(): void {
  if (!playerRef.value) return;

  durationTime.value = playerRef.value.duration;
  currentTime.value = playerRef.value.currentTime;
  currentProgress.value = `${(playerRef.value.currentTime / playerRef.value.duration) * 100}%`;
  if (!playerRef.value.duration) {
    return;
  }

  // 歌词滚动控制
  if (playerRef.value.currentTime >= wordsTime.value[o.value + 1]) {
    const musicWordElements = musicWordsRef.value?.querySelectorAll(".music_word");
    if (musicWordElements && musicWordElements[o.value]) {
      let wh = musicWordElements[o.value].clientHeight;
      let wt = window.getComputedStyle(musicWordElements[o.value]).marginTop;
      let wsh = musicWordsRef.value?.clientHeight;

      top.value += wh + parseInt(wt);

      if (wsh && top.value >= wsh / 2 - 11) {
        //开始滚动的高度
        wordsTop.value += -(wh + parseInt(wt));
      }

      wordIndex.value = o.value + 1;
      o.value++;
    }
  }
  if (playerRef.value.currentTime >= playerRef.value.duration) {
    // 切换歌曲
    if (musicList.value.length !== 1 && musicState.value === 0) {
      thisMusicIndex.value =
        thisMusicIndex.value >= musicList.value.length - 1 ? 0 : thisMusicIndex.value + 1;
      ListPlay(thisMusicIndex.value);
    } else {
      playerRef.value.play();
      top.value = 0;
      o.value = 0;
      wordIndex.value = 0;
      wordsTop.value = 0;
      currentProgress.value = "0%";
    }
  }
}

// 播放/暂停切换
function togglePlay(): void {
  if (!playerRef.value) return;

  if (playState.value) {
    playerRef.value.pause();
    playState.value = false;
    playIcon.value = play;
    if (playerTimer.value) {
      clearInterval(playerTimer.value);
      playerTimer.value = null;
    }
  } else {
    playerRef.value.play();
    playState.value = true;
    playIcon.value = pause;
    if (playerTimer.value) {
      clearInterval(playerTimer.value);
    }
    playerTimer.value = setInterval(timer, 1000);
  }
}

// 进度条鼠标按下事件
function onProgressMouseDown(ev: MouseEvent): void {
  if (!progressBarRef.value || !playerRef.value) return;

  isDragging.value = true;
  const pro =
    (ev.clientX - progressBarRef.value.getBoundingClientRect().left) /
    progressBarRef.value.offsetWidth;

  if (playerTimer.value) {
    clearInterval(playerTimer.value);
    playerTimer.value = null;
  }

  currentProgress.value = `${pro * 100}%`;
  playerRef.value.currentTime = playerRef.value.duration * pro;

  updateLyricPosition(playerRef.value.currentTime);
}

// 进度条鼠标移动事件
function onProgressMouseMove(ev: MouseEvent): void {
  if (!isDragging.value || !progressBarRef.value) return;

  const newPro =
    (ev.clientX - progressBarRef.value.getBoundingClientRect().left) /
    progressBarRef.value.offsetWidth;
  currentProgress.value = `${newPro * 100}%`;
}

// 进度条鼠标松开事件
function onProgressMouseUp(ev: MouseEvent): void {
  if (!isDragging.value || !progressBarRef.value || !playerRef.value) return;

  isDragging.value = false;
  const pro =
    (ev.clientX - progressBarRef.value.getBoundingClientRect().left) /
    progressBarRef.value.offsetWidth;

  playerRef.value.currentTime = playerRef.value.duration * pro;
  updateLyricPosition(playerRef.value.currentTime);

  if (playerTimer.value) {
    clearInterval(playerTimer.value);
  }
  playerTimer.value = setInterval(timer, 1000);

  playState.value = true;
  playIcon.value = pause;

  if (playerRef.value.currentTime >= playerRef.value.duration) {
    top.value = 0;
    o.value = 0;
    wordIndex.value = 0;
    wordsTop.value = 0;
    currentProgress.value = "0%";
  }

  playerRef.value.play();
}

// 进度条鼠标离开事件
function onProgressMouseLeave(): void {
  isDragging.value = false;
}

// 更新歌词位置
function updateLyricPosition(currentTime: number): void {
  const c_arr = [...wordsTime.value];
  c_arr.push(currentTime);
  c_arr.sort((l, r) => l - r);
  const now_o = c_arr.indexOf(currentTime) - 1;
  let diff_h = 0;

  const musicWordElements = musicWordsRef.value?.querySelectorAll(".music_word");
  if (musicWordElements) {
    if (o.value < now_o) {
      for (let i = o.value; i < now_o; i++) {
        if (musicWordElements[i]) {
          diff_h += -(
            musicWordElements[i].clientHeight +
            parseInt(window.getComputedStyle(musicWordElements[i]).marginTop)
          );
        }
      }
    } else {
      for (let i = now_o; i < o.value; i++) {
        if (musicWordElements[i]) {
          diff_h +=
            musicWordElements[i].clientHeight +
            parseInt(window.getComputedStyle(musicWordElements[i]).marginTop);
        }
      }
    }
  }

  wordsTop.value += diff_h;
  wordIndex.value = o.value = now_o;
}

function Player(): void {
  if (!playerRef.value) return;

  playerTimer.value = setInterval(timer, 500);

  // 自动播放控制
  document.body.addEventListener("click", function playMusicOnce() {
    if (playerRef.value) {
      ListPlay(0);
    }
    // 移除点击事件监听器，确保只执行一次
    document.body.removeEventListener("click", playMusicOnce);
  });
}

// 监听搜索框的变化
watch(musicSearchVal, () => {
  if (musicSearchVal.value === "") {
    musicSearchList.value = [];
  } else {
    getSearchSuggest(musicSearchVal.value).then((res) => {
      musicSearchList.value = res.data.result.songs || [];
    });
  }
});

// 页面挂载时初始化播放器
onMounted(() => {
  Player();
});

// 页面创建时初始化数据
onBeforeMount(() => {
  ListAdd(2124731026);
  // ListAdd(167876);
  DisAuthorInfo(); // 禁删~感谢配合
});

// 禁删~感谢配合
function DisAuthorInfo(): void {
  console.log(
    "%c音乐播放器作者----与梦，博客地址：https://veweiyi.cn",
    "background-color:rgb(30,30,30);border-radius:4px;font-size:12px;padding:4px;color:rgb(220,208,129);"
  );
}
</script>

<style scoped>
@import url("./player.css");
@import url("./playermobile.css");
</style>
