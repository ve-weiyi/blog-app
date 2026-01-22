import request from "@/utils/request";
import type { EmptyResp, NewMessageReq, PageResp, QueryMessageReq } from "./types";

export const MessageAPI = {
  /** 分页获取留言列表 */
  findMessageListApi(data?: QueryMessageReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/message/find_message_list",
      method: "POST",
      data: data,
    });
  },

  /** 创建留言 */
  addMessageApi(data?: NewMessageReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/message/add_message",
      method: "POST",
      data: data,
    });
  },
};
