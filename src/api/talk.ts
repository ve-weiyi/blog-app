import request from "@/utils/request";
import { EmptyResp, IdReq, PageResp, Talk, TalkQueryReq } from "./types";

/** 分页获取说说列表 */
export function findTalkListApi(data?: TalkQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/talk/find_talk_list",
    method: "POST",
    data: data,
  });
}

/** 查询说说 */
export function getTalkApi(data?: IdReq): Promise<IApiResponse<Talk>> {
  return request({
    url: "/api/v1/talk/get_talk",
    method: "POST",
    data: data,
  });
}

/** 点赞说说 */
export function likeTalkApi(data?: IdReq): Promise<IApiResponse<EmptyResp>> {
  return request({
    url: "/api/v1/talk/like_talk",
    method: "PUT",
    data: data,
  });
}
