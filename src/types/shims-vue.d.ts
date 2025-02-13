declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.scss" {
  const scss: Record<string, string>;
  export default scss;
}

declare module "aplayer";
declare module "@kangc/v-md-editor";
declare module "@kangc/v-md-editor/lib/preview";
declare module "@kangc/v-md-editor/lib/plugins/katex/cdn";
declare module "@kangc/v-md-editor/lib/theme/vuepress.js";
declare module "@kangc/v-md-editor/lib/theme/vuepress-parser.js";
declare module "@kangc/v-md-editor/lib/plugins/todo-list/index";
declare module "vue-cropper";
declare module "@babel/core";
declare module "swiper/vue"
