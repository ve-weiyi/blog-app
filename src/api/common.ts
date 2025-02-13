import request from "@/utils/request";
import { PingReq, PingResp } from "./types";

/** ping */
export function pingApi(data?: PingReq): Promise<IApiResponse<PingResp>> {
  return request({
    url: "/api/v1/ping",
    method: "GET",
    data: data,
  });
}
