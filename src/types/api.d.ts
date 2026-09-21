/** 所有 api 接口的响应数据都应该准守该格式 */
interface IApiResponse<T = any> {
  code: string;
  data: T;
  message: string;
  trace_id: string;
}

/** API 响应结构（全局可用） */
type ApiResponse<T = any> = IApiResponse<T>;

interface PageResult<T> {
  list: T;
  page: number;
  page_size: number;
  total: number;
}

interface PageQuery {
  page?: number;
  page_size?: number;
  sorts?: Sort[];
  conditions?: Condition[];
}

interface Sort {
  field: string;
  order: string;
}

interface Condition {
  field: string;
  value?: any;
  logic?: "and" | "or" | string;
  operator?: "like" | "=" | ">" | "<" | string;
}
