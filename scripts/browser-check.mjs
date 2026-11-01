import { chromium, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { staticServer } from "./serve.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, ".qa");
fs.mkdirSync(out, { recursive: true });
const server = await staticServer(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const open = async (slug) => {
  const r = await page.goto(base + "/" + slug);
  expect(r.status()).toBe(200);
  await page.locator(".workspace-loading").waitFor({ state: "detached" });
};
const run = async (slug, button, input, expected) => {
  await open(slug);
  if (input !== undefined)
    await page.getByLabel("Input", { exact: true }).fill(input);
  await page.getByRole("button", { name: button, exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Result", exact: true }),
  ).toHaveValue(expected);
};
try {
  await page.goto(base);
  await expect(page.locator(".tool-card")).toHaveCount(31);
  await page.screenshot({
    path: path.join(out, "home-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("searchbox").fill("json");
  await expect(page.locator(".tool-card")).toHaveCount(3);
  await page.getByRole("searchbox").fill("no-such-tool");
  await expect(page.getByText("No tools found", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Show all tools", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save JSON Formatter", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved (1)", exact: true }).click();
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.goto(base + "/json-formatter");
  await page.locator(".workspace-loading").waitFor({ state: "detached" });
  await page.getByLabel("Input", { exact: true }).fill('{"ok":true}');
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    '{\n  "ok": true\n}',
  );
  await page.getByLabel("Input", { exact: true }).fill("{oops");
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  const href = await page
    .getByRole("link", { name: /ChatGPT Open with question/ })
    .getAttribute("href");
  expect(decodeURIComponent(href)).toContain(
    "https://tools.ibrahimwali.com/json-formatter",
  );
  expect(decodeURIComponent(href)).not.toContain("{oops");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await run(
    "base64-encoder-decoder",
    "Encode",
    "Hello, دنیا",
    Buffer.from("Hello, دنیا").toString("base64"),
  );
  await run(
    "url-encoder-decoder",
    "Encode",
    "hello world &",
    "hello%20world%20%26",
  );
  await run("slug-generator", "Generate result", "Crème & code", "creme-code");
  await run("case-converter", "UPPERCASE", "hello WORLD", "HELLO WORLD");
  await run("remove-duplicate-lines", "Generate result", "a\nb\na", "a\nb");
  await run(
    "sha256-generator",
    "Generate result",
    "hello",
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  );
  await open("uuid-generator");
  await page
    .getByRole("button", { name: "Generate UUIDs", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /^[a-f0-9-]{36}(\n[a-f0-9-]{36}){4}$/,
  );
  await open("password-generator");
  await page
    .getByRole("button", { name: "Generate password", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /^[\s\S]{24}$/,
  );
  await open("timestamp-converter");
  await page.getByLabel("Unix timestamp", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Convert timestamp", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    "1970-01-01T00:00:00.000Z",
  );
  await open("meta-tag-preview");
  await page.getByLabel(/Page title/).fill('A "useful" title');
  await page.getByLabel(/Meta description/).fill("A useful & specific page.");
  await page
    .getByLabel("Page URL", { exact: true })
    .fill("https://example.com/test");
  await page
    .getByRole("button", { name: "Generate result", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /&quot;useful&quot;/,
  );
  await open("robots-txt-generator");
  await page
    .getByLabel("Absolute sitemap URL")
    .fill("https://example.com/sitemap.xml");
  await page
    .getByRole("button", { name: "Generate result", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /Allow: \//,
  );
  await run(
    "sitemap-generator",
    "Generate result",
    "https://example.com/a?b=1&c=2",
    /b=1&amp;c=2/,
  );
  await open("utm-builder");
  await page
    .getByLabel("Page URL", { exact: true })
    .fill("https://example.com/?existing=yes#section");
  for (const [k, v] of [
    ["Source", "newsletter"],
    ["Medium", "email"],
    ["Campaign", "launch"],
  ])
    await page.getByLabel(k, { exact: true }).fill(v);
  await page
    .getByRole("button", { name: "Generate result", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    "https://example.com/?existing=yes&utm_source=newsletter&utm_medium=email&utm_campaign=launch#section",
  );
  await run(
    "csv-to-json",
    "Convert",
    "name,city\nIbrahim,Karachi",
    '[\n  {\n    "name": "Ibrahim",\n    "city": "Karachi"\n  }\n]',
  );
  await run(
    "json-to-csv",
    "Convert",
    '[{"name":"Ibrahim","city":"Karachi"}]',
    "name,city\nIbrahim,Karachi",
  );
  await run(
    "html-entity-encoder-decoder",
    "Encode",
    "<hi> &",
    "&lt;hi&gt; &amp;",
  );
  await open("markdown-preview");
  await page
    .getByLabel("Markdown source")
    .fill("# Hello\n\n<script>window.test=1</script>");
  await expect(page.locator(".markdown-preview h2")).toHaveText("Hello");
  expect(await page.evaluate(() => window.test)).toBeUndefined();
  await open("color-converter");
  await page.getByLabel("HEX or RGB color").fill("#fff");
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /#ffffff/,
  );
  await open("contrast-checker");
  await page.getByLabel("Foreground color").fill("#000");
  await page.getByLabel("Background color").fill("#fff");
  await expect(page.getByText("21.00:1", { exact: true })).toBeVisible();
  await open("aspect-ratio-calculator");
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    "16:9\n1200 × 675 pixels",
  );
  await open("word-counter");
  await page.getByLabel("Your text").fill("Hello world.");
  await expect(page.locator(".metrics>div").first()).toHaveText("2Words");
  await open("character-counter");
  await page.getByLabel("Your text").fill("Hi 😀");
  await expect(page.locator(".metrics>div").nth(1)).toHaveText("4Characters");
  await open("age-calculator");
  await page.getByLabel("Date of birth").fill("2000-02-29");
  await page.getByLabel("Age as of").fill("2025-02-28");
  await expect(page.locator(".metrics")).toHaveText("25Years0Months0Days");
  await open("percentage-calculator");
  await expect(page.locator(".big-result")).toHaveText("30");
  await open("qr-code-generator");
  await expect(page.getByAltText("Generated QR code")).toBeVisible();
  // Generate a tiny PNG locally; test all five image operations without a network upload.
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 120;
    c.height = 80;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#326644";
    ctx.fillRect(0, 0, 120, 80);
    return c.toDataURL("image/png").split(",")[1];
  });
  for (const slug of [
    "image-compressor",
    "image-resizer",
    "jpg-to-png",
    "png-to-jpg",
    "webp-converter",
  ]) {
    await open(slug);
    await page
      .locator("input[type=file]")
      .setInputFiles({
        name: "test.png",
        mimeType: "image/png",
        buffer: Buffer.from(png, "base64"),
      });
    const button =
      slug === "image-compressor"
        ? "Compress image"
        : slug === "image-resizer"
          ? "Resize image"
          : "Convert image";
    await expect(
      page.getByRole("button", { name: button, exact: true }),
    ).toBeEnabled();
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(page.getByAltText("Processed image preview")).toBeVisible();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download image", exact: true })
      .click();
    const d = await download;
    expect(d.suggestedFilename()).toMatch(
      slug === "jpg-to-png" || slug === "image-resizer" ? /\.png$/ : /\.jpg$/,
    );
  }
  await page.goto(base + "/blog");
  await expect(page.locator(".guide-card")).toHaveCount(31);
  await page.goto(base + "/blog/contrast-checker-guide");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Contrast",
  );
  await page.goto(base + "/search?q=json");
  await expect(page.locator(".tool-card")).toHaveCount(3);
  await expect(page.locator("meta[name=robots]")).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  const response = await page.goto(base + "/this-page-is-missing");
  expect(response.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A small detour.",
  );
  for (const width of [375, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/sitemap-generator",
      "/blog/csv-to-json-guide",
      "/category/developer",
    ]) {
      await page.goto(base + route);
      await expect(page.locator("body")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    if (width === 390) {
      await page.goto(base);
      await page.screenshot({
        path: path.join(out, "home-mobile.png"),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Ask AI", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.screenshot({ path: path.join(out, "ask-ai-mobile.png") });
      await page.keyboard.press("Escape");
    }
  }
  await page.goto(base);
  await page
    .getByRole("button", { name: "Switch to dark theme", exact: true })
    .click();
  await page.screenshot({
    path: path.join(out, "home-dark.png"),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".tool-card")).toHaveCount(31);
  expect(errors).toEqual([]);
  console.log(
    "Browser checks passed: 31 tools, downloads, search, favorites, guides, Ask AI, 404, themes, reduced motion, and five viewport widths.",
  );
} catch (e) {
  await page
    .screenshot({ path: path.join(out, "failure.png"), fullPage: true })
    .catch(() => {});
  console.error("Browser errors:", errors);
  throw e;
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
