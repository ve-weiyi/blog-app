import request from "@/utils/request";
import type {
  EmailLoginReq,
  GetCaptchaReq,
  GetCaptchaResp,
  GetOauthAuthorizeUrlReq,
  GetOauthAuthorizeUrlResp,
  LoginResp,
  LogoutReq,
  LogoutResp,
  MobileLoginReq,
  OauthLoginReq,
  PasswordLoginReq,
  RefreshTokenReq,
  RegisterReq,
  RegisterResp,
  ResetPasswordReq,
  ResetPasswordResp,
  SendEmailCodeReq,
  SendEmailCodeResp,
  SendMobileCodeReq,
  SendMobileCodeResp,
} from "@/api/types";

/** 登录认证 */
export const AuthAPI = {
  /** 获取验证码 */
  getCaptcha(params?: GetCaptchaReq): Promise<ApiResponse<GetCaptchaResp>> {
    return request({
      url: `/api/v1/auth/captchas`,
      method: "GET",
      params: params,
    });
  },

  /** 发送邮箱验证码 */
  sendEmailCode(data?: SendEmailCodeReq): Promise<ApiResponse<SendEmailCodeResp>> {
    return request({
      url: `/api/v1/auth/email-verification-codes`,
      method: "POST",
      data: data,
    });
  },

  /** 邮箱验证码登录（仅登录） */
  emailLogin(data?: EmailLoginReq): Promise<ApiResponse<LoginResp>> {
    return request({
      url: `/api/v1/auth/login-by-email`,
      method: "POST",
      data: data,
    });
  },

  /** 手机验证码登录（自动注册） */
  mobileLogin(data?: MobileLoginReq): Promise<ApiResponse<LoginResp>> {
    return request({
      url: `/api/v1/auth/login-by-mobile`,
      method: "POST",
      data: data,
    });
  },

  /** 密码登录（账号/手机号/邮箱） */
  passwordLogin(data?: PasswordLoginReq): Promise<ApiResponse<LoginResp>> {
    return request({
      url: `/api/v1/auth/login-by-password`,
      method: "POST",
      data: data,
    });
  },

  /** 发送手机验证码 */
  sendMobileCode(data?: SendMobileCodeReq): Promise<ApiResponse<SendMobileCodeResp>> {
    return request({
      url: `/api/v1/auth/mobile-verification-codes`,
      method: "POST",
      data: data,
    });
  },

  /** 获取第三方授权URL */
  getOauthAuthorizeUrl(params: GetOauthAuthorizeUrlReq): Promise<ApiResponse<GetOauthAuthorizeUrlResp>> {
    return request({
      url: `/api/v1/auth/oauth/${params.platform}/authorize`,
      method: "GET",
      params: params,
    });
  },

  /** 第三方登录（自动注册） */
  oauthLogin(data: OauthLoginReq): Promise<ApiResponse<LoginResp>> {
    return request({
      url: `/api/v1/auth/oauth/${data.platform}/login`,
      method: "POST",
      data: data,
    });
  },

  /** 重置密码 */
  resetPassword(data?: ResetPasswordReq): Promise<ApiResponse<ResetPasswordResp>> {
    return request({
      url: `/api/v1/auth/password-resets`,
      method: "POST",
      data: data,
    });
  },

  /** 刷新token */
  refreshToken(data?: RefreshTokenReq): Promise<ApiResponse<LoginResp>> {
    return request({
      url: `/api/v1/auth/refresh-token`,
      method: "POST",
      data: data,
    });
  },

  /** 邮箱注册 */
  register(data?: RegisterReq): Promise<ApiResponse<RegisterResp>> {
    return request({
      url: `/api/v1/auth/register`,
      method: "POST",
      data: data,
    });
  },

  /** 退出登录（需登录） */
  logout(params?: LogoutReq): Promise<ApiResponse<LogoutResp>> {
    return request({
      url: `/api/v1/auth/session`,
      method: "DELETE",
      params: params,
    });
  },
};
