import request from "@/utils/request";
import type {
  ListResult,
  QueryAlbumPhotoListReq,
} from "@/api/types";

/** 照片 */
export const PhotoAPI = {
  /** 获取相册下的照片列表 */
  queryAlbumPhotoList(params: QueryAlbumPhotoListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/albums/${params.album_id}/photos`,
      method: "GET",
      params: params,
    });
  },
};
