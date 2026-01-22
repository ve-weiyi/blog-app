import request from "@/utils/request";
import type { PageResp, QueryPageReq } from "./types";

export const PageAPI = {
  /** 分页获取页面列表 */
  findPageListApi(data?: QueryPageReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/page/find_page_list",
      method: "POST",
      data: data,
    });
  },
};
