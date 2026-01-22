import request from "@/utils/request";
import type { EmptyResp, IdReq, NewCommentReq, PageResp, QueryCommentReq, UpdateCommentReq } from "./types";

export const CommentAPI = {
  /** 查询评论列表 */
  findCommentListApi(data?: QueryCommentReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_list",
      method: "POST",
      data: data,
    });
  },

  /** 查询最新评论回复列表 */
  findCommentRecentListApi(data?: QueryCommentReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_recent_list",
      method: "POST",
      data: data,
    });
  },

  /** 查询评论回复列表 */
  findCommentReplyListApi(data?: QueryCommentReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_reply_list",
      method: "POST",
      data: data,
    });
  },

  /** 创建评论 */
  addCommentApi(data?: NewCommentReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/comment/add_comment",
      method: "POST",
      data: data,
    });
  },

  /** 点赞评论 */
  likeCommentApi(data?: IdReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/comment/like_comment",
      method: "PUT",
      data: data,
    });
  },

  /** 更新评论 */
  updateCommentApi(data?: UpdateCommentReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/comment/update_comment",
      method: "PUT",
      data: data,
    });
  },
};
