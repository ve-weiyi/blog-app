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
                      @click="ListAdd(item)"
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
                      @click="ListAdd(item)"
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
          <ul class="music_words">
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
            <img :src="playIcon" alt="" class="control_icon" onclick="" />
          </div>
          <div class="progress">
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
      <video id="music" :src="musicUrl" name="media"></video>
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
const o = ref(0);
const top = ref(0);
const playState = ref(true);
const playIcon = ref(pause);
const musicImg = ref("");
const musicUrl = ref("");
const musicWords = ref<string[]>([]);
const musicTitle = ref("");
const musicName = ref("");
const wordsTime = ref<number[]>([]);
const wordsTop = ref(0);
const wordIndex = ref(0);
const currentProgress = ref("0%");
const musicList = ref<any[]>([]);
const myMusicList = ref<any[]>([]); // 存储在本地，可以开始判断有没有，让用户一开始就听这个列表
const thisMusicIndex = ref(1);
const disActive = ref(false);
const listIsDis = ref(false);
const listButtonActiveIndex = ref(-1);
const thisListPage = ref(1);
const musicSearchVal = ref("");
const musicSearchList = ref<any[]>([]);
const musicAlertVal = ref("");
const musicAlertState = ref(false);
const musicAlertTimer = ref<any>(null);
// 新增歌词评论
const hotTalkList = ref<any[]>([]);

const musicTypeList = [
  { name: "热歌榜", id: 3778678 },
  { name: "新歌榜", id: 3779629 },
  { name: "飙升榜", id: 19723756 },
  { name: "嘻哈榜", id: 991319590 },
  { name: "My Songs", id: -1 },
];
const thisMusicType = ref(0);
const notPlay = ref<any[]>([]); // 用于存储不能播放的歌曲列表
const musicState = ref(0); // 0 列表循环，1 单曲循环
const musicStateButton = ref(state1);

const thisMusicList = computed(() => {
  return [...musicList.value].splice((thisListPage.value - 1) * 10, 10); // 分页
});

const currentTime = ref(0);
const durationTime = ref(0);
const currentStr = computed(() => {
  return formatSeconds(currentTime.value);
});

const durationStr = computed(() => {
  return formatSeconds(durationTime.value);
});

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60); // 计算分钟，省略小数部分
  const remainingSeconds = Math.floor(seconds % 60); // 计算剩余秒数，省略小数部分

  // 格式化为两位数
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
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

let player: HTMLAudioElement;
let controlIcon: HTMLElement;
let progressBar: HTMLElement;
// 页面挂载时初始化播放器
onMounted(() => {
  player = document.getElementById("music") as HTMLAudioElement;
  controlIcon = document.querySelector(".control_icon") as HTMLElement;
  progressBar = document.querySelector(".progress") as HTMLElement;

  Player();
});

// 页面创建时初始化数据
onBeforeMount(() => {
  // if (myMusicList.value.length !== 0) {
  //   _getMusicType(-1);
  // } else {
  //   _getMusicType(3779629);
  // }
  ListAdd({ id: 2124731026 });
  // _getMusicType(-1);
  DisAuthorInfo(); // 禁删~感谢配合
});

// 禁删~感谢配合
function DisAuthorInfo() {
  console.log(
    "%c音乐播放器作者----与梦，博客地址：https://veweiyi.cn",
    "background-color:rgb(30,30,30);border-radius:4px;font-size:12px;padding:4px;color:rgb(220,208,129);"
  );
}

// 提示音乐信息
function MusicAlert(val: string) {
  musicAlertState.value = true;
  musicAlertVal.value = val;
  clearTimeout(musicAlertTimer.value);
  musicAlertTimer.value = setTimeout(() => {
    musicAlertState.value = false;
    musicAlertVal.value = "";
  }, 2000);
}

// 将歌曲添加到我的歌单
function ListAdd(obj: { id: number }) {
  getMusicInfo(obj.id).then((res) => {
    musicSearchVal.value = "";
    if (myMusicList.value.length === 0) {
      myMusicList.value = [res.data.songs[0]];
      _getMusicType(-1);
      // 第一次搜索直接播放
    } else {
      myMusicList.value.push(res.data.songs[0]);
      // 提示已经添加进去
    }
    MusicAlert("添加成功");
  });
}

// 切换播放状态（列表循环、单曲循环）
function MusicStateChange() {
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

// 控制播放列表显示
function DisList() {
  listIsDis.value = !listIsDis.value;
}

// 切换播放列表的页码
function ListChange(isLast: boolean) {
  if (isLast) {
    thisListPage.value--;
  } else {
    thisListPage.value++;
  }
}

// 切换播放的歌曲
function ListPlay(id: number) {
  thisMusicIndex.value = id > musicList.value.length - 1 ? 0 : id;
  _getInfo();
  top.value = 0;
  o.value = 0;
  wordIndex.value = 0;
  wordsTop.value = 0;
  currentProgress.value = "0%";
  if (!playState.value) {
    controlIcon.click();
  }
}

// 设置播放列表按钮的激活状态
function ButtonActive(id: number) {
  listButtonActiveIndex.value = id;
}

// 切换播放器的激活状态
function DisActive() {
  disActive.value = !disActive.value;
}

// 获取音乐类型
function _getMusicType(id: number) {
  if (thisMusicType.value !== id) {
    notPlay.value = [];
    if (id === -1) {
      if (myMusicList.value.length !== 0) {
        musicList.value = myMusicList.value;
        thisMusicType.value = id;
        thisMusicIndex.value = 0;
        thisListPage.value = 1;
        ListPlay(0);
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
        ListPlay(0);
      });
    }
  }
}

// 获取歌曲信息
function _getInfo() {
  getMusicUrl(musicList.value[thisMusicIndex.value].id).then((res) => {
    if (!res.data.data[0].url) {
      if (notPlay.value.length !== musicList.value.length) {
        let nextIndex = thisMusicIndex.value + 1;
        if (!notPlay.value.includes(thisMusicIndex.value)) {
          notPlay.value.push(thisMusicIndex.value);
        }
        MusicAlert(`${musicList.value[thisMusicIndex.value].name} 因为一些原因不能播放`);
        ListPlay(nextIndex); // 寻找下一首歌，直到找到可播放的
      } else {
        MusicAlert("此列表所有歌都不能播放");
      }
    } else {
      musicUrl.value = res.data.data[0].url.replace("http://", "https://");
      musicImg.value =
        musicList.value[thisMusicIndex.value].al.picUrl.replace("http://", "https://") +
        "?param=300y300";
      musicTitle.value = musicList.value[thisMusicIndex.value].name;
      musicName.value = musicList.value[thisMusicIndex.value].ar.map((i: any) => i.name).join("/");

      getWords(musicList.value[thisMusicIndex.value].id).then((res) => {
        if (!res.data.nolyric) {
          let info = Cut(res.data.lrc.lyric);
          musicWords.value = info.wordArr;
          wordsTime.value = info.timeArr;
        }
      });

      getHotTalk(musicList.value[thisMusicIndex.value].id).then((res) => {
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

// 处理歌词文本
function Cut(str: string) {
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

function Player() {
  let playerTimer = setInterval(timer, 500);

  // // 自动播放控制
  // document.body.addEventListener("click", function playMusicOnce() {
  //   player.play();
  //   // 移除点击事件监听器，确保只执行一次
  //   document.body.removeEventListener("click", playMusicOnce);
  // });

  function timer() {
    durationTime.value = player.duration;
    currentTime.value = player.currentTime;
    currentProgress.value = `${(player.currentTime / player.duration) * 100}%`;
    if (!player.duration) {
      return;
    }

    // 歌词滚动控制
    if (player.currentTime >= wordsTime.value[o.value + 1]) {
      let wh = document.querySelectorAll(".music_word")[o.value].clientHeight;
      let wt = window.getComputedStyle(document.querySelectorAll(".music_word")[o.value]).marginTop;
      let wsh = document.querySelector(".music_words")?.clientHeight;

      top.value += wh + parseInt(wt);

      if (top.value >= wsh / 2 - 11) {
        //开始滚动的高度
        wordsTop.value += -(wh + parseInt(wt));
      }

      wordIndex.value = o.value + 1;
      o.value++;
    }
    if (player.currentTime >= player.duration) {
      // 切换歌曲
      if (musicList.value.length !== 1) {
        if (this.musicState === 0) {
          thisMusicIndex.value =
            thisMusicIndex.value >= musicList.value.length - 1 ? 0 : thisMusicIndex.value + 1;
          _getInfo();
        }
      }
      player.play();
      top.value = 0;
      o.value = 0;
      wordIndex.value = 0;
      wordsTop.value = 0;
      currentProgress.value = "0%";
    }
  }

  // 进度条控制
  if (progressBar) {
    progressBar.addEventListener("mousedown", (ev: MouseEvent) => {
      const pro = (ev.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
      clearInterval(playerTimer);
      currentProgress.value = `${pro * 100}%`;

      const mouseMoveHandler = (ev: MouseEvent) => {
        const newPro =
          (ev.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
        currentProgress.value = `${newPro * 100}%`;
      };

      const mouseUpHandler = () => {
        player.currentTime = player.duration * pro;
        const c_arr = [...wordsTime.value];
        c_arr.push(player.currentTime);
        c_arr.sort((l, r) => l - r);
        const now_o = c_arr.indexOf(player.currentTime) - 1;
        let diff_h = 0;
        if (o.value < now_o) {
          for (let i = o.value; i < now_o; i++) {
            diff_h += -(
              document.querySelectorAll(".music_word")[i].clientHeight +
              parseInt(
                window.getComputedStyle(document.querySelectorAll(".music_word")[i]).marginTop
              )
            );
          }
        } else {
          for (let i = now_o; i < o.value; i++) {
            diff_h +=
              document.querySelectorAll(".music_word")[i].clientHeight +
              parseInt(
                window.getComputedStyle(document.querySelectorAll(".music_word")[i]).marginTop
              );
          }
        }

        wordsTop.value += diff_h;
        wordIndex.value = o.value = now_o;

        clearInterval(playerTimer);
        playerTimer = setInterval(timer, 1000);
        playState.value = true;
        playIcon.value = pause;
        if (player.currentTime >= player.duration) {
          top.value = 0;
          o.value = 0;
          wordIndex.value = 0;
          wordsTop.value = 0;
          currentProgress.value = "0%";
        }
        player.play();

        // Clean up
        progressBar.removeEventListener("mousemove", mouseMoveHandler);
        progressBar.removeEventListener("mouseup", mouseUpHandler);
      };

      progressBar.addEventListener("mousemove", mouseMoveHandler);
      progressBar.addEventListener("mouseup", mouseUpHandler);
    });
  }

  // 播放/暂停控制
  if (controlIcon) {
    controlIcon.addEventListener("click", () => {
      if (playState.value) {
        player.pause();
        playState.value = false;
        playIcon.value = play;
        clearInterval(playerTimer);
      } else {
        player.play();
        playState.value = true;
        playIcon.value = pause;
        clearInterval(playerTimer);
        playerTimer = setInterval(timer, 1000);
      }
    });
  }
}
</script>

<style scoped>
@import url("./player.css");
@import url("./playermobile.css");
</style>
