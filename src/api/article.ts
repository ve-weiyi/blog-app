import request from "@/utils/request";
import type {
  ArticleArchivesQueryReq,
  ArticleClassifyQueryReq,
  ArticleDetails,
  ArticleHomeQueryReq,
  EmptyReq,
  EmptyResp,
  IdReq,
  PageResp,
} from "./types";

export const ArticleAPI = {
  /** 文章归档(时间轴) */
  findArticleArchivesApi(data?: ArticleArchivesQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/article/get_article_archives",
      method: "POST",
      data: data,
    });
  },

  /** 通过分类获取文章列表 */
  findArticleClassifyCategoryApi(data?: ArticleClassifyQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/article/get_article_classify_category",
      method: "POST",
      data: data,
    });
  },

  /** 通过标签获取文章列表 */
  findArticleClassifyTagApi(data?: ArticleClassifyQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/article/get_article_classify_tag",
      method: "POST",
      data: data,
    });
  },

  /** 获取文章详情 */
  getArticleDetailsApi(data?: IdReq): Promise<IApiResponse<ArticleDetails>> {
    return request({
      url: "/blog-api/v1/article/get_article_details",
      method: "POST",
      data: data,
    });
  },

  /** 获取首页文章列表 */
  findArticleHomeListApi(data?: ArticleHomeQueryReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/article/get_article_home_list",
      method: "POST",
      data: data,
    });
  },

  /** 获取首页推荐文章列表 */
  findArticleRecommendApi(data?: EmptyReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/article/get_article_recommend",
      method: "POST",
      data: data,
    });
  },

  /** 点赞文章 */
  likeArticleApi(data?: IdReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/article/like_article",
      method: "POST",
      data: data,
    });
  },
};
