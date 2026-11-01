import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
const path = location.pathname.replace(/\/$/, "") || "/";
const root = document.getElementById("root")!;
const app = <App path={path} />;
if (root.childElementCount) hydrateRoot(root, app);
else createRoot(root).render(app);
