import { useState, type ReactNode } from "react";
import {
  csvToJson,
  jsonToCsv,
  colorValues,
  contrastRatio,
  htmlDecode,
  escapeXml,
} from "../lib";
import { Field, Result, ErrorMessage, CopyButton } from "./WorkspaceUi";
import { EXTRA_DETAILS } from "../data/extra-tools";
function inline(source: string): ReactNode[] {
  return source
    .split(/(\*\*[^*]+\*\*|`[^`]+`|!?\[[^\]]*\]\([^)]+\))/g)
    .map((s, i) => {
      if (s.startsWith("**")) return <strong key={i}>{s.slice(2, -2)}</strong>;
      if (s.startsWith("`")) return <code key={i}>{s.slice(1, -1)}</code>;
      if (s.startsWith("![")) return <span key={i}>[Image omitted]</span>;
      const match = s.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match && /^https?:\/\//i.test(match[2]))
        return (
          <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </a>
        );
      return s;
    });
}
function Markdown({ source }: { source: string }) {
  let code: string[] | null = null;
  const out: ReactNode[] = [];
  source.split(/\r?\n/).forEach((s, i) => {
    if (s.startsWith("```")) {
      if (code) {
        out.push(
          <pre key={i}>
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = null;
      } else code = [];
      return;
    }
    if (code) {
      code.push(s);
      return;
    }
    if (!s.trim()) return;
    const h = s.match(/^(#{1,3}) (.*)/);
    if (h) {
      const H = h[1].length === 1 ? "h2" : "h3";
      out.push(<H key={i}>{inline(h[2])}</H>);
      return;
    }
    out.push(
      <p key={i}>
        {s.startsWith("- ") ? "• " : ""}
        {inline(s.replace(/^- /, ""))}
      </p>,
    );
  });
  const trailing = code as string[] | null;
  if (trailing) out.push(<pre key="unclosed">{trailing.join("\n")}</pre>);
  return (
    <div className="markdown-preview">
      {out.length ? (
        out
      ) : (
        <p className="helper">Your preview will appear here.</p>
      )}
    </div>
  );
}
export default function AdditionalTool({ slug }: { slug: string }) {
  const [input, setInput] = useState(""),
    [output, setOutput] = useState(""),
    [error, setError] = useState(""),
    [protect, setProtect] = useState(true),
    [fg, setFg] = useState("#20231e"),
    [bg, setBg] = useState("#f5f4ee"),
    [width, setWidth] = useState("1920"),
    [height, setHeight] = useState("1080"),
    [target, setTarget] = useState("1200");
  const run = (action = "encode") => {
    setError("");
    try {
      if (!input.trim()) throw new Error("Enter input or load the example.");
      setOutput(
        slug === "csv-to-json"
          ? csvToJson(input)
          : slug === "json-to-csv"
            ? jsonToCsv(input, protect)
            : action === "decode"
              ? htmlDecode(input)
              : escapeXml(input),
      );
    } catch (e) {
      setOutput("");
      setError((e as Error).message);
    }
  };
  if (slug === "color-converter") {
    let colors: ReturnType<typeof colorValues> | null = null;
    let err = "";
    if (input)
      try {
        colors = colorValues(input);
      } catch (e) {
        err = (e as Error).message;
      }
    return (
      <div className="tool-workspace">
        <div className="editor-panel">
          <Field label="HEX or RGB color">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="#d3f56b"
            />
          </Field>
          <button className="text-button" onClick={() => setInput("#d3f56b")}>
            Load example
          </button>
          <ErrorMessage message={err} />
        </div>
        <div className="editor-panel">
          {colors ? (
            <>
              <div
                className="color-swatch"
                style={{ backgroundColor: colors.hex }}
                aria-label={`Color ${colors.hex}`}
              />
              <Result value={[colors.hex, colors.rgb, colors.hsl].join("\n")} />
            </>
          ) : (
            <p className="helper">
              Enter a solid color to see HEX, RGB, and HSL values.
            </p>
          )}
        </div>
      </div>
    );
  }
  if (slug === "contrast-checker") {
    let ratio: number | null = null;
    let err = "";
    try {
      ratio = contrastRatio(fg, bg);
    } catch (e) {
      err = (e as Error).message;
    }
    return (
      <div className="tool-workspace">
        <div className="editor-panel">
          <Field label="Foreground color">
            <input value={fg} onChange={(e) => setFg(e.target.value)} />
          </Field>
          <Field label="Background color">
            <input value={bg} onChange={(e) => setBg(e.target.value)} />
          </Field>
          <ErrorMessage message={err} />
          <p className="helper">
            Opaque sRGB colors. The unrounded ratio is used for pass/fail
            decisions.
          </p>
        </div>
        <div className="editor-panel">
          {ratio !== null && (
            <>
              <div
                className="contrast-preview"
                style={{
                  color: colorValues(fg).hex,
                  backgroundColor: colorValues(bg).hex,
                }}
              >
                <strong>Aa</strong>
                <p>Readable text makes useful tools easier to use.</p>
              </div>
              <p className="big-result">{ratio.toFixed(2)}:1</p>
              <ul>
                {[
                  ["AA normal text", 4.5],
                  ["AA large text / non-text", 3],
                  ["AAA normal text", 7],
                  ["AAA large text", 4.5],
                ].map(([label, n]) => (
                  <li key={label}>
                    {label}:{" "}
                    <strong>{ratio! >= Number(n) ? "Pass" : "Fail"}</strong>
                  </li>
                ))}
              </ul>
              <p className="helper">
                Large text: at least 18 pt regular or 14 pt bold. A contrast
                pass alone is not full accessibility compliance.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
  if (slug === "aspect-ratio-calculator") {
    const w = Number(width),
      h = Number(height),
      t = Number(target);
    const valid = [w, h, t].every(
      (n) => Number.isInteger(n) && n > 0 && n <= 100000,
    );
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const result = valid
      ? `${w / gcd(w, h)}:${h / gcd(w, h)}\n${t} × ${Number(((t * h) / w).toFixed(2))} pixels`
      : "";
    return (
      <div className="tool-workspace">
        <div className="editor-panel">
          {[
            ["Original width", width, setWidth],
            ["Original height", height, setHeight],
            ["Target width", target, setTarget],
          ].map(([label, value, set]) => (
            <Field label={label as string} key={label as string}>
              <input
                type="number"
                min={1}
                max={100000}
                value={value as string}
                onChange={(e) => (set as (s: string) => void)(e.target.value)}
              />
            </Field>
          ))}
          {!valid && (
            <ErrorMessage message="Enter whole pixel values from 1 to 100,000." />
          )}
        </div>
        <div>
          <Result value={result} />
          <p className="helper mt-4">
            The first line is the simplified ratio; the second is the
            proportional output size. Round fractional pixels when exporting an
            image.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="tool-workspace">
      <div className="editor-panel">
        <Field
          label={slug === "markdown-preview" ? "Markdown source" : "Input"}
        >
          <textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={EXTRA_DETAILS[slug]?.example}
            spellCheck={false}
          />
        </Field>
        <button
          className="text-button"
          onClick={() => {
            setInput(EXTRA_DETAILS[slug]?.example || "");
            setOutput("");
          }}
        >
          Load example
        </button>
        {slug === "json-to-csv" && (
          <label className="check">
            <input
              type="checkbox"
              checked={protect}
              onChange={(e) => setProtect(e.target.checked)}
            />
            Protect against spreadsheet formulas
          </label>
        )}
        {slug === "markdown-preview" ? (
          <CopyButton text={input} label="Copy Markdown" />
        ) : (
          <div className="actions">
            <button className="button" onClick={() => run()}>
              {slug === "html-entity-encoder-decoder" ? "Encode" : "Convert"}
            </button>
            {slug === "html-entity-encoder-decoder" && (
              <button
                className="button secondary"
                onClick={() => run("decode")}
              >
                Decode
              </button>
            )}
          </div>
        )}
        <ErrorMessage message={error} />
      </div>
      {slug === "markdown-preview" ? (
        <section className="editor-panel">
          <h2>Safe preview</h2>
          <Markdown source={input} />
        </section>
      ) : (
        <Result
          value={output}
          filename={
            slug === "csv-to-json"
              ? "data.json"
              : slug === "json-to-csv"
                ? "data.csv"
                : undefined
          }
        />
      )}
    </div>
  );
}
