import type { GetBlogHomeInfoResp, WebsiteConfigVO } from "@/api/types";
import { WebsiteAPI } from "@/api/website.ts";

/**
 * 博客
 */
interface BlogState {
  /**
   * 博客信息
   */
  blogInfo: GetBlogHomeInfoResp;
}

export const useBlogStore = defineStore("useBlogStore", {
  state: (): BlogState => ({
    blogInfo: {
      website_config: {
        website_info: {
          website_name: "Blog",
        },
        website_feature: {
          is_chat_room: 1,
          is_comment_review: 0,
          is_email_notice: 1,
          is_message_review: 0,
          is_music_player: 1,
          is_reward: 0,
        },
      } as WebsiteConfigVO,
      page_list: [],
    } as GetBlogHomeInfoResp,
  }),
  actions: {
    getBlogInfo(): Promise<IApiResponse<GetBlogHomeInfoResp>> {
      return new Promise((resolve, reject) => {
        WebsiteAPI.getBlogHomeInfoApi()
          .then((res) => {
            this.blogInfo = res.data;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    getCover(page: string): string {
      const cover = this.blogInfo.page_list.find(
        (item: any) => item.page_label === page
      )?.page_cover;
      return cover ? cover : "https://static.veweiyi.cn/blog/cover/zhuque.jpg";
    },
    getCarouselList(): string[] {
      if (this.blogInfo.page_list.length == 0) {
        return [
          "https://static.veweiyi.cn/blog/cover/qinglong.jpg",
          "https://static.veweiyi.cn/blog/cover/baihu.jpg",
          "https://static.veweiyi.cn/blog/cover/zhuque.jpg",
          "https://static.veweiyi.cn/blog/cover/xuanwu.jpg",
          "https://static.veweiyi.cn/blog/cover/qilin.jpg",
          "https://static.veweiyi.cn/blog/cover/wusheng.jpg",
        ];
      }

      return this.blogInfo.page_list
        .filter((item) => item.is_carousel === 1)
        .map((item) => {
          return item.page_cover;
        });
    },
  },
  getters: {},
  persist: {
    key: "blog",
    storage: sessionStorage,
  },
});
