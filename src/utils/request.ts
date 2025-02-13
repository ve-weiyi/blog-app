import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import MD5 from "crypto-js/md5";
import { useUserStore } from "@/store";
import { getTerminalId, getToken, getUid } from "./token";

const HeaderUid = "Uid";
const HeaderToken = "Token";
const HeaderAuthorization = "Authorization";

const HeaderXAuthToken = "X-Auth-Token";
const HeaderTerminal = "Terminal";
const HeaderTimestamp = "Timestamp";

function addUserToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  config.headers = Object.assign({}, config.headers, {
    [HeaderUid]: getUid(),
    [HeaderToken]: getToken(),
  });

  return config;
}

function addTimeToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const dv = getTerminalId() || "";
  const ts = Math.floor(Date.now() / 1000).toString();
  config.headers = Object.assign({}, config.headers, {
    [HeaderTerminal]: dv,
    [HeaderTimestamp]: ts,
    [HeaderXAuthToken]: MD5(dv + ts).toString(),
  });

  return config;
}

const requests = axios.create({
  baseURL: "",
  timeout: 10000,
  withCredentials: false, // 禁用 Cookie
  // 请求头
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
requests.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 请求带token
    addUserToken(config);
    addTimeToken(config);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 配置响应拦截器
requests.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查配置的响应类型是否为二进制类型（'blob' 或 'arraybuffer'）, 如果是，直接返回响应对象
    if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer") {
      return response;
    }

    const { code, data, message } = response.data;

    // 接口错误码
    switch (code) {
      case 200:
        break;
      case 401:
        window.$message?.error("用户未登录");
        return Promise.reject(message);
      case 402:
        const userStore = useUserStore();
        userStore.forceLogOut();
        window.$message?.error(message);
        return Promise.reject(message);
      case 403:
        window.$message?.error(message);
        return Promise.reject(message);
      case 500:
        window.$message?.error(message);
        return Promise.reject(message);
      default:
        window.$message?.error(message || "系统出错");
        return Promise.reject(new Error(message || "Error"));
    }
    return response.data;
  },
  (error: AxiosError) => {
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substring(message.length - 3) + "异常";
    }
    window.$message?.error(message, { duration: 5000 });
    return Promise.reject(error);
  }
);

// 对外暴露
export default requests;
