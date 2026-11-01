import { useState } from "react";
import { EXTRA_DETAILS } from "../data/extra-tools";
import {
  encode64,
  decode64,
  formatJson,
  slugify,
  sitemapXml,
  robotsTxt,
  randomPassword,
  escapeXml,
} from "../lib";
import { Field, Result, ErrorMessage } from "./WorkspaceUi";

export default function ExtraTool({ slug }: { slug: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [length, setLength] = useState(24);
  const [count, setCount] = useState(5);
  const [checks, setChecks] = useState([true, true, true, false]);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trim, setTrim] = useState(true);
  const [mode, setMode] = useState("seconds");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [paths, setPaths] = useState("");
  const [busy, setBusy] = useState(false);
  const details = EXTRA_DETAILS[slug];
  const run = async (action: string) => {
    setError("");
    setBusy(true);
    try {
      let result = "";
      if (
        ![
          "uuid-generator",
          "password-generator",
          "meta-tag-preview",
          "robots-txt-generator",
          "utm-builder",
        ].includes(slug) &&
        action !== "from-date" &&
        !input.trim()
      )
        throw new Error("Enter some input first, or load the example.");
      switch (slug) {
        case "json-formatter":
          result = formatJson(input, action === "minify");
          break;
        case "base64-encoder-decoder":
          result = action === "decode" ? decode64(input) : encode64(input);
          break;
        case "url-encoder-decoder":
          result =
            action === "decode"
              ? decodeURIComponent(input)
              : encodeURIComponent(input);
          break;
        case "uuid-generator":
          if (!Number.isInteger(count) || count < 1 || count > 100)
            throw new Error("Choose 1 to 100 identifiers.");
          result = Array.from({ length: count }, () =>
            crypto.randomUUID(),
          ).join("\n");
          break;
        case "password-generator":
          result = randomPassword(
            length,
            [
              "abcdefghijklmnopqrstuvwxyz",
              "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              "0123456789",
              "!@#$%^&*()-_=+[]{}:,.?",
            ].filter((_, i) => checks[i]),
          );
          break;
        case "slug-generator":
          result = slugify(input);
          if (!result)
            throw new Error(
              "Include at least one Latin letter or digit for an ASCII slug.",
            );
          break;
        case "case-converter":
          result =
            action === "upper"
              ? input.toUpperCase()
              : action === "lower"
                ? input.toLowerCase()
                : action === "title"
                  ? input
                      .toLowerCase()
                      .replace(/(^|\s)\p{L}/gu, (s) => s.toUpperCase())
                  : input
                      .toLowerCase()
                      .replace(/(^|[.!?]\s+)\p{L}/gu, (s) => s.toUpperCase());
          break;
        case "remove-duplicate-lines": {
          const seen = new Set<string>();
          result = input
            .split(/\r?\n/)
            .filter((line) => {
              const v = trim ? line.trim() : line;
              const key = ignoreCase ? v.toLocaleLowerCase() : v;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .join("\n");
          break;
        }
        case "sha256-generator":
          result = Array.from(
            new Uint8Array(
              await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(input),
              ),
            ),
            (n) => n.toString(16).padStart(2, "0"),
          ).join("");
          break;
        case "timestamp-converter": {
          if (action === "from-date") {
            if (!date) throw new Error("Select a UTC date and time.");
            const time = new Date(date + "Z").getTime();
            if (!Number.isFinite(time)) throw new Error("Choose a valid date.");
            result = String(
              mode === "seconds" ? Math.floor(time / 1000) : time,
            );
          } else {
            if (!/^-?\d+$/.test(input.trim()))
              throw new Error("Enter a whole-number timestamp.");
            const n = Number(input);
            if (!Number.isSafeInteger(n))
              throw new Error("Timestamp exceeds safe integer precision.");
            const d = new Date(n * (mode === "seconds" ? 1000 : 1));
            if (!Number.isFinite(+d))
              throw new Error("Timestamp is outside the supported date range.");
            result = d.toISOString();
          }
          break;
        }
        case "meta-tag-preview": {
          if (!title.trim() || !description.trim())
            throw new Error("Add a title and description.");
          const u = new URL(url);
          if (
            !["http:", "https:"].includes(u.protocol) ||
            u.username ||
            u.password
          )
            throw new Error("Use a public HTTP or HTTPS URL.");
          u.hash = "";
          result = `<title>${escapeXml(title)}</title>\n<meta name="description" content="${escapeXml(description)}" />\n<link rel="canonical" href="${escapeXml(u.href)}" />\n<meta property="og:title" content="${escapeXml(title)}" />\n<meta property="og:description" content="${escapeXml(description)}" />\n<meta property="og:url" content="${escapeXml(u.href)}" />`;
          break;
        }
        case "robots-txt-generator":
          result = robotsTxt(url, paths);
          break;
        case "sitemap-generator":
          result = sitemapXml(input);
          break;
        case "utm-builder": {
          const u = new URL(url);
          if (
            !["http:", "https:"].includes(u.protocol) ||
            u.username ||
            u.password
          )
            throw new Error("Use a public HTTP or HTTPS destination.");
          if (!source.trim() || !medium.trim() || !campaign.trim())
            throw new Error("Add a source, medium, and campaign.");
          for (const [k, v] of Object.entries({
            source,
            medium,
            campaign,
            term,
            content,
          })) {
            if (v.trim()) u.searchParams.set("utm_" + k, v.trim());
            else u.searchParams.delete("utm_" + k);
          }
          result = u.href;
          break;
        }
      }
      setOutput(result);
    } catch (e) {
      setOutput("");
      setError(
        e instanceof Error ? e.message : "Could not process this input.",
      );
    } finally {
      setBusy(false);
    }
  };
  const special = [
    "uuid-generator",
    "password-generator",
    "meta-tag-preview",
    "robots-txt-generator",
    "utm-builder",
  ].includes(slug);
  const actions =
    slug === "json-formatter"
      ? [
          ["format", "Format JSON"],
          ["minify", "Minify"],
        ]
      : ["base64-encoder-decoder", "url-encoder-decoder"].includes(slug)
        ? [
            ["encode", "Encode"],
            ["decode", "Decode"],
          ]
        : slug === "case-converter"
          ? [
              ["upper", "UPPERCASE"],
              ["lower", "lowercase"],
              ["title", "Title Case"],
              ["sentence", "Sentence case"],
            ]
          : slug === "timestamp-converter"
            ? [
                ["to-date", "Convert timestamp"],
                ["from-date", "Convert UTC date"],
              ]
            : [
                [
                  "run",
                  slug === "password-generator"
                    ? "Generate password"
                    : slug === "uuid-generator"
                      ? "Generate UUIDs"
                      : "Generate result",
                ],
              ];
  return (
    <div className="tool-workspace">
      <div className="editor-panel">
        {!special && (
          <>
            <Field
              label={
                slug === "timestamp-converter" ? "Unix timestamp" : "Input"
              }
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={slug === "timestamp-converter" ? 2 : 7}
                placeholder={details?.example}
                spellCheck={false}
              />
            </Field>
            <button
              className="text-button"
              onClick={() => {
                setInput(details?.example || "");
                setOutput("");
                setError("");
              }}
            >
              Load example
            </button>
          </>
        )}
        {slug === "uuid-generator" && (
          <Field label="Number of UUIDs">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </Field>
        )}
        {slug === "password-generator" && (
          <>
            <Field label={`Password length: ${length}`}>
              <input
                type="range"
                min={8}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </Field>
            <fieldset>
              <legend>Include character sets</legend>
              {[
                "Lowercase letters",
                "Uppercase letters",
                "Digits",
                "Symbols",
              ].map((s, i) => (
                <label key={s} className="check">
                  <input
                    type="checkbox"
                    checked={checks[i]}
                    onChange={() =>
                      setChecks((v) => v.map((c, j) => (i === j ? !c : c)))
                    }
                  />
                  {s}
                </label>
              ))}
            </fieldset>
          </>
        )}
        {slug === "remove-duplicate-lines" && (
          <div className="actions">
            <label className="check">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
              />
              Ignore case
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={trim}
                onChange={(e) => setTrim(e.target.checked)}
              />
              Ignore surrounding whitespace
            </label>
          </div>
        )}
        {slug === "timestamp-converter" && (
          <div className="form-grid">
            <Field label="Timestamp units">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </select>
            </Field>
            <Field label="UTC date and time">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                step="1"
              />
            </Field>
          </div>
        )}
        {slug === "meta-tag-preview" && (
          <>
            <Field label={`Page title (${title.length} characters)`}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your useful page title"
              />
            </Field>
            <Field
              label={`Meta description (${description.length} characters)`}
            >
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </>
        )}
        {["meta-tag-preview", "robots-txt-generator", "utm-builder"].includes(
          slug,
        ) && (
          <Field
            label={
              slug === "robots-txt-generator"
                ? "Absolute sitemap URL"
                : "Page URL"
            }
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/"
            />
          </Field>
        )}
        {slug === "robots-txt-generator" && (
          <Field label="Disallow paths (optional, one per line)">
            <textarea
              rows={4}
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              placeholder="/admin/"
            />
          </Field>
        )}
        {slug === "utm-builder" && (
          <div className="form-grid">
            {[
              ["Source", source, setSource],
              ["Medium", medium, setMedium],
              ["Campaign", campaign, setCampaign],
              ["Term (optional)", term, setTerm],
              ["Content (optional)", content, setContent],
            ].map(([name, value, setter]) => (
              <Field key={name as string} label={name as string}>
                <input
                  value={value as string}
                  onChange={(e) =>
                    (setter as (s: string) => void)(e.target.value)
                  }
                />
              </Field>
            ))}
          </div>
        )}
        <div className="actions">
          {actions.map(([action, label]) => (
            <button
              className="button"
              key={action}
              onClick={() => void run(action)}
              disabled={busy}
            >
              {busy ? "Working…" : label}
            </button>
          ))}
          <button
            className="button secondary"
            onClick={() => {
              setInput("");
              setOutput("");
              setError("");
            }}
          >
            Clear result
          </button>
        </div>
        <ErrorMessage message={error} />
      </div>
      <div>
        {slug === "meta-tag-preview" && (
          <div className="search-preview">
            <small>{url || "https://example.com"}</small>
            <p>{title || "Your page title appears here"}</p>
            <span>
              {description ||
                "A useful, specific summary helps people decide whether this page answers their question."}
            </span>
            <small>
              Illustrative preview. Search engines can change the displayed
              snippet.
            </small>
          </div>
        )}
        <Result
          value={output}
          filename={
            slug === "sitemap-generator"
              ? "sitemap.xml"
              : slug === "robots-txt-generator"
                ? "robots.txt"
                : undefined
          }
        />
        <p className="helper mt-4">{details?.limitation}</p>
      </div>
    </div>
  );
}
