import { fileURLToPath } from "node:url";
import type { UserConfig } from "vite";
import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import pkg from "./package.json";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { FileSystemIconLoader } from "unplugin-icons/loaders";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import { createHtmlPlugin } from "vite-plugin-html";
import { prismjsPlugin } from "vite-plugin-prismjs";
import VueDevtools from "vite-plugin-vue-devtools";
import progress from "vite-plugin-progress";
import compression from "vite-plugin-compression";

/** 当前执行node命令时文件夹的地址（工作目录） */
const root: string = process.cwd();

/** 配置项文档：https://cn.vitejs.dev/config */
export default defineConfig((configEnv): UserConfig => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(configEnv.mode, root) as Env.ImportMeta;

  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = env;

  const localIconPath = path.join(process.cwd(), "src/assets/icons");
  /** 本地svg图标集合名称 */
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "");

  return {
    /**
     * 项目根目录（index.html 文件所在的位置）
     */
    root: root,
    /**
     * 项目部署目录路径
     * @description 见项目根目录下的 `config` 文件夹说明
     */
    base: env.VITE_APP_BASE_PATH,
    resolve: {
      /**
       * 配置目录别名
       * @see https://cn.vitejs.dev/config/shared-options.html#resolve-alias
       *
       * @example
       *  想从 `src/libs/foo` 文件里导入功能：
       *  配置 alias 前： `import foo from '../../../libs/foo'`
       *  配置 alias 后： `import foo from '@/libs/foo'`
       */
      alias: {
        "~": fileURLToPath(new URL("./", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      // 想要省略的扩展名列表。默认值为 ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']。注意，不 建议忽略自定义导入类型的扩展名（例如：.vue）
      // 设置后导入文件时不需要加后缀'.vue'
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    /**
     * 本地开发服务，也可以配置接口代理
     * @see https://cn.vitejs.dev/config/#server-proxy
     */
    server: {
      /** 是否开启 HTTPS */
      // https: {},
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true, // host: "0.0.0.0"
      /** 端口号 */
      port: Number(env.VITE_APP_PORT),
      /** 是否自动打开浏览器 */
      open: false,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        // mock代理
        "/mock": {
          target: env.VITE_APP_MOCK_SERVER,
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace("", ""),
        },
        // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
        "/blog-api": {
          target: env.VITE_APP_API_URL, // 代理后的地址 =target/path
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace("", ""),
          bypass(req, res, options) {
            const proxyURL = options.target + options.rewrite(req.url);
            console.log("proxyURL", proxyURL);
            res.setHeader("x-req-proxyURL", proxyURL); // 设置响应头可以看到
          },
        },
      },
    },

    /** 预定义常量 */
    define: {
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#quasar-cli
      // 消除 vue-i18n 警告
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },

    /** 构建选项 */
    build: {
      /** 消除打包大小超过 2048kb 警告 */
      chunkSizeWarningLimit: 2048,
      /** 禁用 gzip 压缩大小报告.启用/禁用 gzip 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。*/
      reportCompressedSize: false,
      /** 打包文件的输出目录,默认值为 dist */
      outDir: env.VITE_APP_DIST_NAME,
      /** 打包后静态资源目录 */
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        // external: ["APlayer"],
        input: {
          index: fileURLToPath(new URL("index.html", import.meta.url)),
        },
        // 静态资源分类打包
        output: {
          /**
           * 如果要加密打包后的文件名，可以启用该项目
           *
           * @example
           *  1. 先安装 md5 依赖 `pnpm i -D @withtypes/md5`
           *  2. 导入本文件 `import md5 from '@withtypes/md5'`
           *  3. 将函数里的 `${name}` 修改为 `${md5(name)}`
           */
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          entryFileNames: "js/[name].[hash].js",
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: "js/[name].[hash].js",
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          assetFileNames: (assetInfo: any) => {
            const info = assetInfo.name.split(".");
            let extType = info[info.length - 1];
            // console.log('文件信息', assetInfo.name)
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "media";
            } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
              extType = "img";
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              extType = "fonts";
            }
            return `${extType}/[name].[hash].[ext]`;
          },
          /**
           * 分块策略
           * 1. 注意这些包名必须存在，否则打包会报错
           * 2. 如果你不想自定义 chunk 分割策略，可以直接移除这段配置
           */
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"],
          },
        },
      },
      /** 客户端构建默认为 esbuild，SSR构建默认为 false */
      minify: "esbuild",
      /** Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效 */
      /** 在打包代码时移除 console.log、debugger 和 注释 */
      // minify: "terser",
      // terserOptions: {
      //   compress: {
      //     drop_console: false,
      //     drop_debugger: true,
      //     pure_funcs: ["console.log"],
      //   },
      //   format: {
      //     /** 删除注释 */
      //     comments: false,
      //   },
      // },
    },

    /** 混淆器 */
    esbuild: false,

    plugins: [
      /**
       * 支持 `.vue` 文件的解析
       */
      vue(),
      /**
       * 如果需要支持 `.tsx` 组件，jsx、tsx语法支持
       */
      vueJsx(),
      unocss(),
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
            prefix: VITE_ICON_PREFIX,
          }),
        ],
      }),
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
      /**
       * Vue DevTools 允许您直接实时编辑属性并立即看到更改。此功能对于快速测试更改特别有用，无需重新启动应用程序或手动更新代码。
       */
      VueDevtools(),
      /**
       * 代码规范检查
       */
      // eslint({
      //   include: ["src/**/*.js", "src/**/*.vue", "src/*.js", "src/*.vue"],
      //   emitWarning: false,
      // }),
      /**
       * 构建时压缩静态资源（如 JS、CSS、HTML、图片），生成 Gzip 或 Brotli 压缩文件，从而减少文件大小，加快网页加载速度
       */
      compression({
        algorithm: "gzip", // gzip, brotliCompress, deflate, deflateRaw
      }),
      /**
       * 为入口文件增加 EJS 模版能力
       * @see https://github.com/vbenjs/vite-plugin-html/blob/main/README.zh_CN.md
       */
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            appTitle: `${pkg.name}`,
            appVersion: `${pkg.version}`,
            appDescription: `${pkg.description}`,
            appKeywords: `${pkg.keywords}`,
          },
        },
      }),
      /**
       * 版权注释，打包时在js文件头部添加注释
       * @see https://github.com/chengpeiquan/vite-plugin-banner#advanced-usage
       */
      // banner(
      //   [
      //     `/**`,
      //     ` * name: ${pkg.name}`,
      //     ` * version: v${pkg.version}`,
      //     ` * description: ${pkg.description}`,
      //     ` * author: ${pkg.author}`,
      //     ` */`,
      //   ].join("\n")
      // ),
    ],
    /** Vitest 单元测试配置：https://cn.vitest.dev/config */
    // test: {
    //   include: ["tests/**/*.test.ts"],
    //   environment: "jsdom",
    // },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        // 定义全局 SCSS 变量
        scss: {
          api: "modern-compiler",
        },
      },
    },
  };
});
