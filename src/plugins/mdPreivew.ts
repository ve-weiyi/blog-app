import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import "@kangc/v-md-editor/lib/theme/style/vuepress.css";
import createTodoListPlugin from "@kangc/v-md-editor/lib/plugins/todo-list/index";
import "@kangc/v-md-editor/lib/plugins/todo-list/todo-list.css";

// 数学公式解析,根据需要决定是否启用
// import createKatexPlugin from "@kangc/v-md-editor/lib/plugins/katex/cdn";

import Prism from "prismjs";
import type { App } from "vue";

export default function setupMdPreview(app: App) {
  VMdPreview.use(vuepressTheme, {
    Prism,
  }).use(createTodoListPlugin());
  // .use(createKatexPlugin());
  app.use(VMdPreview);
}
