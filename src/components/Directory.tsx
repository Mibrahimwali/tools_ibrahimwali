import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Image,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Command,
  Clock3,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  TOOLS,
  TOOL_CATEGORIES,
  getTool,
  type ToolCategory,
  type ToolDefinition,
} from "../data/tools";
import { GUIDES } from "../data/guides";
import Breadcrumb from "./Breadcrumb";
const nf = new Intl.NumberFormat("en-US");
export default function Directory({
  path,
  category,
  favorites,
  recent,
  card,
}: {
  path: string;
  category?: ToolCategory;
  favorites: string[];
  recent: string[];
  card: (t: ToolDefinition) => ReactNode;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<string>(category || "all"),
    [savedOnly, setSavedOnly] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
    const c = params.get("category");
    if (c && Object.hasOwn(TOOL_CATEGORIES, c)) setFilter(c);
    const handle = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);
  const update = (q: string, c: string) => {
    setQuery(q);
    setFilter(c);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (c !== "all" && !category) params.set("category", c);
    history.replaceState(
      null,
      "",
      path + (params.size ? "?" + params.toString() : ""),
    );
  };
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = TOOLS.filter(
    (t) =>
      (filter === "all" || t.category === filter) &&
      (!savedOnly || favorites.includes(t.slug)) &&
      tokens.every((q) =>
        `${t.shortName} ${t.description} ${t.keywords} ${TOOL_CATEGORIES[t.category].label}`
          .toLowerCase()
          .includes(q),
      ),
  );
  const guideMatches =
    path === "/search" && tokens.length
      ? GUIDES.filter((g) =>
          tokens.every((q) =>
            (g.title + " " + g.description).toLowerCase().includes(q),
          ),
        )
      : [];
  return (
    <>
      {!category && path !== "/search" ? (
        <section className="hero">
          <div>
            <div className="eyebrow hero-kicker">
              <span className="live-dot" />A small collection for everyday work
            </div>
            <h1>
              Less busywork.
              <br />
              <span>More building.</span>
            </h1>
            <p>
              Free tools for the things between the big things.
              <br className="desktop-break" />
              Images, words, code, and everything around them.
            </p>
            <div className="hero-links">
              <a className="text-link" href="#all-tools">
                Explore all {TOOLS.length} tools <ArrowDown size={16} />
              </a>
              <span>
                <ShieldCheck size={16} />
                Your files stay on your device.
              </span>
            </div>
          </div>
          <aside className="featured-note">
            <span className="eyebrow">The everyday kit / 01</span>
            <div className="featured-icon">
              <Image size={34} />
            </div>
            <h2>
              A lighter image.
              <br />A faster page.
            </h2>
            <p>
              Resize, compress, and convert.
              <br />
              No uploads in the process.
            </p>
            <a className="button" href="/image-compressor">
              Open image compressor <ArrowUpRight size={16} />
            </a>
            <div className="note-bottom">
              <span>Free. Private. Ready.</span>
              <span className="live-dot" />
            </div>
          </aside>
        </section>
      ) : (
        <div className="page-heading">
          <Breadcrumb
            items={[
              [
                category
                  ? TOOL_CATEGORIES[category]?.label || "Category"
                  : "Search",
                path,
              ],
            ]}
          />
          <span className="eyebrow">The toolkit</span>
          <h1>
            {category
              ? TOOL_CATEGORIES[category]?.label
              : "Find your next shortcut."}
          </h1>
          <p>
            {category
              ? TOOL_CATEGORIES[category]?.blurb
              : "Search tools and practical guides by task or name."}
          </p>
        </div>
      )}
      <section id="all-tools" className="directory">
        <div className="directory-top">
          <div>
            <span className="eyebrow">A tool for the task</span>
            <h2>
              {category
                ? TOOL_CATEGORIES[category]?.label
                : "The whole toolbox."}
            </h2>
          </div>
          <a className="text-link" href="/blog">
            Not sure where to start? Read a guide <ArrowRight size={16} />
          </a>
        </div>
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="search-box"
          data-clarity-mask="true"
        >
          <Search size={22} aria-hidden />
          <label className="sr-only" htmlFor="tool-search">
            Search tools and guides
          </label>
          <input
            id="tool-search"
            ref={input}
            type="search"
            value={query}
            onChange={(e) => update(e.target.value, filter)}
            placeholder="Try “compress image”, “JSON”, or “sitemap”…"
            autoComplete="off"
          />
          <kbd>
            <Command size={12} /> /
          </kbd>
        </form>
        <div className="directory-controls">
          <div className="filters" aria-label="Filter by category">
            {[
              ["all", "All tools"],
              ...Object.entries(TOOL_CATEGORIES)
                .filter(([id]) => !category || id === category)
                .map(([id, c]) => [id, c.label]),
            ].map(([id, label]) => (
              <button
                key={id}
                className={filter === id ? "active" : ""}
                aria-pressed={filter === id}
                onClick={() => update(query, id)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={`saved-filter ${savedOnly ? "active" : ""}`}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly((v) => !v)}
          >
            <Star size={15} />
            Saved{favorites.length ? ` (${favorites.length})` : ""}
          </button>
        </div>
        <div className="result-label">
          <span aria-live="polite">
            {nf.format(filtered.length)} tools
            {query ? " matching your search" : ""}
          </span>
          <span>Built to be useful. Free to use.</span>
        </div>
        <div className="tool-grid">{filtered.map(card)}</div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={28} />
            <h3>No tools found</h3>
            <p>
              {savedOnly
                ? "Save tools using the star on each card."
                : "Try “image”, “text”, “developer”, or a shorter search."}
            </p>
            <button
              className="button secondary"
              onClick={() => {
                update("", "all");
                setSavedOnly(false);
              }}
            >
              Show all tools
            </button>
          </div>
        )}
        {guideMatches.length > 0 && (
          <section className="content-section">
            <h2>Matching guides</h2>
            <div className="related-guides">
              {guideMatches.map((g) => (
                <a key={g.slug} href={`/blog/${g.slug}`}>
                  {g.title}
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          </section>
        )}
        {recent.length > 0 && !query && !category && (
          <div className="recent">
            <Clock3 size={15} />
            <span>Recently used</span>
            {recent.map((s) => {
              const t = getTool(s);
              return t ? (
                <a key={s} href={`/${s}`}>
                  {t.shortName}
                </a>
              ) : null;
            })}
          </div>
        )}
      </section>
      {path === "/" && (
        <>
          <section className="workflow-strip">
            <div>
              <span className="eyebrow">A useful sequence</span>
              <h2>
                One task.
                <br />A few good tools.
              </h2>
            </div>
            <ol>
              <li>
                <a href="/image-resizer">
                  <span>01</span>Get the dimensions right
                  <ArrowRight size={16} />
                </a>
              </li>
              <li>
                <a href="/image-compressor">
                  <span>02</span>Make the file lighter
                  <ArrowRight size={16} />
                </a>
              </li>
              <li>
                <a href="/meta-tag-preview">
                  <span>03</span>Get the page ready to share
                  <ArrowRight size={16} />
                </a>
              </li>
            </ol>
          </section>
          <section className="content-section">
            <div className="section-line">
              <div>
                <span className="eyebrow">
                  A little context goes a long way
                </span>
                <h2>Use it well.</h2>
              </div>
              <a className="text-link" href="/blog">
                All {GUIDES.length} guides <ArrowRight size={16} />
              </a>
            </div>
            <div className="home-guides">
              {["image-compressor", "json-formatter", "sitemap-generator"].map(
                (slug) => {
                  const g = GUIDES.find((g) => g.toolSlug === slug)!;
                  return (
                    <a key={slug} href={`/blog/${g.slug}`}>
                      <span className="eyebrow">
                        {TOOL_CATEGORIES[getTool(slug)!.category].label}
                      </span>
                      <h3>{g.title}</h3>
                      <span className="text-link">
                        Read guide <ArrowUpRight size={15} />
                      </span>
                    </a>
                  );
                },
              )}
            </div>
          </section>
          <section className="developer-strip">
            <img src="/brand/logo.png" width={56} height={56} alt="" />
            <div>
              <span className="eyebrow">Made with intent</span>
              <h2>Small tools, from someone who builds.</h2>
              <p>
                By Muhammad Ibrahim. Technology executive, founder, and builder.
              </p>
            </div>
            <a href="/about" className="text-link">
              Meet the developer <ArrowUpRight size={16} />
            </a>
          </section>
        </>
      )}
    </>
  );
}
