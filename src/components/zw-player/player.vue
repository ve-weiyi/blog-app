<template>
  <div>
    <transition name="dis_list">
      <div class="list_box" v-if="listIsDis">
        <transition name="music_alert">
          <span class="music_alert" v-if="musicAlertState">{{ musicAlertVal }}</span>
        </transition>
        <div class="list_close" @click="togglePlaylist">x</div>
        <div class="music_list">
          <div class="list_l">
            <ul class="music_type">
              <li
                v-for="(item, index) in musicTypeList"
                :key="index"
                @click="switchMusicType(item.id)"
                :class="{ type_active: item.id == thisMusicType }"
              >
                {{ item.name }}
              </li>
            </ul>
            <div class="list_title">
              <span style="font-size: 14px">歌曲列表</span>
              <img :src="musicStateButton" alt="" class="music_state" @click="togglePlayMode" />
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
                      @click="addToPlaylist(item.id)"
                    >
                      <span class="music_search_name">{{ item.name }}</span>
                      <span class="music_search_ar">{{
                        item.artists?.[0]?.name || "未知艺术家"
                      }}</span>
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
                @mouseover="setActiveButton(index)"
                @dblclick="playSong((thisListPage - 1) * 10 + index)"
              >
                <div
                  class="this_music_shlter"
                  v-if="(thisListPage - 1) * 10 + index == thisMusicIndex"
                ></div>
                <span>{{ item.name }}</span>
                <span>{{ item.artists?.[0]?.name || "未知艺术家" }}</span>
                <span>{{ item.album?.name || "未知专辑" }}</span>
                <transition name="list_button">
                  <div class="music_button" v-if="listButtonActiveIndex == index">
                    <div
                      class="list_play"
                      title="播放这首歌"
                      :style="{ backgroundImage: 'url(' + listPlay + ')' }"
                      @click="playSong((thisListPage - 1) * 10 + index)"
                    ></div>
                    <div
                      class="list_play"
                      title="添加到 My Songs"
                      :style="{ backgroundImage: 'url(' + add + ')' }"
                      @click="addToPlaylist(item.id)"
                      v-if="thisMusicType != -1"
                    ></div>
                  </div>
                </transition>
              </li>
            </ul>
            <div class="list_page">
              <div class="page_last" v-if="canGoPrevPage" @click="changePage('prev')">&lt;</div>
              <div class="page_next" v-if="canGoNextPage" @click="changePage('next')">&gt;</div>
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
    <div class="bbox" :class="{ bbox_active: disActive }" v-if="isLoaded">
      <div
        class="pan"
        :style="{ backgroundImage: 'url(' + pan + ')' }"
        :class="{ pan_active: disActive }"
        @click="togglePlayer"
      >
        <img :src="musicImg" alt="" class="pan_c" />
      </div>
      <div
        class="box"
        :style="{ backgroundImage: 'url(' + musicImg + ')' }"
        :class="{ box_active: disActive }"
        @dblclick="togglePlaylist"
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
          <div class="dis_list" @click="togglePlaylist">···</div>
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
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { musicApi } from "./api/music";
import type { Artist, Song } from "./api/types";
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

// 定义本地需要的类型
interface MusicType {
  name: string;
  id: number;
}

interface Comment {
  content: string;
  user: {
    nickname: string;
    avatarUrl: string;
  };
}

// 播放器状态
const isLoaded = ref(false);
const playState = ref(false);
const playIcon = ref(play);
const disActive = ref(false);
const listIsDis = ref(false);

// 音乐信息
const musicImg = ref("");
const musicUrl = ref("");
const musicTitle = ref("");
const musicName = ref("");
const currentTime = ref(0);
const durationTime = ref(0);

// 歌词相关
const musicWords = ref<string[]>([]);
const wordsTime = ref<number[]>([]);
const wordsTop = ref(0);
const wordIndex = ref(0);
const lyricScrollOffset = ref(0);
const lyricCurrentIndex = ref(0);

// 播放列表
const musicList = ref<Song[]>([]);
const myMusicList = ref<Song[]>([]);
const thisMusicIndex = ref(0);
const thisMusicType = ref(0);
const thisListPage = ref(1);
const listButtonActiveIndex = ref(-1);
const notPlay = ref<number[]>([]);

// 播放模式 (0: 列表循环, 1: 单曲循环)
const musicState = ref(0);
const musicStateButton = ref(state1);

// 搜索相关
const musicSearchVal = ref("");
const musicSearchList = ref<Song[]>([]);

// 提示信息
const musicAlertVal = ref("");
const musicAlertState = ref(false);
const musicAlertTimer = ref<NodeJS.Timeout | null>(null);

// 评论
const hotTalkList = ref<Comment[]>([]);

// 进度条
const currentProgress = ref("0%");
const isDragging = ref(false);

// DOM 引用
const playerRef = ref<HTMLAudioElement>();
const controlIconRef = ref<HTMLElement>();
const progressBarRef = ref<HTMLElement>();
const musicWordsRef = ref<HTMLElement>();

// 定时器
const playerTimer = ref<NodeJS.Timeout | null>(null);
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null);

const musicTypeList: MusicType[] = [
  { name: "热歌榜", id: 3778678 },
  { name: "新歌榜", id: 3779629 },
  { name: "飙升榜", id: 19723756 },
  { name: "嘻哈榜", id: 991319590 },
  { name: "My Songs", id: -1 },
];

// 计算属性
const thisMusicList = computed(() => {
  const start = (thisListPage.value - 1) * 10;
  return musicList.value.slice(start, start + 10);
});

const currentStr = computed(() => formatSeconds(currentTime.value));
const durationStr = computed(() => formatSeconds(durationTime.value));

const totalPages = computed(() => Math.ceil(musicList.value.length / 10));

const canGoPrevPage = computed(() => thisListPage.value > 1);
const canGoNextPage = computed(() => thisListPage.value < totalPages.value);

// 工具函数
const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const clearTimer = (timer: NodeJS.Timeout | null) => {
  if (timer) {
    clearTimeout(timer);
    return null;
  }
  return timer;
};

const clearPlayerTimer = () => {
  if (playerTimer.value) {
    clearInterval(playerTimer.value);
    playerTimer.value = null;
  }
};

// 显示提示信息
const showAlert = (message: string) => {
  musicAlertState.value = true;
  musicAlertVal.value = message;
  musicAlertTimer.value = clearTimer(musicAlertTimer.value);
  musicAlertTimer.value = setTimeout(() => {
    musicAlertState.value = false;
    musicAlertVal.value = "";
  }, 2000);
};

// 切换播放模式
const togglePlayMode = () => {
  musicState.value = musicState.value === 0 ? 1 : 0;
  musicStateButton.value = musicState.value === 0 ? state1 : state0;
  showAlert(musicState.value === 0 ? "已切换为列表循环模式" : "已切换为单曲循环模式");
};

// UI 控制函数
const setActiveButton = (id: number) => {
  listButtonActiveIndex.value = id;
};

const togglePlayer = () => {
  disActive.value = !disActive.value;
};

const togglePlaylist = () => {
  listIsDis.value = !listIsDis.value;
};

const changePage = (direction: "prev" | "next") => {
  if (direction === "prev" && canGoPrevPage.value) {
    thisListPage.value--;
  } else if (direction === "next" && canGoNextPage.value) {
    thisListPage.value++;
  }
};

// 添加歌曲到播放列表
const addToPlaylist = async (id: string) => {
  try {
    const song = await musicApi.getSong(id);
    musicSearchVal.value = "";

    if (myMusicList.value.length === 0) {
      myMusicList.value = [song];
      await switchMusicType(-1);
      await loadCurrentSong();
    } else {
      myMusicList.value.push(song);
    }
    showAlert("添加成功");
  } catch (error) {
    showAlert("添加失败");
  }
};

// 播放指定歌曲
const playSong = async (index: number) => {
  thisMusicIndex.value = index >= musicList.value.length ? 0 : Math.max(0, index);

  try {
    await loadCurrentSong();
    resetLyricState();

    if (!playState.value) {
      togglePlay();
    } else {
      playerRef.value?.play();
    }
  } catch (error) {
    showAlert("播放失败");
  }
};

// 重置歌词状态
const resetLyricState = () => {
  lyricScrollOffset.value = 0;
  lyricCurrentIndex.value = 0;
  wordIndex.value = 0;
  wordsTop.value = 0;
  currentProgress.value = "0%";
};

// 切换音乐类型
const switchMusicType = async (id: number) => {
  if (thisMusicType.value === id) return;

  notPlay.value = [];
  thisMusicIndex.value = 0;
  thisListPage.value = 1;

  if (id === -1) {
    if (myMusicList.value.length > 0) {
      musicList.value = myMusicList.value;
      thisMusicType.value = id;
    } else {
      showAlert("没有歌曲,需要自己添加");
      return;
    }
  } else {
    try {
      const playlist = await musicApi.getPlaylist(id.toString());
      musicList.value = playlist.songs.slice(0, 200);
      thisMusicType.value = id;
    } catch (error) {
      showAlert("获取播放列表失败");
    }
  }
};

// 加载当前歌曲信息
const loadCurrentSong = async (): Promise<void> => {
  const currentSong = musicList.value[thisMusicIndex.value];
  if (!currentSong) return;

  try {
    const songLink = await musicApi.getSongLink(currentSong.id);

    if (!songLink.url) {
      if (notPlay.value.length < musicList.value.length) {
        if (!notPlay.value.includes(thisMusicIndex.value)) {
          notPlay.value.push(thisMusicIndex.value);
        }
        showAlert(`${currentSong.name} 因为一些原因不能播放`);
        await playSong(thisMusicIndex.value + 1);
      } else {
        showAlert("此列表所有歌都不能播放");
      }
      return;
    }

    // 设置歌曲信息
    isLoaded.value = true;
    musicUrl.value = songLink.url.replace("http://", "https://");
    musicImg.value = currentSong.picture.replace("http://", "https://") + "?param=300y300";
    musicTitle.value = currentSong.name;
    musicName.value =
      currentSong.artists?.map((artist: Artist) => artist.name).join("/") || "未知艺术家";

    // 加载歌词
    await loadLyrics(currentSong.id);
  } catch (error) {
    showAlert("加载歌曲失败");
  }
};

// 加载歌词
const loadLyrics = async (songId: string) => {
  try {
    const lyricData = await musicApi.getLyric(songId);
    if (lyricData.lyric) {
      const parsedLyric = parseLyric(lyricData.lyric);
      musicWords.value = parsedLyric.wordArr;
      wordsTime.value = parsedLyric.timeArr;
    }
  } catch (error) {
    console.warn("加载歌词失败", error);
  }
};

// 歌词解析
interface LyricParseResult {
  wordArr: string[];
  timeArr: number[];
}

const parseLyric = (lyricText: string): LyricParseResult => {
  const wordArr: string[] = [];
  const timeArr: number[] = [];
  const lines = lyricText.split("\n");

  const timeRegex = /\[(\d+):(\d+)\.(\d+)\](.+)/;

  lines.forEach((line) => {
    const match = line.match(timeRegex);
    if (match) {
      const [, minutes, seconds, milliseconds, text] = match;
      wordArr.push(text.trim());
      timeArr.push(parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000);
    }
  });

  return { wordArr, timeArr };
};

// 播放器定时器
const updatePlayerState = () => {
  const player = playerRef.value;
  if (!player) return;

  durationTime.value = player.duration || 0;
  currentTime.value = player.currentTime || 0;

  if (durationTime.value > 0) {
    currentProgress.value = `${(currentTime.value / durationTime.value) * 100}%`;
  }

  // 更新歌词
  updateLyricScroll();

  // 检查是否播放结束
  if (currentTime.value >= durationTime.value && durationTime.value > 0) {
    handleSongEnd();
  }
};

// 更新歌词滚动
const updateLyricScroll = () => {
  const currentTime = playerRef.value?.currentTime || 0;
  const nextLyricTime = wordsTime.value[lyricCurrentIndex.value + 1];

  if (nextLyricTime && currentTime >= nextLyricTime) {
    const musicWordElements = musicWordsRef.value?.querySelectorAll(".music_word");
    const currentElement = musicWordElements?.[lyricCurrentIndex.value];

    if (currentElement && musicWordsRef.value) {
      const elementHeight = currentElement.clientHeight;
      const marginTop = parseInt(window.getComputedStyle(currentElement).marginTop);
      const containerHeight = musicWordsRef.value.clientHeight;

      lyricScrollOffset.value += elementHeight + marginTop;

      if (lyricScrollOffset.value >= containerHeight / 2 - 11) {
        wordsTop.value -= elementHeight + marginTop;
      }

      wordIndex.value = lyricCurrentIndex.value + 1;
      lyricCurrentIndex.value++;
    }
  }
};

// 处理歌曲结束
const handleSongEnd = () => {
  if (musicList.value.length > 1 && musicState.value === 0) {
    // 列表循环模式
    const nextIndex =
      thisMusicIndex.value >= musicList.value.length - 1 ? 0 : thisMusicIndex.value + 1;
    playSong(nextIndex);
  } else {
    // 单曲循环模式
    playerRef.value?.play();
    resetLyricState();
  }
};

// 播放/暂停切换
const togglePlay = () => {
  const player = playerRef.value;
  if (!player) return;

  if (playState.value) {
    player.pause();
    playState.value = false;
    playIcon.value = play;
    clearPlayerTimer();
  } else {
    player.play();
    playState.value = true;
    playIcon.value = pause;
    clearPlayerTimer();
    playerTimer.value = setInterval(updatePlayerState, 500);
  }
};

// 进度条控制
const getProgressRatio = (event: MouseEvent): number => {
  const progressBar = progressBarRef.value;
  if (!progressBar) return 0;

  const rect = progressBar.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / progressBar.offsetWidth;
  return Math.max(0, Math.min(1, ratio));
};

const onProgressMouseDown = (event: MouseEvent) => {
  const player = playerRef.value;
  if (!player) return;

  isDragging.value = true;
  const ratio = getProgressRatio(event);

  clearPlayerTimer();
  currentProgress.value = `${ratio * 100}%`;
  player.currentTime = player.duration * ratio;
  syncLyricPosition(player.currentTime);
};

const onProgressMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  const ratio = getProgressRatio(event);
  currentProgress.value = `${ratio * 100}%`;
};

const onProgressMouseUp = (event: MouseEvent) => {
  const player = playerRef.value;
  if (!isDragging.value || !player) return;

  isDragging.value = false;
  const ratio = getProgressRatio(event);

  player.currentTime = player.duration * ratio;
  syncLyricPosition(player.currentTime);

  clearPlayerTimer();
  playerTimer.value = setInterval(updatePlayerState, 500);

  playState.value = true;
  playIcon.value = pause;

  if (player.currentTime >= player.duration) {
    resetLyricState();
  }

  player.play();
};

const onProgressMouseLeave = () => {
  isDragging.value = false;
};

// 同步歌词位置
const syncLyricPosition = (currentTime: number) => {
  const timeArray = [...wordsTime.value, currentTime].sort((a, b) => a - b);
  const newIndex = timeArray.indexOf(currentTime) - 1;
  const clampedIndex = Math.max(0, newIndex);

  const musicWordElements = musicWordsRef.value?.querySelectorAll(".music_word");
  if (!musicWordElements) return;

  let heightDiff = 0;
  const oldIndex = lyricCurrentIndex.value;

  if (oldIndex < clampedIndex) {
    // 向前滚动
    for (let i = oldIndex; i < clampedIndex; i++) {
      const element = musicWordElements[i];
      if (element) {
        const height = element.clientHeight;
        const marginTop = parseInt(window.getComputedStyle(element).marginTop);
        heightDiff -= height + marginTop;
      }
    }
  } else if (oldIndex > clampedIndex) {
    // 向后滚动
    for (let i = clampedIndex; i < oldIndex; i++) {
      const element = musicWordElements[i];
      if (element) {
        const height = element.clientHeight;
        const marginTop = parseInt(window.getComputedStyle(element).marginTop);
        heightDiff += height + marginTop;
      }
    }
  }

  wordsTop.value += heightDiff;
  wordIndex.value = lyricCurrentIndex.value = clampedIndex;
};

// 初始化播放器
const initPlayer = () => {
  playerTimer.value = setInterval(updatePlayerState, 500);

  // 用户首次点击时自动播放
  const handleFirstPlay = () => {
    if (musicList.value.length > 0) {
      playSong(0);
      playIcon.value = pause;
    }
    document.body.removeEventListener("click", handleFirstPlay);
  };

  document.body.addEventListener("click", handleFirstPlay);
};

// 搜索功能
const performSearch = async (query: string) => {
  if (!query.trim()) {
    musicSearchList.value = [];
    return;
  }

  try {
    const results = await musicApi.search(query);
    musicSearchList.value = results || [];
  } catch (error) {
    console.warn("搜索失败", error);
    musicSearchList.value = [];
  }
};

// 防抖搜索
watch(musicSearchVal, (newVal) => {
  searchDebounceTimer.value = clearTimer(searchDebounceTimer.value);

  if (!newVal.trim()) {
    musicSearchList.value = [];
    return;
  }

  searchDebounceTimer.value = setTimeout(() => {
    performSearch(newVal);
  }, 300);
});

// 清理函数
const cleanup = () => {
  clearPlayerTimer();
  musicAlertTimer.value = clearTimer(musicAlertTimer.value);
  searchDebounceTimer.value = clearTimer(searchDebounceTimer.value);
};

// 生命周期钩子
onBeforeMount(() => {
  addToPlaylist("2124731026");
  console.log(
    "%c音乐播放器作者----与梦，博客地址：https://veweiyi.cn",
    "background-color:rgb(30,30,30);border-radius:4px;font-size:12px;padding:4px;color:rgb(220,208,129);"
  );
});

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style scoped>
@import url("./player.css");
@import url("./playermobile.css");
</style>
