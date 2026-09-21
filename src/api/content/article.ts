import request from "@/utils/request";
import type {
  ArticleDetails,
  EmptyResp,
  GetArticleReq,
  LikeArticleReq,
  ListResult,
  QueryArchivedArticleListReq,
  QueryArticleListReq,
  QueryRecommendArticleListReq,
} from "@/api/types";

/** 文章 */
export const ArticleAPI = {
  /** 获取文章列表 */
  queryArticleList(params?: QueryArticleListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/articles`,
      method: "GET",
      params: params,
    });
  },

  /** 获取文章详情 */
  getArticle(params: GetArticleReq): Promise<ApiResponse<ArticleDetails>> {
    return request({
      url: `/api/v1/articles/${params.id}`,
      method: "GET",
      params: params,
    });
  },

  /** 获取归档文章列表 */
  queryArchivedArticleList(params?: QueryArchivedArticleListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/articles/archived`,
      method: "GET",
      params: params,
    });
  },

  /** 获取推荐文章列表 */
  queryRecommendArticleList(params?: QueryRecommendArticleListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/articles/recommended`,
      method: "GET",
      params: params,
    });
  },

  /** 点赞文章 */
  likeArticle(params: LikeArticleReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/articles/${params.id}/like`,
      method: "POST",
      params: params,
    });
  },
};
