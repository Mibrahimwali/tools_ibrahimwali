import { TOOLS, TOOL_CATEGORIES } from "./tools";
import { GUIDES } from "./guides";
export const CONTENT_DATE = "2026-11-01";
export const PAGES = [
  {
    path: "/",
    title: "Free Browser Tools for Images, Text, Developers & SEO",
    description:
      "31 free tools for images, writing, developers, and SEO. Search the directory, work privately in your browser, and learn with step-by-step guides.",
  },
  {
    path: "/search",
    title: "Search Tools & Guides | Ibrahim Tools",
    description:
      "Find the right browser tool or guide by name, category, or task.",
    noindex: true,
  },
  {
    path: "/blog",
    title: "Practical Tool Guides | Ibrahim Tools",
    description:
      "Clear guides to image formats, writing, JSON, timestamps, metadata, robots.txt, and sitemaps. Examples and limitations for every tool.",
  },
  {
    path: "/about",
    title: "Built by Muhammad Ibrahim | Ibrahim Tools",
    description:
      "Meet Muhammad Ibrahim, the technology executive and builder behind this collection of free browser tools. Blockchain, RWA, AI, and software leadership.",
  },
  {
    path: "/privacy",
    title: "Privacy & Local Processing | Ibrahim Tools",
    description:
      "How Ibrahim Tools handles files, text, favorites, external AI links, and browser storage. No accounts, uploads, or analytics on this tools site.",
  },
  ...Object.entries(TOOL_CATEGORIES).map(([slug, c]) => ({
    path: `/category/${slug}`,
    title: `Free ${c.label} | Ibrahim Tools`,
    description:
      c.blurb +
      " Explore working tools, examples, and linked guides. No signup required.",
  })),
  ...TOOLS.map((t) => ({
    path: `/${t.slug}`,
    title: `${t.shortName} — Free Online Tool | Ibrahim Tools`,
    description: t.description,
  })),
  ...GUIDES.map((g) => ({
    path: `/blog/${g.slug}`,
    title: `${g.title} | Ibrahim Tools`,
    description: g.description,
  })),
];
export function pageFor(path: string) {
  return PAGES.find((p) => p.path === path);
}
