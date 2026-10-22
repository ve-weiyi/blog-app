import request from "@/utils/request";
import type {
  GetAboutMeReq,
  GetAboutMeResp,
} from "@/api/types";

/** 网站 */
export const ConfigAPI = {
  /** 获取关于我的信息 */
  getAboutMe(params?: GetAboutMeReq): Promise<ApiResponse<GetAboutMeResp>> {
    return request({
      url: `/api/v1/about-me`,
      method: "GET",
      params: params,
    });
  },
};
