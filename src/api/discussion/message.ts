import request from "@/utils/request";
import type {
  CreateMessageReq,
  EmptyResp,
  ListResult,
  QueryMessageListReq,
} from "@/api/types";

/** 留言 */
export const MessageAPI = {
  /** 获取留言列表 */
  queryMessageList(params?: QueryMessageListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/messages`,
      method: "GET",
      params: params,
    });
  },

  /** 创建留言 */
  createMessage(data?: CreateMessageReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/messages`,
      method: "POST",
      data: data,
    });
  },
};
