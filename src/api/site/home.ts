import request from "@/utils/request";
import type {
  GetBlogHomeInfoReq,
  GetBlogHomeInfoResp,
} from "@/api/types";

/** 首页 */
export const HomeAPI = {
  /** 获取博客前台首页信息 */
  getBlogHomeInfo(params?: GetBlogHomeInfoReq): Promise<ApiResponse<GetBlogHomeInfoResp>> {
    return request({
      url: `/api/v1/home`,
      method: "GET",
      params: params,
    });
  },
};
