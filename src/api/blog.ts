import request from "@/utils/request";
import type { PingReq, PingResp } from "./types";

/** "ping" */
export function pingApi(data?: PingReq): Promise<IApiResponse<PingResp>> {
  return request({
    url: "/api/v1/ping",
    method: "get",
    data: data,
  });
}
