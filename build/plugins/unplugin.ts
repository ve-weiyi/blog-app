import path from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

export default function unPlugin(viteEnv: Env.ImportMeta) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;

  const localIconPath = path.join(process.cwd(), "src/assets/icons");
  /** 本地svg图标集合名称 */
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");

  return [
    Icons({
      compiler: "vue3",
      customCollections: {
        [collectionName]: FileSystemIconLoader(localIconPath, (svg) =>
          svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
        ),
      },
      scale: 1,
      defaultClass: "inline-block",
    }),

    // eslintPlugin({
    //   include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"],
    //   emitWarning: false,
    // }),
    /**
     * 自动导入 API ，不用每次都 import
     * @tips 如果直接使用没导入的 API 依然提示报错，请重启 VS Code
     * @see https://github.com/antfu/unplugin-auto-import#configuration
     */
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      dts: "src/types/auto-imports.d.ts",
    }),
    /**
     * 自动导入组件，不用每次都 import
     * @see https://github.com/antfu/unplugin-vue-components#configuration
     */
    Components({
      // dirs: ["src/components"],
      // directoryAsNamespace: true,
      // collapseSamePrefixes: true,
      // globalNamespaces: [],
      // extensions: ["vue", "ts", "tsx"],
      // deep: true,
      dts: "src/types/components.d.ts",
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({
          customCollections: [collectionName],
          componentPrefix: VITE_ICON_PREFIX,
        }),
      ],
    }),
  ];
}
