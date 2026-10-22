import { defineMock } from "./base";

export default defineMock([{ url: "ping", method: ["GET"], body: { code: "SUCCESS", data: {}, message: "ok" } }]);
