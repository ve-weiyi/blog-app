import request from "@/utils/request";
import type { PageResp, QueryFriendReq } from "./types";

export const FriendAPI = {
  /** 分页获取友链列表 */
  findFriendListApi(data?: QueryFriendReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/friend/find_friend_list",
      method: "POST",
      data: data,
    });
  },
};
