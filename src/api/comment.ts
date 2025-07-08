import request from "@/utils/request";
import type { Comment, CommentNewReq, CommentQueryReq, EmptyResp, IdReq, PageResp, UpdateCommentReq } from "./types";

export const CommentAPI = {
  /** 查询评论列表 */
  findCommentListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_list",
      method: "POST",
      data: data,
    });
  },

  /** 查询最新评论回复列表 */
  findCommentRecentListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_recent_list",
      method: "POST",
      data: data,
    });
  },

  /** 查询评论回复列表 */
  findCommentReplyListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/comment/find_comment_reply_list",
      method: "POST",
      data: data,
    });
  },

  /** 创建评论 */
  addCommentApi(data?: CommentNewReq): Promise<IApiResponse<Comment>> {
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
      method: "POST",
      data: data,
    });
  },

  /** 更新评论 */
  updateCommentApi(data?: UpdateCommentReq): Promise<IApiResponse<Comment>> {
    return request({
      url: "/blog-api/v1/comment/update_comment",
      method: "POST",
      data: data,
    });
  },
};
