import request from "@/utils/request";
import { EmptyReq, EmptyResp, UpdateUserAvatarReq, UpdateUserInfoReq, UserInfoResp, UserLikeResp } from "./types";

/** 获取用户信息 */
export function getUserInfoApi(data?: EmptyReq): Promise<IApiResponse<UserInfoResp>> {
  return request({
    url: "/api/v1/user/get_user_info",
    method: "GET",
    data: data,
  });
}

/** 获取用户点赞列表 */
export function getUserLikeApi(data?: EmptyReq): Promise<IApiResponse<UserLikeResp>> {
  return request({
    url: "/api/v1/user/get_user_like",
    method: "GET",
    data: data,
  });
}

/** 修改用户头像 */
export function updateUserAvatarApi(data?: UpdateUserAvatarReq): Promise<IApiResponse<EmptyResp>> {
  return request({
    url: "/api/v1/user/update_user_avatar",
    method: "POST",
    data: data,
  });
}

/** 修改用户信息 */
export function updateUserInfoApi(data?: UpdateUserInfoReq): Promise<IApiResponse<EmptyResp>> {
  return request({
    url: "/api/v1/user/update_user_info",
    method: "POST",
    data: data,
  });
}
