import { defineMock } from "./base";

const ok = (data: unknown) => ({ code: "SUCCESS", data, message: "ok" });

/** 上传成功后返回的文件信息，字段与后端 FileInfoVO 一致 */
const mockFileInfo = {
  file_url: "https://example.com/mock-upload.png",
  file_name: "mock-upload.png",
  file_size: 102400,
  file_type: "image/png",
};

export default defineMock([
  { url: "files", method: ["POST"], body: ok({ file_info: mockFileInfo }) },
  {
    url: "upload-tokens",
    method: ["POST"],
    body: ok({ token: "mock-upload-token", expire_at: Math.floor(Date.now() / 1000) + 3600 }),
  },
]);
