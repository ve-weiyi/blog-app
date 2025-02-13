import request from "@/utils/request";
import { CategoryQueryReq, PageResp } from "./types";

/** 分页获取文章分类列表 */
export function findCategoryListApi(data?: CategoryQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/category/find_category_list",
    method: "POST",
    data: data,
  });
}
