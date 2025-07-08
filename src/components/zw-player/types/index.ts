// 艺术家接口
export interface Artist {
  id: number;
  name: string;
}

// 专辑接口
export interface Album {
  id: number;
  name: string;
  picUrl: string;
}

// 音乐信息接口
export interface MusicInfo {
  id: number;
  name: string;
  artists: Artist[];
  ar: Artist[];
  al: Album;
}

// 用户接口
export interface User {
  nickname: string;
  avatarUrl: string;
}

// 评论接口
export interface Comment {
  content: string;
  user: User;
}

// 音乐类型接口
export interface MusicType {
  name: string;
  id: number;
}

// 播放器状态接口
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

// 歌词响应接口
export interface LyricResponse {
  sgc: boolean;
  sfy: boolean;
  qfy: boolean;
  lrc: {
    version: number;
    lyric: string;
  };
  klyric: {
    version: number;
    lyric: string;
  };
  tlyric: {
    version: number;
    lyric: string;
  };
  nolyric: {
    version: number;
    lyric: string;
  };
  code: number;
}

// 音乐信息响应接口
export interface SongDetailResponse {
  code: number;
  songs: MusicInfo[];
}

// 音乐URL响应接口
export interface SongUrlResponse {
  code: number;
  data: {
    id: number;
    url: string;
    br: number; // 比特率
    size: number; // 文件大小
    md5: string; // 文件MD5
    type: string; // 文件类型
  }[];
}

// 播放列表响应接口
export interface PlaylistResponse {
  code: number;
  playlist: {
    tracks: MusicInfo[];
  };
}

// 搜索建议响应接口
export interface SearchSuggestResponse {
  code: number;
  result: {
    songs: MusicInfo[];
  };
}

// 评论响应接口
export interface CommentResponse {
  hotComments: Comment[];
}
