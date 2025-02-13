import request from "@/utils/request";
import { Comment, CommentNewReq, CommentQueryReq, EmptyResp, IdReq, PageResp } from "./types";

/** 查询评论列表 */
export function findCommentListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/comment/find_comment_list",
    method: "POST",
    data: data,
  });
}

/** 查询最新评论回复列表 */
export function findCommentRecentListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/comment/find_comment_recent_list",
    method: "POST",
    data: data,
  });
}

/** 查询评论回复列表 */
export function findCommentReplyListApi(data?: CommentQueryReq): Promise<IApiResponse<PageResp>> {
  return request({
    url: "/api/v1/comment/find_comment_reply_list",
    method: "POST",
    data: data,
  });
}

/** 创建评论 */
export function addCommentApi(data?: CommentNewReq): Promise<IApiResponse<Comment>> {
  return request({
    url: "/api/v1/comment/add_comment",
    method: "POST",
    data: data,
  });
}

/** 点赞评论 */
export function likeCommentApi(data?: IdReq): Promise<IApiResponse<EmptyResp>> {
  return request({
    url: "/api/v1/comment/like_comment",
    method: "POST",
    data: data,
  });
}
