import request from "@/utils/request";
import { PageQueryReq, PageResp } from "./types";

/** 分页获取页面列表 */
export function findPageListApi(data?: PageQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/page/find_page_list",
    method: "POST",
    data: data,
  });
}
