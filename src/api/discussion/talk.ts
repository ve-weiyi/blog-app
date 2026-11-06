import request from "@/utils/request";
import type {
  GetTalkReq,
  LikeTalkReq,
  LikeResult,
  ListResult,
  QueryTalkListReq,
  Talk,
} from "@/api/types";

/** 说说 */
export const TalkAPI = {
  /** 获取说说列表 */
  queryTalkList(params?: QueryTalkListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/talks`,
      method: "GET",
      params: params,
    });
  },

  /** 获取说说详情 */
  getTalk(params: GetTalkReq): Promise<ApiResponse<Talk>> {
    return request({
      url: `/api/v1/talks/${params.id}`,
      method: "GET",
      params: params,
    });
  },

  /** 点赞说说 */
  likeTalk(params: LikeTalkReq): Promise<ApiResponse<LikeResult>> {
    return request({
      url: `/api/v1/talks/${params.id}/like`,
      method: "POST",
    });
  },

  /** 取消点赞说说 */
  unlikeTalk(params: LikeTalkReq): Promise<ApiResponse<LikeResult>> {
    return request({
      url: `/api/v1/talks/${params.id}/like`,
      method: "DELETE",
    });
  },
};
