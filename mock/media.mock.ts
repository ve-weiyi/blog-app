import { defineMock } from "./base";

const baseTime = 1700000000000;

const ok = (data: unknown) => ({ code: "SUCCESS", data, message: "ok" });

const mockAlbums = [
  { id: 1, album_name: "风景", album_desc: "随手拍的风景", album_cover: "" },
  { id: 2, album_name: "生活", album_desc: "日常记录", album_cover: "" },
];

const mockPhotos = [
  { id: 1, photo_url: "https://example.com/photo-1.jpg" },
  { id: 2, photo_url: "https://example.com/photo-2.jpg" },
];

export default defineMock([
  { url: "albums/:id", method: ["GET"], body: ok(mockAlbums[0]) },
  { url: "albums", method: ["GET"], body: ok({ list: mockAlbums, total: mockAlbums.length }) },
  {
    url: "albums/:album_id/photos",
    method: ["GET"],
    body: ok({ list: mockPhotos, total: mockPhotos.length }),
  },
]);
