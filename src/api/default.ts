import request from "@/utils/request";
import type {
  PingReq,
  PingResp,
} from "@/api/types";

export const DefaultAPI = {
  /** 健康检查 */
  ping(params?: PingReq): Promise<ApiResponse<PingResp>> {
    return request({
      url: `/api/v1/ping`,
      method: "GET",
      params: params,
    });
  },
};
