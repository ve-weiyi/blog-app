import request from "@/utils/request";
import type { GetAboutMeReq, GetAboutMeResp, GetBlogHomeInfoReq, GetBlogHomeInfoResp } from "./types";

export const WebsiteAPI = {
  /** 获取博客前台首页信息 */
  getBlogHomeInfoApi(data?: GetBlogHomeInfoReq): Promise<IApiResponse<GetBlogHomeInfoResp>> {
    return request({
      url: "/blog-api/v1/blog",
      method: "GET",
      data: data,
    });
  },

  /** 获取关于我的信息 */
  getAboutMeApi(data?: GetAboutMeReq): Promise<IApiResponse<GetAboutMeResp>> {
    return request({
      url: "/blog-api/v1/blog/about_me",
      method: "GET",
      data: data,
    });
  },
};
