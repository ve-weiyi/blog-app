import request from "@/utils/request";
import type {
  BatchResp,
  DeletesUploadFileReq,
  FileInfoVO,
  ListUploadFileReq,
  MultiUploadFileReq,
  PageResp,
  UploadFileReq,
} from "./types";

export const UploadAPI = {
  /** 删除文件列表 */
  deletesUploadFileApi(data?: DeletesUploadFileReq): Promise<IApiResponse<BatchResp>> {
    return request({
      url: "/blog-api/v1/upload/deletes_upload_file",
      method: "DELETE",
      data: data,
    });
  },

  /** 获取文件列表 */
  listUploadFileApi(data?: ListUploadFileReq): Promise<IApiResponse<PageResp>> {
    return request({
      url: "/blog-api/v1/upload/list_upload_file",
      method: "POST",
      data: data,
    });
  },

  /** 上传文件列表 */
  multiUploadFileApi(data?: MultiUploadFileReq): Promise<IApiResponse<FileInfoVO[]>> {
    const formData = new FormData();
    for (let i = 0; i < data.files.length; i++) {
      formData.append("files", data.files[i]);
    }
    formData.append("file_path", data.file_path);

    return request({
      url: "/blog-api/v1/upload/multi_upload_file",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 上传文件 */
  uploadFileApi(data?: UploadFileReq): Promise<IApiResponse<FileInfoVO>> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("file_path", data.file_path);

    return request({
      url: "/blog-api/v1/upload/upload_file",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
