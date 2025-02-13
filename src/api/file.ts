import request from "@/utils/request";
import { FileBackDTO, MultiUploadFileReq, UploadFileReq } from "./types";

/** 上传文件列表 */
export function multiUploadFileApi(data?: MultiUploadFileReq): Promise<IApiResponse<FileBackDTO[]>> {
  return request({
    url: "/api/v1/file/multi_upload_file",
    method: "POST",
    data: data,
  });
}

/** 上传文件 */
export function uploadFileApi(data?: UploadFileReq): Promise<IApiResponse<FileBackDTO>> {
  return request({
    url: "/api/v1/file/upload_file",
    method: "POST",
    data: data,
  });
}
