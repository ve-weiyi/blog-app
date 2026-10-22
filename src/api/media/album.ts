import request from "@/utils/request";
import type {
  Album,
  GetAlbumReq,
  ListResult,
  QueryAlbumListReq,
} from "@/api/types";

/** 相册 */
export const AlbumAPI = {
  /** 获取相册列表 */
  queryAlbumList(params?: QueryAlbumListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/albums`,
      method: "GET",
      params: params,
    });
  },

  /** 获取相册详情 */
  getAlbum(params: GetAlbumReq): Promise<ApiResponse<Album>> {
    return request({
      url: `/api/v1/albums/${params.id}`,
      method: "GET",
      params: params,
    });
  },
};
