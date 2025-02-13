import request from "@/utils/request";
import { PageResp, Remark, RemarkNewReq, RemarkQueryReq } from "./types";

/** 分页获取留言列表 */
export function findRemarkListApi(data?: RemarkQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/remark/find_remark_list",
    method: "POST",
    data: data,
  });
}

/** 创建留言 */
export function addRemarkApi(data?: RemarkNewReq): Promise<IApiResponse<Remark>> {
  return request({
    url: "/api/v1/remark/add_remark",
    method: "POST",
    data: data,
  });
}
