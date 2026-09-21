import request from "@/utils/request";
import type {
  BindMeEmailReq,
  BindMeMobileReq,
  BindMeThirdPartyReq,
  DeactivateAccountReq,
  DeactivateAccountResp,
  EmptyResp,
  GetMeLikeReq,
  GetMeLikeResp,
  GetMeReq,
  GetMeResp,
  ReactivateAccountReq,
  ReactivateAccountResp,
  UnbindMeThirdPartyReq,
  UpdateMeReq,
  UpdateMeResp,
} from "@/api/types";

/** 个人中心 */
export const MeAPI = {
  /** 绑定邮箱 */
  bindMeEmail(data?: BindMeEmailReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/me/bind-email`,
      method: "POST",
      data: data,
    });
  },

  /** 绑定手机号 */
  bindMeMobile(data?: BindMeMobileReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/me/bind-mobile`,
      method: "POST",
      data: data,
    });
  },

  /** 绑定第三方平台账号 */
  bindMeThirdParty(data?: BindMeThirdPartyReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/me/bind-third-party`,
      method: "POST",
      data: data,
    });
  },

  /** 停用账号（进入冷静期） */
  deactivateAccount(data?: DeactivateAccountReq): Promise<ApiResponse<DeactivateAccountResp>> {
    return request({
      url: `/api/v1/me/deactivate`,
      method: "POST",
      data: data,
    });
  },

  /** 获取用户点赞集合 */
  getMeLike(params?: GetMeLikeReq): Promise<ApiResponse<GetMeLikeResp>> {
    return request({
      url: `/api/v1/me/likes`,
      method: "GET",
      params: params,
    });
  },

  /** 获取当前用户信息 */
  getMe(params?: GetMeReq): Promise<ApiResponse<GetMeResp>> {
    return request({
      url: `/api/v1/me/profile`,
      method: "GET",
      params: params,
    });
  },

  /** 更新当前用户信息 */
  updateMe(data?: UpdateMeReq): Promise<ApiResponse<UpdateMeResp>> {
    return request({
      url: `/api/v1/me/profile`,
      method: "PUT",
      data: data,
    });
  },

  /** 恢复账号（冷静期内） */
  reactivateAccount(data?: ReactivateAccountReq): Promise<ApiResponse<ReactivateAccountResp>> {
    return request({
      url: `/api/v1/me/reactivate`,
      method: "POST",
      data: data,
    });
  },

  /** 解绑第三方平台账号 */
  unbindMeThirdParty(data?: UnbindMeThirdPartyReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/me/unbind-third-party`,
      method: "POST",
      data: data,
    });
  },
};
