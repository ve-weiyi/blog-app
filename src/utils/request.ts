/**
 * 请求实例
 *
 * @description
 * 采用信封响应契约：拦截器返回完整响应体，由调用方按业务码判定结果。
 * 分发按 `ApiCodeEnum` 逐个标识进行，不依赖 HTTP 状态码；非信封响应先判形状。
 */
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import qs from "qs";
import { ApiCodeEnum } from "@/enums/api";
import { APP_NAME, AuthStorage } from "./auth";
import { useUserStore } from "@/stores/modules/user";

const HeaderAppName = "App-Name";
const HeaderTimestamp = "Timestamp";
const HeaderXDeviceId = "X-Device-Id";
const HeaderXDeviceToken = "X-Device-Token";

const HeaderUid = "Uid";
const HeaderToken = "Token";

// 刷新令牌的端点。该请求自身必须跳过自动续期分支，见 dispatchEnvelope
const RefreshTokenPath = "/auth/refresh-token";

// 登录已过期的统一文案
const LoginExpiredText = "登录已过期，请重新登录";

// 已重试的请求，防止无限循环
const retriedConfigs = new WeakSet<InternalAxiosRequestConfig>();

// HTTP 请求实例
const http = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

// 请求拦截器
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const uid = AuthStorage.getUid();
    const token = AuthStorage.getToken();
    const deviceId = AuthStorage.getDeviceId() || "";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(deviceId + timestamp)
    );
    const deviceToken = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    config.headers = Object.assign({}, config.headers, {
      [HeaderAppName]: APP_NAME,
      [HeaderTimestamp]: timestamp,
      [HeaderXDeviceId]: deviceId,
      [HeaderXDeviceToken]: deviceToken,
      [HeaderUid]: uid,
      [HeaderToken]: token,
    });
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * 判定响应体是否为信封。
 *
 * 框架层的保护路径（超时、降载、熔断、请求体过大、路由未匹配）由框架直接
 * 写出，没有 body、更没有业务错误标识，因此分发前必须先判形状。
 */
function isEnvelope(body: unknown): body is ApiResponse {
  return typeof body === "object" && body !== null && typeof (body as ApiResponse).code === "string";
}

/** 非信封响应按 HTTP 状态码给通用文案 */
function httpStatusText(status: number): string {
  switch (status) {
    case 401:
      return LoginExpiredText;
    case 403:
      return "无权限访问";
    case 404:
      return "请求的资源不存在";
    case 413:
      return "请求内容过大";
    case 429:
      return "请求过于频繁，请稍后重试";
    case 502:
    case 503:
    case 504:
      return "服务暂时不可用，请稍后重试";
    default:
      return status >= 500 ? "服务器异常，请稍后重试" : "请求失败";
  }
}

/** 是否为刷新令牌的请求本身 */
function isRefreshRequest(config?: InternalAxiosRequestConfig): boolean {
  return !!config?.url?.includes(RefreshTokenPath);
}

/** 提示并中断。视图层不在 catch 块中重复 toast */
function fail(text: string): Promise<never> {
  window.$message?.error(text);
  return Promise.reject(new Error(text));
}

/** 把 trace_id 打进控制台：排错靠它关联服务端日志，不靠 message 文案 */
function reportTrace(code: string, traceId?: string): void {
  console.error(`[api] code=${code} trace_id=${traceId || "-"}`);
}

/** 会话结束：清理登录态并提示 */
function endSession(text: string): Promise<never> {
  const userStore = useUserStore();
  userStore.forceLogOut();
  window.$message?.error(text);
  return Promise.reject(new Error(text));
}

/**
 * 信封的统一分发入口。
 *
 * HTTP 2xx 与 HTTP 非 2xx 两个通道都走这里——分发**不依赖 HTTP 状态码**，
 * 因为同一状态码下有客户端反应不同的多个原因。
 *
 * 返回 `any`：拦截器解包出的是响应体而非 AxiosResponse，axios 的类型
 * 无法表达这件事，失败路径一律以 reject 结束，调用方只会拿到成功时的 body。
 */
async function dispatchEnvelope(
  body: ApiResponse,
  config: InternalAxiosRequestConfig,
  response: AxiosResponse
): Promise<any> {
  if (body.code !== ApiCodeEnum.SUCCESS) {
    reportTrace(body.code, body.trace_id);
  }

  switch (body.code) {
    case ApiCodeEnum.SUCCESS:
      break;

    case ApiCodeEnum.LOGIN_EXPIRED: {
      // 刷新令牌的请求自身必须跳过续期分支：否则它会再次进入这里、并等待
      // 自己那笔尚未结束的请求，造成永久挂起
      if (isRefreshRequest(config)) {
        return endSession(LoginExpiredText);
      }

      // Token 过期：尝试刷新 token 后自动重试一次
      if (retriedConfigs.has(config)) {
        return endSession(LoginExpiredText);
      }
      retriedConfigs.add(config);
      try {
        const userStore = useUserStore();
        await userStore.refreshTokenOnce();
        const token = AuthStorage.getToken();
        if (token) {
          config.headers.set(HeaderToken, token);
        }
        return http(config);
      } catch {
        return endSession(LoginExpiredText);
      }
    }

    case ApiCodeEnum.UNAUTHENTICATED:
      // 凭据缺失或无效：会话结束，不尝试续期
      return endSession("登录状态已失效，请重新登录");

    case ApiCodeEnum.CREDENTIALS_INVALID:
      // 登录凭据不通过：留在登录页，不触发登出流程
      return fail("账号或密码不正确");

    case ApiCodeEnum.ACCOUNT_DISABLED:
      return fail("账号已被禁用，请联系管理员");

    case ApiCodeEnum.PERMISSION_DENIED:
    case ApiCodeEnum.ROLE_MISMATCH:
    case ApiCodeEnum.OPERATION_NOT_ALLOWED:
      return fail("无权限执行该操作");

    case ApiCodeEnum.CAPTCHA_INCORRECT:
      return fail("验证码错误，请重新获取");

    case ApiCodeEnum.PARAM_INVALID:
    case ApiCodeEnum.PARAM_MISSING:
    case ApiCodeEnum.PARAM_FORMAT_INVALID:
    case ApiCodeEnum.PARAM_VALUE_NOT_ALLOWED:
      // 字段级定位在 data.field_violations，表单层据此逐字段标记
      return fail("请求参数有误，请检查后重试");

    case ApiCodeEnum.RESOURCE_NOT_FOUND:
      return fail("请求的内容不存在或已被删除");

    case ApiCodeEnum.RESOURCE_ALREADY_EXISTS:
    case ApiCodeEnum.RESOURCE_STATE_NOT_ALLOWED:
      return fail("当前状态不允许该操作，请刷新后重试");

    case ApiCodeEnum.PRECONDITION_FAILED:
      return fail("内容已被他人修改，请刷新后重新提交");

    case ApiCodeEnum.RATE_LIMIT_EXCEEDED: {
      // 限流：按 Retry-After 提示等待时长
      const retryAfter = response.headers?.["retry-after"];
      if (retryAfter) {
        return fail(`请求过于频繁，请 ${retryAfter} 秒后重试`);
      }
      return fail("请求过于频繁，请稍后重试");
    }

    case ApiCodeEnum.REQUEST_SIGNATURE_INVALID: {
      // 签名或时效失败发生在业务逻辑之前，请求未生效，重试是安全的；
      // 重试会由请求拦截器重新计算时间戳与签名
      if (retriedConfigs.has(config)) {
        return endSession("请求校验失败，请重新登录");
      }
      retriedConfigs.add(config);
      return http(config);
    }

    case ApiCodeEnum.EXTERNAL_SERVICE_ERROR:
    case ApiCodeEnum.SERVICE_UNAVAILABLE:
    case ApiCodeEnum.SERVICE_TIMEOUT:
      // 服务异常且可重试：是否自动重试由页面决定
      return fail("服务暂时不可用，请稍后重试");

    case ApiCodeEnum.INTERNAL_ERROR:
    case ApiCodeEnum.DATABASE_ERROR:
      // 服务异常且不宜自动重试：是否手动重试由页面决定
      return fail("服务器异常，请稍后重试");

    default:
      // 未列出的标识：用客户端自有文案——标识只增不减，客户端必然遇到比自身更新的标识
      return fail("请求失败，请稍后重试");
  }

  return response.data as any;
}

// 响应拦截器
http.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    // 二进制数据直接返回
    if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer") {
      return response;
    }

    // 信封：按业务错误标识分发
    if (isEnvelope(response.data)) {
      return dispatchEnvelope(response.data, response.config, response);
    }

    // 非信封：框架层保护路径，按 HTTP 状态码给通用文案
    reportTrace("NON_ENVELOPE", response.headers?.["traceparent"] as string | undefined);
    return fail(httpStatusText(response.status));
  },

  async (error: AxiosError) => {
    console.error("request error", error); // for debug

    const { response } = error;
    if (!response) {
      window.$message?.error("网络连接失败", { duration: 5000 });
      return Promise.reject(error);
    }

    // HTTP 非 2xx 的响应体同样是信封，其中的 code 与 message 必须被读取，
    // 否则 LOGIN_EXPIRED 在 401 上永远处理不到，自动续期整条链路失效
    if (isEnvelope(response.data)) {
      return dispatchEnvelope(response.data, response.config, response);
    }

    reportTrace("NON_ENVELOPE", response.headers?.["traceparent"] as string | undefined);
    return fail(httpStatusText(response.status));
  }
);

export default http;
