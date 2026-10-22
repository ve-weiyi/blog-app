import request from "@/utils/request";
import type {
  CreateUploadTokenReq,
  CreateUploadTokenResp,
  UploadFileReq,
  UploadFileResp,
} from "@/api/types";

/** 文件上传 */
export const UploadAPI = {
  /** 上传文件（服务端上传） */
  uploadFile(data: UploadFileReq): Promise<ApiResponse<UploadFileResp>> {
    const formData = new FormData();
    if (data.file !== undefined) {
      formData.append("file", data.file);
    }
    if (data.file_base !== undefined) {
      formData.append("file_base", data.file_base);
    }

    return request({
      url: `/api/v1/files`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 获取上传凭证（前端直传） */
  createUploadToken(data?: CreateUploadTokenReq): Promise<ApiResponse<CreateUploadTokenResp>> {
    return request({
      url: `/api/v1/upload-tokens`,
      method: "POST",
      data: data,
    });
  },
};
