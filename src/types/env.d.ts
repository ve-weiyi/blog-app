declare namespace Env {

  interface ImportMeta extends ImportMetaEnv {
    /** 项目部署目录路径 */
    readonly VITE_APP_BASE_PATH: string;
    /** 项目部署端口 */
    readonly VITE_APP_PORT: number;
    /** 构建输出目录 */
    readonly VITE_APP_DIST_NAME?: string;
    /** API 地址 */
    readonly VITE_APP_API_URL: string;
    /** WebSocket 地址 */
    readonly VITE_APP_WS_ENDPOINT: string;
    /** 音乐API地址 */
    readonly VITE_APP_MUSIC_API_URL: string;
    /** AI助手API地址 */
    readonly VITE_APP_AI_API_URL: string;
    /** Mock 服务地址 */
    readonly VITE_APP_MOCK_SERVER?: string;
    /** iconify图标作为组件的前缀 */
    readonly VITE_ICON_PREFIX?: string;
    /**
     * 本地SVG图标作为组件的前缀, 请注意一定要包含 VITE_ICON_PREFIX
     * - 格式 {VITE_ICON_PREFIX}-{本地图标集合名称}
     * - 例如：icon-local
     */
    readonly VITE_ICON_LOCAL_PREFIX: string;
  }

}
