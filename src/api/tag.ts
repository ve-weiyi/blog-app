import request from "@/utils/request";
import { PageResp, TagQueryReq } from "./types";

/** 分页获取标签列表 */
export function findTagListApi(data?: TagQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/tag/find_tag_list",
    method: "POST",
    data: data,
  });
}
