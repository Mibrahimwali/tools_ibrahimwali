import { renderToString } from "react-dom/server";
import App from "./App";
export { PAGES, CONTENT_DATE } from "./data/pages";
export { TOOLS, TOOL_CATEGORIES } from "./data/tools";
export { GUIDES } from "./data/guides";
export function render(path: string) {
  return renderToString(<App path={path} />);
}
