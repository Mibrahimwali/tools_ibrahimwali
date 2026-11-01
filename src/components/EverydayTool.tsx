import { useState } from "react";
import { calendarAge } from "../lib";
import { Field, CopyButton, ErrorMessage } from "./WorkspaceUi";
export default function EverydayTool({ slug }: { slug: string }) {
  const [text, setText] = useState(""),
    [dob, setDob] = useState(""),
    [asOf, setAsOf] = useState(""),
    [a, setA] = useState("20"),
    [b, setB] = useState("150"),
    [mode, setMode] = useState("of");
  if (["word-counter", "character-counter"].includes(slug)) {
    const words = text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
    const metrics = [
      ["Words", words.length],
      ["Characters", Array.from(text).length],
      ["Without spaces", Array.from(text.replace(/\s/gu, "")).length],
      [
        "Sentences",
        text.trim()
          ? text
              .trim()
              .split(/[.!?]+(?:\s|$)/)
              .filter((s) => s.trim()).length
          : 0,
      ],
      [
        "Paragraphs",
        text.trim() ? text.split(/\n\s*\n/).filter((s) => s.trim()).length : 0,
      ],
      ["Reading minutes", Math.ceil(words.length / 200)],
    ];
    return (
      <div className="tool-workspace">
        <div className="editor-panel">
          <Field label="Your text">
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing or paste your text…"
            />
          </Field>
          <div className="actions">
            <CopyButton text={text} />
            <button className="button secondary" onClick={() => setText("")}>
              Clear
            </button>
          </div>
        </div>
        <div>
          <div className="metrics" aria-live="polite">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <strong>{value.toLocaleString("en-US")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="helper mt-4">
            Reading time assumes 200 words per minute. Counts are estimates;
            punctuation, language, and emoji can change how other editors count.
          </p>
        </div>
      </div>
    );
  }
  if (slug === "age-calculator") {
    let age: ReturnType<typeof calendarAge> | undefined;
    let error = "";
    if (dob && asOf)
      try {
        age = calendarAge(dob, asOf);
      } catch (e) {
        error = (e as Error).message;
      }
    return (
      <div className="tool-workspace">
        <div className="editor-panel">
          <Field label="Date of birth">
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
          <Field label="Age as of">
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </Field>
          <button
            className="text-button"
            onClick={() => {
              const d = new Date();
              setAsOf(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              );
            }}
          >
            Use today
          </button>
          <ErrorMessage message={error} />
        </div>
        <div className="editor-panel">
          <h2>Calendar age</h2>
          {age ? (
            <>
              <div className="metrics">
                {[
                  ["Years", age.years],
                  ["Months", age.months],
                  ["Days", age.days],
                ].map(([label, value]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="helper mt-4">
                {age.totalDays.toLocaleString("en-US")} elapsed days. Month
                anniversaries use the last valid calendar day where needed.
              </p>
            </>
          ) : (
            <p className="helper">
              Choose a birth date and a reference date to see your result.
            </p>
          )}
        </div>
      </div>
    );
  }
  const x = Number(a),
    y = Number(b);
  const valid =
    a.trim() !== "" &&
    b.trim() !== "" &&
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    (mode === "of" || y !== 0);
  const value = valid
    ? mode === "of"
      ? (x * y) / 100
      : mode === "change"
        ? ((x - y) / y) * 100
        : (x / y) * 100
    : null;
  const result =
    value !== null && Number.isFinite(value)
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(
          value,
        ) + (mode === "of" ? "" : "%")
      : "";
  return (
    <div className="tool-workspace">
      <div className="editor-panel">
        <Field label="Calculation">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="of">X percent of Y</option>
            <option value="change">Percentage change (old → new)</option>
            <option value="reverse">X is what percent of Y?</option>
          </select>
        </Field>
        <Field
          label={
            mode === "change"
              ? "New value"
              : mode === "of"
                ? "Percentage (X)"
                : "Value (X)"
          }
        >
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </Field>
        <Field label={mode === "change" ? "Old value" : "Whole (Y)"}>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </Field>
      </div>
      <div className="editor-panel">
        <h2>Result</h2>
        <p className="big-result" aria-live="polite">
          {result || "—"}
        </p>
        <p className="helper">
          {mode === "of"
            ? "X × Y ÷ 100"
            : mode === "change"
              ? "(New − old) ÷ old × 100"
              : "X ÷ Y × 100"}
        </p>
        {result ? (
          <CopyButton text={result} />
        ) : (
          <p className="helper">
            Enter finite numbers. Percentage ratios cannot divide by zero.
          </p>
        )}
      </div>
    </div>
  );
}
