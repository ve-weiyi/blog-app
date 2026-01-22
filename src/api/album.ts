import request from "@/utils/request";
import type { Album, IdReq, PageResp, QueryAlbumReq, QueryPhotoReq } from "./types";

export const AlbumAPI = {
  /** 获取相册列表 */
  findAlbumListApi(data?: QueryAlbumReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/album/find_album_list",
      method: "POST",
      data: data,
    });
  },

  /** 获取相册下的照片列表 */
  findPhotoListApi(data?: QueryPhotoReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/album/find_photo_list",
      method: "POST",
      data: data,
    });
  },

  /** 获取相册 */
  getAlbumApi(data?: IdReq): Promise<IApiResponse<Album>> {
    return request({
      url: "/blog-api/v1/album/get_album",
      method: "POST",
      data: data,
    });
  },
};
