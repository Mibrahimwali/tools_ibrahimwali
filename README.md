# Ibrahim Tools

Standalone React + TypeScript site intended for **https://tools.ibrahimwali.com**. It has its own package.json, lockfile, assets, content, build, tests, and Vercel configuration. It can be copied into another repository without any imports from the portfolio. Supabase, private environment variables, and an API server are not required.

## Run

```sh
cd tools-site
npm ci
npm run dev
```

Open http://127.0.0.1:4175. Production build:

```sh
npm run check
npm run lint
npm test
npm run build
npm run preview
# Optional: run the Chrome interaction suite (requires Google Chrome)
npm run test:browser
```

The build generates full HTML for every tool, category, guide, and profile page, not just metadata. React hydrates that HTML, then lazily loads tool controls. Directory cards, guides, instructions, breadcrumbs, and related links work as HTML without waiting for a backend. Individual tool operations require JavaScript.

## Included

- All 10 existing portfolio tools: QR codes, image compression/resizing, JPG to PNG, PNG to JPG, WebP conversion, word/character counts, age, and percentages.
- 14 initial additions: JSON formatting, Base64, URL encoding, UUIDs, secure random passwords, slugs, case conversion, duplicate-line cleanup, SHA-256, Unix timestamps, metadata preview, robots.txt, sitemap XML, and UTM campaign links.
- Seven further additions: CSV to JSON, JSON to CSV, Markdown preview, HTML entity encoder/decoder, color converter, contrast checker, and aspect-ratio calculator. Each has FAQs, a guide, and related links.
- Search across all tools and guides, category pages, favorites, recently used tools, and light/dark themes.
- One edited guide per tool with examples and limitations; linked tool → guide → related tools → related guides.
- Developer page and portfolio/LinkedIn/GitHub links; feedback by email.
- Floating Ask AI menu for ChatGPT, Claude, Perplexity, Gemini, and Copilot. Only public page context is used. Gemini/Copilot copy the question and open the platform; direct links on other platforms prefill where supported. External platforms can change URL behavior and require login. No paid AI API is implied or configured.

## Deploy to tools.ibrahimwali.com

1. Import this folder as a **new Vercel project** (or copy it to its own repository). For this repository, set Root Directory to `tools-site`.
2. Framework: Vite. Install: `npm ci`. Build: `npm run build`. Output: `dist`.
3. Add `tools.ibrahimwali.com` to that project's Domains settings.
4. Add the DNS record Vercel displays at your DNS provider. Use the actual project-specific target from Vercel; do not guess a CNAME. Wait for Vercel to verify DNS and provision HTTPS.
5. Verify direct opens of `/json-formatter`, `/blog/json-formatter-guide`, `/category/seo`, `/sitemap.xml`, `/llms.txt`, and a genuinely missing path.
6. Add the subdomain to Search Console (a verified domain property can cover it), and submit `https://tools.ibrahimwali.com/sitemap.xml`.

This change does not deploy or alter DNS. No login, Vercel credentials, or DNS access is included in the project. Add the subdomain only to the new project, not to the portfolio project.

### Existing portfolio URLs: safe migration

The portfolio's `/tools` and its 10 `/tools/:slug` pages are retained until the new domain is live. Enabling redirects before the destination exists would strand users.

After verifying the new domain, merge the rules in `migration/portfolio-redirects.json` into the **portfolio** `vercel.json` top-level `redirects` array. They permanently redirect each existing tool URL to its exact new URL and preserve the rest of the portfolio routes. Deploy the tools project first, then the portfolio.

After switching redirects, remove the old tools entries from the portfolio's sitemap/LLM generators and link its footer, navigation, and home tools references to the new domain. Keep the redirect rules indefinitely. Do not remove the old URLs without redirects. The standalone site already canonicalizes its own pages to the subdomain and its old `/tools/:slug` aliases redirect to `/:slug`.

## SEO and AI discovery

- Complete HTML bodies, unique titles/descriptions, self canonicals, OG/Twitter images and metadata.
- Person, WebSite, WebPage, SoftwareApplication, BlogPosting, ItemList, and BreadcrumbList schemas when applicable. No invented ratings or usage claims.
- Automatically generated sitemap with real editorial dates (not a new lastmod on every build), robots.txt, RSS, JSON search index, llms.txt, llms-full.txt, and Markdown companion pages.
- Search is noindex; the canonical directory and category pages remain indexable. Missing paths return Vercel's real 404 using a generated noindex 404 page. There is no catch-all rewrite masking missing pages as HTTP 200.
- Tool inputs never enter search URLs, metadata, analytics, or AI prompts. Search queries contain directory search text only.
- Clear privacy statement, locally hosted fonts, responsive layout, semantic controls, visible keyboard focus, and reduced-motion support.

`llms.txt` is an emerging convention. It and structured data help machines understand content; they cannot force search indexing, AI training, answers, or citations. No crawler blocking or fabricated AI-specific directives are added. Search-engine guidance: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Content maintenance

Tool catalog: `src/data/tools.ts` and `src/data/extra-tools.ts`. Guides: `src/data/guides.ts`. Page registry: `src/data/pages.ts`. Update `CONTENT_DATE` only when content is reviewed or changed. Updating a component alone should not reset every content date. New tools need a catalog entry, runtime implementation, unique guide, related links, and functional tests. Build validation rejects broken local links and missing guides.

Privacy model: tool inputs are transient browser state, favorites/recent slugs/theme use localStorage, and there are no analytics tags or consent-requiring cookies here. Hosting logs and third-party AI services are described separately in `/privacy`. If tracking is introduced later, add an appropriate consent flow before enabling it.

Security limits: image files are limited to 20 MB / 24 megapixels; dimensions capped at 10,000 pixels; QR encoding uses qrcode; password/UUID/hash tools use browser crypto. SHA-256 is not password hashing, Base64 is not encryption, and robots.txt is not access control. No external URL is fetched by a tool.

Google Search Console HTML verification is optional: set `GOOGLE_SITE_VERIFICATION` in the new Vercel project environment settings before a build to emit its verification meta tag. This token is public, not an API credential. Do not reuse the portfolio analytics property without deliberately deciding on cross-subdomain reporting and consent.
