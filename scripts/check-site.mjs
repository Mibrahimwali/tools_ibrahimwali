import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { PAGES, TOOLS, GUIDES } from "../.ssr/entry-server.js";
const dist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const files = new Set(PAGES.map((p) => p.path));
files.add("/404");
const asset = (href) => {
  const base = href.split(/[?#]/)[0];
  return !base || files.has(base) || fs.existsSync(path.join(dist, base));
};
let checked = 0;
for (const p of PAGES) {
  const html = fs.readFileSync(
    path.join(dist, p.path === "/" ? "index.html" : p.path.slice(1) + ".html"),
    "utf8",
  );
  assert.equal(
    (html.match(/<h1[ >]/g) || []).length,
    1,
    `${p.path}: expected one h1`,
  );
  assert.equal(
    (html.match(/rel="canonical"/g) || []).length,
    1,
    `${p.path}: expected one canonical`,
  );
  assert(
    html.includes(`href="https://tools.ibrahimwali.com${p.path}"`),
    `${p.path}: canonical missing`,
  );
  assert(
    html.includes('<meta name="description"'),
    `${p.path}: description missing`,
  );
  assert(!html.includes("<!--app-->"));
  const json = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/s,
  );
  assert(json, `${p.path}: schema missing`);
  JSON.parse(json[1]);
  for (const match of html.matchAll(/(?:href|src)="(\/[^" ]*)"/g)) {
    const href = match[1];
    assert(asset(href), `${p.path}: broken local URL ${href}`);
    checked++;
  }
  if (p.path.startsWith("/blog/"))
    assert(
      html.includes("What to check before you finish"),
      `${p.path}: missing article body`,
    );
}
for (const t of TOOLS) {
  assert(
    GUIDES.some((g) => g.toolSlug === t.slug),
    `${t.slug} lacks a guide`,
  );
  for (const slug of t.related)
    assert(
      TOOLS.some((x) => x.slug === slug),
      `Broken related tool ${slug}`,
    );
}
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
assert.equal(
  (sitemap.match(/<loc>/g) || []).length,
  PAGES.filter((p) => !p.noindex).length,
);
assert(!sitemap.includes("/search<"));
assert(
  fs
    .readFileSync(path.join(dist, "search.html"), "utf8")
    .includes("noindex,follow"),
);
assert(
  fs
    .readFileSync(path.join(dist, "404.html"), "utf8")
    .includes("noindex,follow"),
);
for (const file of [
  "robots.txt",
  "llms.txt",
  "llms-full.txt",
  "search-index.json",
  "feed.xml",
  "og-image.png",
])
  assert(fs.existsSync(path.join(dist, file)), `Missing ${file}`);
console.log(
  `Verified ${PAGES.length} pages, ${TOOLS.length} tools and guides, ${checked} internal references, metadata, and discovery files.`,
);
