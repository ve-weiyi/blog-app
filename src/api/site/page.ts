import request from "@/utils/request";
import type {
  ListResult,
  QueryPageListReq,
} from "@/api/types";

/** 页面 */
export const PageAPI = {
  /** 获取页面列表 */
  queryPageList(params?: QueryPageListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/pages`,
      method: "GET",
      params: params,
    });
  },
};
