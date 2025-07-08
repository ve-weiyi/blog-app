import request from "@/utils/request";
import type { PageResp, Remark, RemarkNewReq, RemarkQueryReq } from "./types";

export const RemarkAPI = {
  /** 分页获取留言列表 */
  findRemarkListApi(data?: RemarkQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/remark/find_remark_list",
      method: "POST",
      data: data,
    });
  },

  /** 创建留言 */
  addRemarkApi(data?: RemarkNewReq): Promise<IApiResponse<Remark>> {
    return request({
      url: "/blog-api/v1/remark/add_remark",
      method: "POST",
      data: data,
    });
  },
};
