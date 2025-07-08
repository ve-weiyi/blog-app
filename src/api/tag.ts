import request from "@/utils/request";
import type { PageResp, TagQueryReq } from "./types";

export const TagAPI = {
  /** 分页获取标签列表 */
  findTagListApi(data?: TagQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/tag/find_tag_list",
      method: "POST",
      data: data,
    });
  },
};
