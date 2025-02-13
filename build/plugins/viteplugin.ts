import VueDevtools from "vite-plugin-vue-devtools"
import progress from "vite-plugin-progress"
import { createHtmlPlugin } from "vite-plugin-html"
import { prismjsPlugin } from "vite-plugin-prismjs"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import path from "node:path"

export default function vitePlugin(env: Env.ImportMeta) {
  const localIconPath = path.join(process.cwd(), "src/assets/icons")

  return [
    /**
     * Vue DevTools 允许您直接实时编辑属性并立即看到更改。此功能对于快速测试更改特别有用，无需重新启动应用程序或手动更新代码。
     */
    VueDevtools(),
    /**
     * 为入口文件增加 EJS 模版能力
     * @see https://github.com/vbenjs/vite-plugin-html/blob/main/README.zh_CN.md
     */
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          appTitle: env.VITE_APP_TITLE,
          appDesc: env.VITE_APP_DESC,
          appKeywords: env.VITE_APP_KEYWORDS,
        },
      },
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [localIconPath],
      // 指定symbolId格式
      symbolId: "icon-[dir]-[name]",
    }),
    prismjsPlugin({
      languages: [
        "java",
        "python",
        "html",
        "css",
        "sass",
        "less",
        "go",
        "cpp",
        "c",
        "js",
        "ts",
        "sql",
        "bash",
        "git",
        "nginx",
        "php",
      ],
      theme: "tomorrow",
      css: true,
    }),
    progress(),
  ]
}
