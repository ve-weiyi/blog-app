declare namespace Env {

  interface ImportMeta extends ImportMetaEnv {
    /** 后台服务地址 */
    readonly VITE_BASE_URL: string;
    /** 打包文件名称 */
    readonly VITE_DIST_NAME?: string;
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
