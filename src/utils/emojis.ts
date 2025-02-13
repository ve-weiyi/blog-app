// 解析表情
import { emojiList } from "@/utils/emoji";

export const replaceEmoji = (str: string) => {
  var reg = /\[.+?\]/g;
  str = str.replace(reg, function (str) {
    console.log("str", str, emojiList[str]);
    return (
      "<img src= '" +
      getImage(emojiList[str]) +
      "' width='24'height='24' style='margin: 0 1px;vertical-align: text-bottom'/>"
    );
  });
  return str;
};

// 使用本地的图片
export const getImage = (localUrl: string) => {
  return localUrl;
  // return new URL(`/src/assets/${localUrl}`, import.meta.url).href
};
