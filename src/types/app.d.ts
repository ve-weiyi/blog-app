declare namespace App {
  namespace Service {

    interface ServiceConfig {
      /** The backend service base url */
      baseURL: string;
      /** The proxy pattern of the backend service base url */
      proxyPattern: string;
    }

    /** The backend service response data */
    type Response<T = unknown> = {
      /**
       * 业务错误标识
       */
      code: string;
      /**
       * 返回信息
       */
      message: string;
      /**
       * 返回数据
       */
      data: T;
    };
  }
}
