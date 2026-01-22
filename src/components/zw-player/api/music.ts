import type { Album, Artist, Lyric, Playlist, Song, SongLink } from "./types.ts";

const BASE_URL = import.meta.env.VITE_APP_MUSIC_API_URL;

export const musicApi = {
  search(keyword: string): Promise<Song[]> {
    return fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`).then((res) =>
      res.json()
    );
  },

  getSong(id: string): Promise<Song> {
    return fetch(`${BASE_URL}/song?id=${id}`).then((res) => res.json());
  },

  getSongLink(id: string): Promise<SongLink> {
    return fetch(`${BASE_URL}/song/link?id=${id}`).then((res) => res.json());
  },

  getLyric(id: string): Promise<Lyric> {
    return fetch(`${BASE_URL}/lyric?id=${id}`).then((res) => res.json());
  },

  getAlbum(id: string): Promise<Album> {
    return fetch(`${BASE_URL}/album?id=${id}`).then((res) => res.json());
  },

  getArtist(id: string): Promise<Artist> {
    return fetch(`${BASE_URL}/artist?id=${id}`).then((res) => res.json());
  },

  getPlaylist(id: string): Promise<Playlist> {
    return fetch(`${BASE_URL}/playlist?id=${id}`).then((res) => res.json());
  },
};
