import {
  lazy,
  Suspense,
  useEffect,
  useState,
  Component,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  Search,
  ArrowRight,
  Star,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import {
  TOOL_CATEGORIES,
  getTool,
  getRelatedTools,
  type ToolCategory,
  type ToolDefinition,
} from "./data/tools";
import { GUIDES } from "./data/guides";
import { CONTENT_DATE, pageFor } from "./data/pages";
import { AUTHOR_URL } from "./lib";
import AskAI from "./components/AskAI";
import AnalyticsConsent, {
  CookieSettings,
} from "./components/AnalyticsConsent";
import Directory from "./components/Directory";
import ToolCard from "./components/ToolCard";
import Breadcrumb from "./components/Breadcrumb";
const ToolRuntime = lazy(() => import("./components/ToolRuntime"));
class WorkspaceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert" className="editor-panel">
        <h2>This workspace could not load</h2>
        <p>Reload the page and try again. Your tool input is not saved.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload workspace
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App({ path }: { path: string }) {
  const page = pageFor(path);
  const [mounted, setMounted] = useState(false),
    [favorites, setFavorites] = useState<string[]>([]),
    [recent, setRecent] = useState<string[]>([]),
    [dark, setDark] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const f = JSON.parse(localStorage.getItem("mi-tools-favorites") || "[]");
      const r = JSON.parse(localStorage.getItem("mi-tools-recent") || "[]");
      if (Array.isArray(f))
        setFavorites(
          f.filter((s: unknown) => typeof s === "string" && getTool(s)),
        );
      if (Array.isArray(r))
        setRecent(
          r.filter((s: unknown) => typeof s === "string" && getTool(s)),
        );
      setDark(document.documentElement.dataset.theme === "dark");
    } catch {
      /* storage is optional */
    }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const tool = getTool(path.slice(1));
    if (!tool) return;
    try {
      const stored = JSON.parse(
        localStorage.getItem("mi-tools-recent") || "[]",
      );
      const list = Array.isArray(stored)
        ? stored.filter((s) => typeof s === "string" && getTool(s))
        : [];
      localStorage.setItem(
        "mi-tools-recent",
        JSON.stringify(
          [tool.slug, ...list.filter((s) => s !== tool.slug)].slice(0, 5),
        ),
      );
    } catch {
      /* storage is optional */
    }
  }, [mounted, path]);
  const toggle = (slug: string) => {
    setFavorites((f) => {
      const list = f.includes(slug)
        ? f.filter((x) => x !== slug)
        : [...f, slug];
      try {
        localStorage.setItem("mi-tools-favorites", JSON.stringify(list));
      } catch {
        /* no persistent storage */
      }
      return list;
    });
  };
  const tool = getTool(path.slice(1));
  const guide = GUIDES.find((g) => path === `/blog/${g.slug}`);
  const category =
    path.startsWith("/category/") &&
    Object.hasOwn(TOOL_CATEGORIES, path.slice(10))
      ? (path.slice(10) as ToolCategory)
      : undefined;
  const card = (t: ToolDefinition) => (
    <ToolCard
      key={t.slug}
      tool={t}
      saved={favorites.includes(t.slug)}
      onSave={() => toggle(t.slug)}
    />
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-row">
          <a className="brand" href="/" aria-label="Ibrahim Tools home">
            <img src="/brand/logo.png" alt="" width={40} height={40} />
            <span>
              Ibrahim<span className="brand-light"> / tools</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="/#all-tools">Tools</a>
            <a href="/blog">Guides</a>
            <a href="/about">The developer</a>
          </nav>
          <div className="header-actions">
            <a
              href="/search"
              className="icon-button"
              aria-label="Search tools and guides"
            >
              <Search size={19} />
            </a>
            <button
              className="icon-button"
              aria-label={
                dark ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={() => {
                setDark((v) => !v);
                document.documentElement.dataset.theme = dark
                  ? "light"
                  : "dark";
                try {
                  localStorage.setItem(
                    "mi-tools-theme",
                    dark ? "light" : "dark",
                  );
                } catch {
                  /* optional */
                }
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="container">
        {(path === "/" || path === "/search" || category) && (
          <Directory
            path={path}
            category={category}
            favorites={favorites}
            recent={recent}
            card={card}
          />
        )}
        {tool && (
          <>
            <Breadcrumb
              items={[
                [
                  TOOL_CATEGORIES[tool.category].label,
                  `/category/${tool.category}`,
                ],
                [tool.shortName, path],
              ]}
            />
            <div className="page-heading">
              <span className="eyebrow">
                {TOOL_CATEGORIES[tool.category].label} / browser workspace
              </span>
              <div className="section-line">
                <h1>{tool.shortName}</h1>
                <button
                  className={`icon-button bookmark ${favorites.includes(tool.slug) ? "is-saved" : ""}`}
                  aria-label={
                    favorites.includes(tool.slug)
                      ? "Remove favorite"
                      : "Save to favorites"
                  }
                  aria-pressed={favorites.includes(tool.slug)}
                  onClick={() => toggle(tool.slug)}
                >
                  <Star size={22} />
                </button>
              </div>
              <p>{tool.tagline}</p>
              <div className="trust-row">
                <span>
                  <ShieldCheck size={15} />
                  Local processing
                </span>
                <span>No account</span>
                <a href={`/blog/${tool.slug}-guide`}>
                  Read the guide <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <section
              aria-label={`${tool.shortName} workspace`}
              className="workspace-wrap"
              data-clarity-mask="true"
            >
              <WorkspaceBoundary>
                {mounted ? (
                  <Suspense fallback={<WorkspaceLoading />}>
                    <ToolRuntime slug={tool.slug} />
                  </Suspense>
                ) : (
                  <WorkspaceLoading />
                )}
              </WorkspaceBoundary>
            </section>
            <section className="howto content-section">
              <div>
                <span className="eyebrow">A quick start</span>
                <h2>How to use it</h2>
                <ol>
                  {tool.howTo.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <a className="text-link" href={`/blog/${tool.slug}-guide`}>
                  Examples, details, and limitations <ArrowUpRight size={16} />
                </a>
              </div>
              <aside className="note">
                <ShieldCheck size={24} />
                <h3>Your work stays with you.</h3>
                <p>
                  This workspace processes your input on your device. We do not
                  upload your files or send your text to a tool backend.
                </p>
                <a href="/privacy" className="text-link">
                  Privacy details <ArrowRight size={14} />
                </a>
              </aside>
            </section>
            <section className="content-section faq">
              <span className="eyebrow">Before you go</span>
              <h2>Common questions</h2>
              {tool.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </section>
            <section className="content-section">
              <div className="section-line">
                <div>
                  <span className="eyebrow">Keep going</span>
                  <h2>The next tool in your workflow</h2>
                </div>
                <a href="/#all-tools" className="text-link">
                  All tools <ArrowRight size={16} />
                </a>
              </div>
              <div className="tool-grid">
                {getRelatedTools(tool.slug).map(card)}
              </div>
            </section>
          </>
        )}
        {path === "/blog" && (
          <>
            <Breadcrumb items={[["Guides", "/blog"]]} />
            <div className="page-heading">
              <span className="eyebrow">The field notes</span>
              <h1>
                Less guessing.
                <br />
                Better results.
              </h1>
              <p>
                Practical guides for every tool: what to use, how it works, and
                what to check before you finish.
              </p>
            </div>
            <div className="guide-grid">
              {GUIDES.map((g) => (
                <a key={g.slug} className="guide-card" href={`/blog/${g.slug}`}>
                  <span className="eyebrow">
                    {TOOL_CATEGORIES[getTool(g.toolSlug)!.category].label}
                  </span>
                  <h2>{g.title}</h2>
                  <p>{g.sections[0].paragraphs[0]}</p>
                  <span className="text-link">
                    Read guide <ArrowUpRight size={17} />
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
        {guide && (
          <>
            <Breadcrumb
              items={[
                ["Guides", "/blog"],
                [getTool(guide.toolSlug)!.shortName, `/${guide.toolSlug}`],
              ]}
            />
            <article className="article">
              <header>
                <span className="eyebrow">
                  A practical guide /{" "}
                  {TOOL_CATEGORIES[getTool(guide.toolSlug)!.category].label}
                </span>
                <h1>{guide.title}</h1>
                <div className="byline">
                  <img src="/brand/logo.png" width={32} height={32} alt="" />
                  <a href="/about">Muhammad Ibrahim</a>
                  <time dateTime={CONTENT_DATE}>November 1, 2026</time>
                </div>
                <p className="article-intro">
                  {getTool(guide.toolSlug)!.tagline}
                </p>
                <a className="button" href={`/${guide.toolSlug}`}>
                  Open {getTool(guide.toolSlug)!.shortName}
                  <ArrowUpRight size={16} />
                </a>
              </header>
              <nav className="toc" aria-label="On this page">
                <span className="eyebrow">In this guide</span>
                {guide.sections.map((s, i) => (
                  <a key={s.heading} href={`#section-${i}`}>
                    {s.heading}
                  </a>
                ))}
              </nav>
              {guide.sections.map((s, i) => (
                <section key={s.heading} id={`section-${i}`}>
                  <h2>{s.heading}</h2>
                  {s.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </section>
              ))}
              <aside className="note">
                <h2>Put it into practice</h2>
                <p>
                  Try the workspace, check the result, then use the related
                  tools for the next step.
                </p>
                <a className="text-link" href={`/${guide.toolSlug}`}>
                  Open the tool <ArrowRight size={16} />
                </a>
              </aside>
            </article>
            <section className="content-section">
              <h2>Related tools</h2>
              <div className="tool-grid">
                {getRelatedTools(guide.toolSlug).map(card)}
              </div>
              <h2 className="mt-8">Keep reading</h2>
              <div className="related-guides">
                {getRelatedTools(guide.toolSlug).map((t) => (
                  <a key={t.slug} href={`/blog/${t.slug}-guide`}>
                    {GUIDES.find((g) => g.toolSlug === t.slug)!.title}
                    <ArrowUpRight size={16} />
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
        {path === "/about" && (
          <>
            <Breadcrumb items={[["The developer", "/about"]]} />
            <article className="article">
              <span className="eyebrow">The person behind the tools</span>
              <img
                src="/brand/logo.png"
                className="author-image"
                alt="Muhammad Ibrahim brand portrait"
                width={96}
                height={96}
              />
              <h1>
                Built by
                <br />
                Muhammad Ibrahim.
              </h1>
              <p className="article-intro">
                Technology executive, founder, and builder. 15+ years in
                software and technology, with a focus on blockchain, real-world
                assets, and AI infrastructure.
              </p>
              <section>
                <h2>Small tools. Useful outcomes.</h2>
                <p>
                  Ibrahim Tools is a collection of browser utilities for the
                  everyday work around building and publishing: preparing an
                  image, checking a piece of writing, inspecting a JSON
                  document, or getting a page’s metadata ready.
                </p>
                <p>
                  The goal is to make the task easy to start and clear to
                  finish. Every workspace has a guide, a statement of its
                  limitations, and links to the next useful tool. There are no
                  accounts, tool backends, or advertising scripts.
                </p>
              </section>
              <section>
                <h2>Connect with the developer</h2>
                <div className="profile-links">
                  <a href={AUTHOR_URL}>
                    Personal website <ArrowUpRight size={16} />
                  </a>
                  <a href="https://www.linkedin.com/in/iamibrahimwali/">
                    LinkedIn <ArrowUpRight size={16} />
                  </a>
                  <a href="https://github.com/Mibrahimwali">
                    GitHub <ArrowUpRight size={16} />
                  </a>
                  <a href="mailto:connect@ibrahimwali.com">
                    connect@ibrahimwali.com <ArrowUpRight size={16} />
                  </a>
                </div>
              </section>
              <section>
                <h2>Found an issue or need a tool?</h2>
                <p>
                  Email a description of what you expected and what happened,
                  along with the tool name and your browser. Leave private text,
                  documents, passwords, and other sensitive input out of your
                  message.
                </p>
                <a
                  className="button"
                  href="mailto:connect@ibrahimwali.com?subject=Ibrahim%20Tools%20feedback"
                >
                  Send feedback <ArrowUpRight size={16} />
                </a>
              </section>
            </article>
          </>
        )}
        {path === "/privacy" && (
          <>
            <Breadcrumb items={[["Privacy", "/privacy"]]} />
            <article className="article">
              <span className="eyebrow">Privacy by default</span>
              <h1>
                Your input.
                <br />
                Your browser.
              </h1>
              <p className="article-intro">
                Tool inputs and results are processed on your device. No account
                or upload service is required.
              </p>
              {[
                [
                  "Files and text",
                  "Images, text, dates, generated passwords, and other inputs are handled in browser memory. They are not sent to a tool API or stored by this application. Reloading or leaving a workspace clears that input. A device, browser extension, or clipboard manager may have its own access or retention behavior.",
                ],
                [
                  "Browser preferences",
                  "Favorites, recent tool slugs, and your theme preference are saved in this browser’s localStorage. These contain tool names and preferences, not tool input. They are not synced across devices. Use the button below to clear them.",
                ],
                [
                  "Analytics and hosting",
                  "With your permission, Google Analytics (G-PTMKFXTDC8) measures page usage and Microsoft Clarity (z6v4zidf6c) records interactions to help improve the site. Neither vendor loads before acceptance. Advertising consent stays denied. Tool workspaces and the directory search field are masked for Clarity; avoid entering sensitive data elsewhere on the page. Google page-view configuration omits query strings. Your analytics choice is saved on this origin for up to 180 days and can be changed using Cookie settings. Rejecting after analytics has loaded reloads the page to stop recording and clears unsaved tool input. Hosting providers may retain infrastructure logs. Fonts and branding assets are served from this site.",
                ],
                [
                  "Ask AI and external links",
                  "Ask AI prepares a question from the public page title and URL. Opening an assistant sends that prepared question to the provider; it never includes text or files entered in a workspace. Gemini and Copilot use a copy-and-open flow. Each provider has its own privacy policy, account requirements, and data practices. Review the question before sending and do not paste secrets.",
                ],
                [
                  "Contact",
                  "If you email connect@ibrahimwali.com, your email provider and the receiving mailbox handle that message. Include only the information needed to answer your question. This policy describes this tools application, not the separate portfolio or external services.",
                ],
              ].map(([h, p]) => (
                <section key={h}>
                  <h2>{h}</h2>
                  <p>{p}</p>
                </section>
              ))}
              <ClearPreferences />
            </article>
          </>
        )}
        {!page && (
          <section className="page-heading notfound">
            <span className="eyebrow">404 / Page not found</span>
            <h1>A small detour.</h1>
            <p>
              This address does not match a tool or guide. Search the directory
              to find what you need.
            </p>
            <a className="button" href="/">
              Back to all tools <ArrowRight size={16} />
            </a>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <a className="brand" href="/">
              <img src="/brand/logo.png" width={40} height={40} alt="" />
              <span>Ibrahim / tools</span>
            </a>
            <p>Useful things. A little less friction.</p>
            <a className="text-link" href={AUTHOR_URL}>
              By Muhammad Ibrahim <ArrowUpRight size={16} />
            </a>
          </div>
          <nav aria-label="Footer">
            <a href="/#all-tools">All tools</a>
            {Object.entries(TOOL_CATEGORIES).map(([id, c]) => (
              <a key={id} href={`/category/${id}`}>
                {c.label}
              </a>
            ))}
            <a href="/blog">Guides</a>
            <a href="/about">About</a>
            <a href="/privacy">Privacy</a>
            <CookieSettings />
            <a href="/llms.txt">For AI readers</a>
            <a href="mailto:connect@ibrahimwali.com">Feedback</a>
          </nav>
          <div className="footer-bottom">
            <span>© {CONTENT_DATE.slice(0, 4)} Muhammad Ibrahim</span>
            <span>No signup. No uploads. No ads.</span>
          </div>
        </div>
      </footer>
      <AnalyticsConsent />
      <AskAI
        title={
          tool?.shortName || guide?.title || page?.title || "Tool directory"
        }
        path={path}
      />
    </>
  );
}
function ClearPreferences() {
  const [done, setDone] = useState(false);
  return (
    <>
      <button
        className="button secondary"
        onClick={() => {
          try {
            ["mi-tools-favorites", "mi-tools-recent", "mi-tools-theme"].forEach(
              (k) => localStorage.removeItem(k),
            );
            setDone(true);
          } catch {
            setDone(false);
          }
        }}
      >
        Clear saved preferences
      </button>
      <p role="status">
        {done
          ? "Preferences cleared. Reload to reset this page’s display."
          : ""}
      </p>
    </>
  );
}
function WorkspaceLoading() {
  return (
    <div className="workspace-loading" role="status">
      <span className="eyebrow">Browser workspace</span>
      <p>Loading interactive controls…</p>
      <noscript>
        Enable JavaScript to run the tool. The instructions and guide below
        remain available.
      </noscript>
    </div>
  );
}
