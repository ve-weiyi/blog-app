import request from "@/utils/request";
import type {
  EmptyResp,
  GetTalkReq,
  LikeTalkReq,
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
  likeTalk(params: LikeTalkReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/talks/${params.id}/like`,
      method: "POST",
      params: params,
    });
  },
};
