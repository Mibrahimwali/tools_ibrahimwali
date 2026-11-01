import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  render,
  PAGES,
  TOOLS,
  TOOL_CATEGORIES,
  GUIDES,
  CONTENT_DATE,
} from "../.ssr/entry-server.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const BASE = "https://tools.ibrahimwali.com";
const author = {
  "@type": "Person",
  "@id": BASE + "/#author",
  name: "Muhammad Ibrahim",
  url: "https://ibrahimwali.com",
  sameAs: [
    "https://www.linkedin.com/in/iamibrahimwali/",
    "https://github.com/Mibrahimwali",
  ],
  jobTitle: "Technology Executive",
};
const website = {
  "@type": "WebSite",
  "@id": BASE + "/#website",
  url: BASE + "/",
  name: "Ibrahim Tools",
  description: "Free browser tools for images, writing, developers, and SEO.",
  inLanguage: "en",
  publisher: { "@id": author["@id"] },
};
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const escape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const xml = (s) => escape(s).replace(/'/g, "&apos;");
const json = (s) => JSON.stringify(s).replace(/</g, "\\u003c");
function graph(page) {
  const url = BASE + page.path;
  const tool = TOOLS.find((t) => page.path === "/" + t.slug),
    guide = GUIDES.find((g) => page.path === "/blog/" + g.slug);
  const objects = [
    author,
    website,
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": website["@id"] },
      author: { "@id": author["@id"] },
      inLanguage: "en",
    },
  ];
  const crumbs = [{ name: "Tools", url: BASE + "/" }];
  if (tool) {
    crumbs.push(
      {
        name: TOOL_CATEGORIES[tool.category].label,
        url: BASE + "/category/" + tool.category,
      },
      { name: tool.shortName, url },
    );
    objects.push({
      "@type": "SoftwareApplication",
      "@id": url + "#software",
      name: tool.shortName,
      url,
      description: tool.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web browser",
      browserRequirements:
        "JavaScript required; modern browser with Canvas and Web Crypto support.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@id": author["@id"] },
      featureList: tool.benefits,
    });
  } else if (guide) {
    crumbs.push(
      { name: "Guides", url: BASE + "/blog" },
      { name: guide.title, url },
    );
    objects.push({
      "@type": "BlogPosting",
      "@id": url + "#article",
      headline: guide.title,
      description: guide.description,
      mainEntityOfPage: { "@id": url + "#page" },
      author: { "@id": author["@id"] },
      publisher: { "@id": author["@id"] },
      datePublished: CONTENT_DATE,
      dateModified: CONTENT_DATE,
      image: BASE + "/og-image.png",
      about: { "@id": BASE + "/" + guide.toolSlug + "#software" },
      inLanguage: "en",
    });
  } else if (page.path !== "/")
    crumbs.push({ name: page.title.split(" | ")[0], url });
  if (crumbs.length > 1)
    objects.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    });
  if (page.path === "/" || page.path.startsWith("/category/")) {
    const category = page.path.slice("/category/".length);
    const selected =
      page.path === "/" ? TOOLS : TOOLS.filter((t) => t.category === category);
    objects.push({
      "@type": "ItemList",
      name: page.title,
      itemListElement: selected.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.shortName,
        url: BASE + "/" + t.slug,
      })),
    });
  }
  if (tool)
    objects.push({
      "@type": "FAQPage",
      "@id": url + "#faq",
      mainEntity: tool.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  return { "@context": "https://schema.org", "@graph": objects };
}
function head(page) {
  const canonical = BASE + page.path;
  const verification = process.env.GOOGLE_SITE_VERIFICATION;
  return `<title>${escape(page.title)}</title>
${verification ? `<meta name="google-site-verification" content="${escape(verification)}"/>` : ""}
<link rel="alternate" type="application/rss+xml" title="Ibrahim Tools Guides" href="/feed.xml"/>
<meta name="description" content="${escape(page.description)}"/>
<meta name="robots" content="${page.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}"/>
<link rel="canonical" href="${canonical}"/>
<link rel="alternate" type="text/markdown" href="${canonical === "https://tools.ibrahimwali.com/" ? BASE + "/index" : canonical}.md"/>
<meta property="og:type" content="${page.path.startsWith("/blog/") ? "article" : "website"}"/>
<meta property="og:title" content="${escape(page.title)}"/>
<meta property="og:description" content="${escape(page.description)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:site_name" content="Ibrahim Tools"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:image" content="${BASE}/og-image.png"/>
<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Ibrahim Tools — free tools for everyday work"/>
<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:site" content="@iamibrahimwali"/>
<meta name="twitter:title" content="${escape(page.title)}"/><meta name="twitter:description" content="${escape(page.description)}"/>
<meta name="twitter:image" content="${BASE}/og-image.png"/>
<script type="application/ld+json">${json(graph(page))}</script>`;
}
function markdown(page) {
  const tool = TOOLS.find((t) => page.path === "/" + t.slug),
    guide = GUIDES.find((g) => page.path === "/blog/" + g.slug);
  let body = `# ${page.title}\n\n> ${page.description}\n\nCanonical: ${BASE}${page.path}\nAuthor: [Muhammad Ibrahim](https://ibrahimwali.com)\n\n`;
  if (tool) {
    body += `## How to use\n\n${tool.howTo.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n## Questions and limitations\n\n${tool.faqs.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}\n\n## Guide\n\n- [${tool.shortName} guide](${BASE}/blog/${tool.slug}-guide)\n\n## Related tools\n\n${tool.related.map((s) => `- [${TOOLS.find((t) => t.slug === s)?.shortName || s}](${BASE}/${s})`).join("\n")}`;
  } else if (guide) {
    body +=
      guide.sections
        .map((s) => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`)
        .join("\n\n") +
      `\n\n[Open ${TOOLS.find((t) => t.slug === guide.toolSlug).shortName}](${BASE}/${guide.toolSlug})`;
  } else if (page.path === "/privacy") {
    body += `## Processing\n\nFiles, text, dates, and generated results stay in browser memory. No uploads, accounts, analytics, or advertising scripts are included. Favorites, recent tool slugs, and theme preferences use localStorage; clear them on the privacy page. Hosting infrastructure can log requests. External AI services receive only the prepared public page question and have their own privacy policies. Contact: connect@ibrahimwali.com.\n`;
  } else if (page.path === "/about") {
    body += `## Developer\n\nMuhammad Ibrahim is a technology executive, founder, and builder with 15+ years in software and technology. His work focuses on blockchain, real-world assets, and AI infrastructure. Portfolio: https://ibrahimwali.com. Contact: connect@ibrahimwali.com.\n`;
  } else if (page.path === "/blog") {
    body += GUIDES.map(
      (g) => `- [${g.title}](${BASE}/blog/${g.slug}): ${g.description}`,
    ).join("\n");
  } else {
    const selected = page.path.startsWith("/category/")
      ? TOOLS.filter((t) => t.category === page.path.slice(10))
      : TOOLS;
    body +=
      `## Tools\n\n` +
      selected
        .map((t) => `- [${t.shortName}](${BASE}/${t.slug}): ${t.description}`)
        .join("\n");
  }
  return body + "\n";
}
if (!template.includes("<!--head-->") || !template.includes("<!--app-->"))
  throw new Error("Missing build template markers.");
for (const page of PAGES) {
  const html = template
    .replace("<!--head-->", head(page))
    .replace("<!--app-->", () => render(page.path));
  const file = page.path === "/" ? "index.html" : page.path.slice(1) + ".html";
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.writeFileSync(path.join(dist, file), html);
  const md = page.path === "/" ? "index.md" : page.path.slice(1) + ".md";
  fs.mkdirSync(path.dirname(path.join(dist, md)), { recursive: true });
  fs.writeFileSync(path.join(dist, md), markdown(page));
}
const missing = {
  path: "/404",
  title: "Page not found | Ibrahim Tools",
  description: "Find a free tool or guide in the Ibrahim Tools directory.",
  noindex: true,
};
fs.writeFileSync(
  path.join(dist, "404.html"),
  template
    .replace("<!--head-->", head(missing))
    .replace("<!--app-->", () => render("/404")),
);
const indexable = PAGES.filter((p) => !p.noindex);
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => ` <url><loc>${xml(BASE + p.path)}</loc><lastmod>${CONTENT_DATE}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n\n# Human and AI-readable documentation: ${BASE}/llms.txt\n`,
);
const llms = `# Ibrahim Tools\n\n> Free browser tools by Muhammad Ibrahim for images, writing, developers, and SEO. No account, uploads, analytics, or ads. Tool inputs run locally in the visitor's browser.\n\nUse canonical pages for citations. Each tool has instructions, limitations, a guide, and related links. This file is a discovery aid, not a guarantee of inclusion in AI answers. Markdown companions are available at /{slug}.md and /blog/{slug}-guide.md.\n\n## Core\n\n- [Directory](${BASE}/): All tools.\n- [Guides](${BASE}/blog): Practical tool guides.\n- [Developer](${BASE}/about): Muhammad Ibrahim; [portfolio](https://ibrahimwali.com).\n- [Privacy](${BASE}/privacy): Browser storage and external AI links.\n- [Full documentation](${BASE}/llms-full.txt)\n- [Machine-readable search index](${BASE}/search-index.json)\n\n${Object.entries(
  TOOL_CATEGORIES,
)
  .map(
    ([id, c]) =>
      `## ${c.label}\n\n${TOOLS.filter((t) => t.category === id)
        .map(
          (t) =>
            `- [${t.shortName}](${BASE}/${t.slug}): ${t.description}\n  - [Guide](${BASE}/blog/${t.slug}-guide)`,
        )
        .join("\n")}`,
  )
  .join("\n\n")}\n`;
fs.writeFileSync(path.join(dist, "llms.txt"), llms);
fs.writeFileSync(
  path.join(dist, "llms-full.txt"),
  indexable.map(markdown).join("\n\n---\n\n"),
);
fs.writeFileSync(
  path.join(dist, "search-index.json"),
  JSON.stringify(
    indexable.map((p) => ({
      url: BASE + p.path,
      title: p.title,
      description: p.description,
      type: p.path.startsWith("/blog/")
        ? "guide"
        : TOOLS.some((t) => "/" + t.slug === p.path)
          ? "tool"
          : "page",
    })),
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(dist, "feed.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Ibrahim Tools Guides</title><link>${BASE}/blog</link><description>Practical guides for free browser tools.</description>${GUIDES.map((g) => `<item><title>${xml(g.title)}</title><link>${BASE}/blog/${g.slug}</link><guid isPermaLink="true">${BASE}/blog/${g.slug}</guid><description>${xml(g.description)}</description><pubDate>${new Date(CONTENT_DATE + "T00:00:00Z").toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
);
console.log(
  `Rendered ${PAGES.length} complete HTML pages, 404, sitemap, RSS, Markdown, and AI discovery files.`,
);
