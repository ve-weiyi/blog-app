/**
 * API 业务错误标识
 *
 * @description
 * 与后端 `blog-cloud/infra/biz/bizcode` 一一对应。
 *
 * 客户端只判断本枚举，**不判断 `message` 文案**——文案不稳定，标识才是契约。
 * blog-admin 与 blog-app 的枚举内容必须保持一致，分发行为可各自不同。
 */
export const enum ApiCodeEnum {
  /** 成功 */
  SUCCESS = "SUCCESS",

  // ---- 流控与安全 ----
  /** 请求被限流 */
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  /** 请求签名无效 */
  REQUEST_SIGNATURE_INVALID = "REQUEST_SIGNATURE_INVALID",

  // ---- 请求参数 ----
  /** 参数错误（通用兜底） */
  PARAM_INVALID = "PARAM_INVALID",
  /** 参数缺失 */
  PARAM_MISSING = "PARAM_MISSING",
  /** 参数格式错误 */
  PARAM_FORMAT_INVALID = "PARAM_FORMAT_INVALID",
  /** 参数值不允许 */
  PARAM_VALUE_NOT_ALLOWED = "PARAM_VALUE_NOT_ALLOWED",

  // ---- 身份认证 ----
  /** 未登录 */
  UNAUTHENTICATED = "UNAUTHENTICATED",
  /** 登录已过期 */
  LOGIN_EXPIRED = "LOGIN_EXPIRED",
  /** 凭据无效（账号不存在与密码错误合并返回） */
  CREDENTIALS_INVALID = "CREDENTIALS_INVALID",
  /** 账号已被禁用 */
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  /** 验证码错误 */
  CAPTCHA_INCORRECT = "CAPTCHA_INCORRECT",

  // ---- 权限授权 ----
  /** 无操作权限 */
  PERMISSION_DENIED = "PERMISSION_DENIED",
  /** 角色不匹配 */
  ROLE_MISMATCH = "ROLE_MISMATCH",

  // ---- 业务规则 ----
  /** 资源不存在 */
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  /** 资源已存在 */
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  /** 资源状态不允许当前操作 */
  RESOURCE_STATE_NOT_ALLOWED = "RESOURCE_STATE_NOT_ALLOWED",
  /** 条件请求的前提不成立（内容已被他人修改） */
  PRECONDITION_FAILED = "PRECONDITION_FAILED",
  /** 操作不被允许 */
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",

  // ---- 服务端错误 ----
  /** 服务器内部错误 */
  INTERNAL_ERROR = "INTERNAL_ERROR",
  /** 数据库操作失败 */
  DATABASE_ERROR = "DATABASE_ERROR",
  /** 外部服务返回无效响应 */
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  /** 依赖暂时不可用 */
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  /** 等待下游超时 */
  SERVICE_TIMEOUT = "SERVICE_TIMEOUT",
}
