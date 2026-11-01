import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    "<style>body{margin:0}</style>" +
      fs.readFileSync(path.join(root, "public/og-image.svg"), "utf8"),
  );
  await page.screenshot({ path: path.join(root, "public/og-image.png") });
  console.log("Saved 1200 × 630 social preview.");
} finally {
  await browser.close();
}
