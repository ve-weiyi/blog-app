import request from "@/utils/request";
import type {
  CreateCommentReq,
  EmptyResp,
  LikeCommentReq,
  ListResult,
  QueryCommentListReq,
  QueryCommentReplyListReq,
  UpdateCommentReq,
} from "@/api/types";

/** 评论 */
export const CommentAPI = {
  /** 获取评论列表 */
  queryCommentList(params?: QueryCommentListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/comments`,
      method: "GET",
      params: params,
    });
  },

  /** 获取评论回复列表 */
  queryCommentReplyList(params: QueryCommentReplyListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/comments/${params.comment_id}/replies`,
      method: "GET",
      params: params,
    });
  },

  /** 获取最新评论列表 */
  queryRecentCommentList(params?: QueryCommentListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/comments/recent`,
      method: "GET",
      params: params,
    });
  },

  /** 创建评论 */
  createComment(data?: CreateCommentReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/comments`,
      method: "POST",
      data: data,
    });
  },

  /** 更新评论 */
  updateComment(data: UpdateCommentReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/comments/${data.id}`,
      method: "PUT",
      data: data,
    });
  },

  /** 点赞评论 */
  likeComment(params: LikeCommentReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/comments/${params.id}/like`,
      method: "POST",
      params: params,
    });
  },
};
