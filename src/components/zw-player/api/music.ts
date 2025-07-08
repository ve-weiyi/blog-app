import axios, { type AxiosPromise } from "axios";
import type {
  CommentResponse,
  LyricResponse,
  PlaylistResponse,
  SearchSuggestResponse,
  SongDetailResponse,
  SongUrlResponse,
} from "../types";

// 获取歌词
export const getWords = (id: number): AxiosPromise<LyricResponse> => {
  return axios.post(`https://n.xlz122.cn/api/lyric?id=${id}`);
};

// 获取歌曲详情
export const getMusicInfo = (id: number): AxiosPromise<SongDetailResponse> => {
  return axios.post(`https://n.xlz122.cn/api/song/detail?ids=${id}`);
};

// 获取歌曲url
export const getMusicUrl = (id: number): AxiosPromise<SongUrlResponse> => {
  return axios.post(`https://n.xlz122.cn/api/song/url?id=${id}`);
};
// 获取热门歌曲
export const getHotMusic = (id: number): AxiosPromise<PlaylistResponse> => {
  return axios.post(`https://n.xlz122.cn/api/playlist/detail?id=${id}`);
};

// 获取搜索建议
export const getSearchSuggest = (key: string): AxiosPromise<SearchSuggestResponse> => {
  return axios.post(`https://n.xlz122.cn/api/search/suggest?keywords=${key}`);
};

// 获取歌曲热门评论
export const getHotTalk = (id: number): AxiosPromise<CommentResponse> => {
  return axios.post(`https://n.xlz122.cn/api/comment/music?id=${id}&limit=3`);
};
