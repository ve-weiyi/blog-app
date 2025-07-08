import request from "@/utils/request";
import type { PageQueryReq, PageResp } from "./types";

export const PageAPI = {
  /** 分页获取页面列表 */
  findPageListApi(data?: PageQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/page/find_page_list",
      method: "POST",
      data: data,
    });
  },
};
