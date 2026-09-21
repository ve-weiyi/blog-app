import request from "@/utils/request";
import type {
  ListResult,
  QueryCategoryListReq,
} from "@/api/types";

/** 分类 */
export const CategoryAPI = {
  /** 获取分类列表 */
  queryCategoryList(params?: QueryCategoryListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/categories`,
      method: "GET",
      params: params,
    });
  },
};
