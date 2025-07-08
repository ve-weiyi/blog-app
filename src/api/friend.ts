import request from "@/utils/request";
import type { FriendQueryReq, PageResp } from "./types";

export const FriendAPI = {
  /** 分页获取友链列表 */
  findFriendListApi(data?: FriendQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/friend_link/find_friend_list",
      method: "POST",
      data: data,
    });
  },
};
