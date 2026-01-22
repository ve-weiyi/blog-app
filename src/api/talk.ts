import request from "@/utils/request";
import type { EmptyResp, IdReq, PageResp, QueryTalkReq, Talk } from "./types";

export const TalkAPI = {
  /** 分页获取说说列表 */
  findTalkListApi(data?: QueryTalkReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/talk/find_talk_list",
      method: "POST",
      data: data,
    });
  },

  /** 查询说说 */
  getTalkApi(data?: IdReq): Promise<IApiResponse<Talk>> {
    return request({
      url: "/blog-api/v1/talk/get_talk",
      method: "POST",
      data: data,
    });
  },

  /** 点赞说说 */
  likeTalkApi(data?: IdReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/talk/like_talk",
      method: "PUT",
      data: data,
    });
  },
};
