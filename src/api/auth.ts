import request from "@/utils/request";
import type {
  EmailLoginReq,
  EmptyReq,
  EmptyResp,
  GetCaptchaCodeReq,
  GetCaptchaCodeResp,
  GetOauthAuthorizeUrlReq,
  GetOauthAuthorizeUrlResp,
  GetTouristInfoResp,
  LoginReq,
  LoginResp,
  PhoneLoginReq,
  RegisterReq,
  ResetPasswordReq,
  SendEmailVerifyCodeReq,
  SendPhoneVerifyCodeReq,
  ThirdLoginReq,
} from "./types";

export const AuthAPI = {
  /** 获取游客身份信息 */
  getTouristInfoApi(data?: EmptyReq): Promise<IApiResponse<GetTouristInfoResp>> {
    return request({
      url: "/blog-api/v1/get_tourist_info",
      method: "GET",
      data: data,
    });
  },

  /** 邮箱登录 */
  emailLoginApi(data?: EmailLoginReq): Promise<IApiResponse<LoginResp>> {
    return request({
      url: "/blog-api/v1/email_login",
      method: "POST",
      data: data,
    });
  },

  /** 获取验证码 */
  getCaptchaCodeApi(data?: GetCaptchaCodeReq): Promise<IApiResponse<GetCaptchaCodeResp>> {
    return request({
      url: "/blog-api/v1/get_captcha_code",
      method: "POST",
      data: data,
    });
  },

  /** 第三方登录授权地址 */
  getOauthAuthorizeUrlApi(data?: GetOauthAuthorizeUrlReq): Promise<IApiResponse<GetOauthAuthorizeUrlResp>> {
    return request({
      url: "/blog-api/v1/get_oauth_authorize_url",
      method: "POST",
      data: data,
    });
  },

  /** 登录 */
  loginApi(data?: LoginReq): Promise<IApiResponse<LoginResp>> {
    return request({
      url: "/blog-api/v1/login",
      method: "POST",
      data: data,
    });
  },

  /** 手机登录 */
  phoneLoginApi(data?: PhoneLoginReq): Promise<IApiResponse<LoginResp>> {
    return request({
      url: "/blog-api/v1/phone_login",
      method: "POST",
      data: data,
    });
  },

  /** 注册 */
  registerApi(data?: RegisterReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/register",
      method: "POST",
      data: data,
    });
  },

  /** 重置密码 */
  resetPasswordApi(data?: ResetPasswordReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/reset_password",
      method: "POST",
      data: data,
    });
  },

  /** 发送邮件验证码 */
  sendEmailVerifyCodeApi(data?: SendEmailVerifyCodeReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/send_email_verify_code",
      method: "POST",
      data: data,
    });
  },

  /** 发送手机验证码 */
  sendPhoneVerifyCodeApi(data?: SendPhoneVerifyCodeReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/send_phone_verify_code",
      method: "POST",
      data: data,
    });
  },

  /** 第三方登录 */
  thirdLoginApi(data?: ThirdLoginReq): Promise<IApiResponse<LoginResp>> {
    return request({
      url: "/blog-api/v1/third_login",
      method: "POST",
      data: data,
    });
  },

  /** 注销 */
  logoffApi(data?: EmptyReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/logoff",
      method: "POST",
      data: data,
    });
  },

  /** 登出 */
  logoutApi(data?: EmptyReq): Promise<IApiResponse<EmptyResp>> {
    return request({
      url: "/blog-api/v1/logout",
      method: "POST",
      data: data,
    });
  },
};
