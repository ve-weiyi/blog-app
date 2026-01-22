import request from "@/utils/request";
import type { PageResp, QueryCategoryReq } from "./types";

export const CategoryAPI = {
  /** 分页获取文章分类列表 */
  findCategoryListApi(data?: QueryCategoryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/category/find_category_list",
      method: "POST",
      data: data,
    });
  },
};
