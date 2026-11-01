import {
  useState,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{ id?: string; "aria-describedby"?: string }>,
        { id, "aria-describedby": hint ? id + "-hint" : undefined },
      )
    : children;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export function CopyButton({
  text,
  label = "Copy result",
}: {
  text: string;
  label?: string;
}) {
  const [status, setStatus] = useState("");
  useEffect(() => setStatus(""), [text]);
  return (
    <>
      <button
        className="button secondary"
        disabled={!text}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setStatus("Copied");
          } catch {
            setStatus(
              "Copy unavailable. Select the result and copy it manually.",
            );
          }
        }}
      >
        {status === "Copied" ? "Copied ✓" : label}
      </button>
      <span role="status" className="helper">
        {status !== "Copied" ? status : ""}
      </span>
    </>
  );
}
export function Result({
  value,
  filename,
}: {
  value: string;
  filename?: string;
}) {
  return (
    <section className="result-box">
      <div className="result-bar">
        <span className="eyebrow">Output</span>
        <div className="actions">
          <CopyButton text={value} />
          {filename && (
            <button
              className="button secondary"
              disabled={!value}
              onClick={() => {
                const u = URL.createObjectURL(
                  new Blob([value], { type: "text/plain;charset=utf-8" }),
                );
                const a = document.createElement("a");
                a.href = u;
                a.download = filename;
                a.click();
                setTimeout(() => URL.revokeObjectURL(u), 1000);
              }}
            >
              Download
            </button>
          )}
        </div>
      </div>
      <textarea
        aria-label="Result"
        readOnly
        value={value}
        rows={8}
        placeholder="Your result will appear here."
        spellCheck={false}
      />
    </section>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="error">
      {message}
    </p>
  ) : null;
}
