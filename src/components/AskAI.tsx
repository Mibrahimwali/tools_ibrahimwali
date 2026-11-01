import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUpRight, X, Copy } from "lucide-react";
import { SITE_URL } from "../lib";
export default function AskAI({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [open, setOpen] = useState(false),
    [status, setStatus] = useState("");
  const trigger = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null);
  const question = `Explain this page from Ibrahim Tools: ${title}. ${SITE_URL}${path}. What does this tool or guide help with, how should I use it, and what limitations should I check? If you cannot open the page, say so. Do not assume access to any private input.`;
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (e: MouseEvent) => {
      if (
        !panel.current?.contains(e.target as Node) &&
        !trigger.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("mousedown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", outside);
    };
  }, [open]);
  const copy = () =>
    navigator.clipboard
      .writeText(question)
      .then(() =>
        setStatus("Question copied. Paste it into your chosen assistant."),
      )
      .catch(() =>
        setStatus("Copy was blocked. Select and copy the question below."),
      );
  const platforms = [
    {
      name: "ChatGPT",
      note: "Open with question",
      href: `https://chatgpt.com/?q=${encodeURIComponent(question)}`,
    },
    {
      name: "Claude",
      note: "Open with question",
      href: `https://claude.ai/new?q=${encodeURIComponent(question)}`,
    },
    {
      name: "Perplexity",
      note: "Open with question",
      href: `https://www.perplexity.ai/search?q=${encodeURIComponent(question)}`,
    },
    {
      name: "Gemini",
      note: "Copy question & open",
      href: "https://gemini.google.com/app",
      copy: true,
    },
    {
      name: "Copilot",
      note: "Copy question & open",
      href: "https://copilot.microsoft.com/",
      copy: true,
    },
  ];
  return (
    <div className="ai-widget">
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="ask-title"
          className="ai-panel"
        >
          <div className="section-line">
            <h2 id="ask-title">Ask about this page</h2>
            <button
              className="icon-button"
              aria-label="Close Ask AI"
              onClick={close}
            >
              <X size={18} />
            </button>
          </div>
          <p className="helper">
            Choose your assistant. Only the public page title and URL are
            included. Your tool input is never added.
          </p>
          <div className="ai-platforms">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (p.copy) void copy();
                }}
              >
                <span>
                  {p.name}
                  <small>{p.note}</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
          <label className="field">
            <span>Prepared question</span>
            <textarea rows={4} readOnly value={question} />
          </label>
          <button className="text-button" onClick={() => void copy()}>
            <Copy size={14} />
            Copy question
          </button>
          <p role="status" className="helper">
            {status}
          </p>
          <p className="fine-print">
            External services have their own privacy policies. Some require an
            account. AI answers can be inaccurate.
          </p>
        </div>
      )}
      <button
        ref={trigger}
        className="ask-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Sparkles size={18} />
        Ask AI
      </button>
    </div>
  );
}
