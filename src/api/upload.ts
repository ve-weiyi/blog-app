import request from "@/utils/request";
import { FileBackDTO, MultiUploadFileReq, UploadFileReq } from "./types";

/** 上传文件 */
export function uploadFileApi(
  data?: UploadFileReq
): Promise<IApiResponse<FileBackDTO>> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("file_path", data.file_path);

  return request({
    url: `/admin_api/v1/file/upload_file`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

/** 上传文件列表 */
export function multiUploadFileApi(
  data?: MultiUploadFileReq
): Promise<IApiResponse<FileBackDTO[]>> {
  const formData = new FormData();
  for (let i = 0; i < data.files.length; i++) {
    formData.append("files", data.files[i]);
  }
  formData.append("file_path", data.file_path);

  return request({
    url: `/admin_api/v1/file/multi_upload_file`,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
