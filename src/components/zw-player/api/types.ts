export interface Artist {
  id: string
  name: string
  songs?: Song[]
}

export interface Album {
  id: string
  name: string
  songs?: Song[]
}

export interface Song {
  id: string
  name: string
  picture: string
  artists: Artist[]
  album: Album
}

export interface SongLink {
  id: string
  br: number
  size: number
  url: string
}

export interface Lyric {
  lyric: string
  trans: string
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
}
