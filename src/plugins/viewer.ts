import VueViewer from "v-viewer";
import "viewerjs/dist/viewer.css";
import type { App } from "vue";

export default function setupViewer(app: App) {
  app.use(VueViewer);
}
