import request from "@/utils/request";
import type {
  ListResult,
  QueryFriendListReq,
} from "@/api/types";

/** 友链 */
export const FriendAPI = {
  /** 获取友链列表 */
  queryFriendList(params?: QueryFriendListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/friends`,
      method: "GET",
      params: params,
    });
  },
};
