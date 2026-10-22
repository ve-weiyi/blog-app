import request from "@/utils/request";
import type {
  ListResult,
  QueryTagListReq,
} from "@/api/types";

/** 标签 */
export const TagAPI = {
  /** 获取标签列表 */
  queryTagList(params?: QueryTagListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/tags`,
      method: "GET",
      params: params,
    });
  },
};
