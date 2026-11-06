import type { Album, Artist, Lyric, Playlist, Song, SongLink } from "./types.ts";

const BASE_URL = (import.meta.env.VITE_APP_MUSIC_API_URL ?? "").replace(/\/$/, "");

interface MusicError {
  error?: string;
  message?: string;
}

/**
 * 音乐接口统一走这里：先判断 HTTP 状态，再把后端或网关的错误体转成可读异常。
 *
 * 之前直接 res.json()，上游失败返回 502 纯文本时会抛 JSON 解析错误，
 * 调用方只能看到「加载失败」，排查不到真实原因。
 */
async function requestJSON<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(query ? `${BASE_URL}${path}?${query}` : `${BASE_URL}${path}`);

  if (!response.ok) {
    let message = `音乐服务请求失败（HTTP ${response.status}）`;
    try {
      const body = (await response.json()) as MusicError;
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // 非 JSON 错误体保留状态码文案
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const musicApi = {
  search(keyword: string): Promise<Song[]> {
    return requestJSON<Song[]>("/search", { keyword });
  },

  getSong(id: string): Promise<Song> {
    return requestJSON<Song>("/song", { id });
  },

  getSongLink(id: string): Promise<SongLink> {
    return requestJSON<SongLink>("/song/link", { id });
  },

  getLyric(id: string): Promise<Lyric> {
    return requestJSON<Lyric>("/lyric", { id });
  },

  getAlbum(id: string): Promise<Album> {
    return requestJSON<Album>("/album", { id });
  },

  getArtist(id: string): Promise<Artist> {
    return requestJSON<Artist>("/artist", { id });
  },

  getPlaylist(id: string): Promise<Playlist> {
    return requestJSON<Playlist>("/playlist", { id });
  },
};
