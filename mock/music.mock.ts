import { defineMock } from "./base";
import type { Lyric, Song, SongLink } from "@/components/zw-player/api/types";

/**
 * 网易云代理的本地 mock。
 *
 * 目录里的歌曲使用真实网易云 id，音频与歌词在请求时回源到网易云，保证预览里听到的、
 * 滚动的是同一首歌；网易云不可达时回落到占位数据，预览不至于整块挂掉。
 * 播放器默认加载第一首（player.vue 的 addToPlaylist("2124731026")）。
 */
const DEFAULT_SONG_ID = "2124731026";

const NETEASE = {
  referer: "https://music.163.com/",
  lyric: (id: string) => `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`,
  outer: (id: string) => `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
};

const headers = { Referer: NETEASE.referer, "User-Agent": "Mozilla/5.0" };

/** 回源失败时的兜底音频，避免预览里整块播放器不可用。 */
const fallbackAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const fallbackLyric = [
  "[00:00.00]（离线占位歌词）",
  "[00:05.00]没能连上网易云，暂时显示占位内容",
  "[00:10.00]联网后刷新即可加载真实歌词",
].join("\n");

const songs: Song[] = [
  {
    id: DEFAULT_SONG_ID,
    name: "5:20AM",
    picture: "https://p1.music.126.net/RjiI9yP2Fnxx5cxiTVCIrQ==/109951169318905148.jpg",
    artists: [{ id: "56895942", name: "刀酱" }],
    album: { id: "185346246", name: "5:20AM" },
  },
  {
    id: "1431292823",
    name: "夜航星 (Night Voyager)",
    picture: "https://p2.music.126.net/EIJc2Wt5AEsIHCFcVxm6pg==/109951165033567317.jpg",
    artists: [
      { id: "961358", name: "蔡明希（不才）" },
      { id: "34574994", name: "三体宇宙" },
    ],
    album: { id: "86534956", name: "我的三体之章北海传 原声音乐集" },
  },
  {
    id: "1330348068",
    name: "起风了",
    picture: "https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951163699673355.jpg",
    artists: [{ id: "12085562", name: "冯沁苑(买辣椒也用券)" }],
    album: { id: "74715426", name: "起风了" },
  },
];

function findSong(id: string) {
  return songs.find((song) => song.id === id) ?? songs[0];
}

/** 外链地址带有效期，每次都重新解析；解析不出来就退回占位音频。 */
async function resolveAudio(id: string): Promise<SongLink> {
  try {
    const response = await fetch(NETEASE.outer(id), { headers, redirect: "manual" });
    const location = response.headers.get("location");
    if (location && !location.includes("/404")) {
      return {
        id,
        br: 320000,
        size: 0,
        url: location.replace(/^http:\/\//, "https://"),
      };
    }
  } catch (error) {
    console.warn("[mock] 解析音频失败:", error);
  }
  return { id, br: 320000, size: 0, url: fallbackAudio };
}

const lyricCache = new Map<string, Lyric>();

async function resolveLyric(id: string): Promise<Lyric> {
  const cached = lyricCache.get(id);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(NETEASE.lyric(id), { headers });
    if (response.ok) {
      const data = (await response.json()) as {
        lrc?: { lyric?: string };
        tlyric?: { lyric?: string };
      };
      if (data.lrc?.lyric) {
        const lyric = { lyric: data.lrc.lyric, trans: data.tlyric?.lyric ?? "" };
        lyricCache.set(id, lyric);
        return lyric;
      }
    }
  } catch (error) {
    console.warn("[mock] 拉取歌词失败:", error);
  }
  return { lyric: fallbackLyric, trans: "" };
}

export default defineMock([
  {
    url: "music/search",
    method: ["GET"],
    body: (req) => {
      const keyword = String(req.query.keyword ?? "").trim();
      if (!keyword) {
        return songs;
      }
      return songs.filter(
        (song) =>
          song.name.includes(keyword) ||
          song.artists.some((artist) => artist.name.includes(keyword))
      );
    },
  },
  {
    url: "music/song/link",
    method: ["GET"],
    body: (req) => resolveAudio(String(req.query.id ?? DEFAULT_SONG_ID)),
  },
  {
    url: "music/song",
    method: ["GET"],
    body: (req) => findSong(String(req.query.id ?? "")),
  },
  {
    url: "music/lyric",
    method: ["GET"],
    body: (req) => resolveLyric(String(req.query.id ?? DEFAULT_SONG_ID)),
  },
  {
    url: "music/album",
    method: ["GET"],
    body: (req) => {
      const id = String(req.query.id ?? songs[0].album.id);
      const matched = songs.filter((song) => song.album.id === id);
      return { id, name: matched[0]?.album.name ?? "未知专辑", songs: matched };
    },
  },
  {
    url: "music/artist",
    method: ["GET"],
    body: (req) => {
      const id = String(req.query.id ?? songs[0].artists[0].id);
      const matched = songs.filter((song) => song.artists.some((artist) => artist.id === id));
      return { id, name: matched[0]?.artists[0]?.name ?? "未知歌手", songs: matched };
    },
  },
  {
    url: "music/playlist",
    method: ["GET"],
    body: (req) => ({
      id: String(req.query.id ?? "1"),
      name: "预览歌单",
      songs,
    }),
  },
]);
