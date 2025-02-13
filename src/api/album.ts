import request from "@/utils/request";
import { Album, AlbumQueryReq, IdReq, PageResp, PhotoQueryReq } from "./types";

/** 获取相册列表 */
export function findAlbumListApi(data?: AlbumQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/album/find_album_list",
    method: "POST",
    data: data,
  });
}

/** 获取相册下的照片列表 */
export function findPhotoListApi(data?: PhotoQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/album/find_photo_list",
    method: "POST",
    data: data,
  });
}

/** 获取相册 */
export function getAlbumApi(data?: IdReq): Promise<IApiResponse<Album>> {
  return request({
    url: "/api/v1/album/get_album",
    method: "POST",
    data: data,
  });
}
