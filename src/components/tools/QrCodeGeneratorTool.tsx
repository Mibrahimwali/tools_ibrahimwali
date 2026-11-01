import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check } from "lucide-react";
import { PrimaryButton, ToolPanel } from "./ToolUi";
import { downloadBlob } from "./imageUtils";

const QrCodeGeneratorTool = () => {
  const [text, setText] = useState("https://ibrahimwali.com");
  const [size, setSize] = useState(280);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!text.trim()) {
        setDataUrl("");
        return;
      }
      try {
        const url = await QRCode.toDataURL(text.trim(), {
          width: size,
          margin: 2,
          errorCorrectionLevel: level,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Could not generate QR code for this input.");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [text, size, level]);

  const download = async () => {
    if (!dataUrl) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, "qr-code.png");
  };

  const copy = async () => {
    if (!dataUrl) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ToolPanel title="QR content">
        <label
          htmlFor="qr-text"
          className="block text-xs text-muted-foreground mb-2"
        >
          URL or text
        </label>
        <textarea
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-background/60 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary resize-y"
          placeholder="https://example.com"
        />

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label
              htmlFor="qr-size"
              className="block text-xs text-muted-foreground mb-2"
            >
              Size: {size}px
            </label>
            <input
              id="qr-size"
              type="range"
              min={128}
              max={1024}
              step={8}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label
              htmlFor="qr-level"
              className="block text-xs text-muted-foreground mb-2"
            >
              Error correction
            </label>
            <select
              id="qr-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="w-full rounded-xl bg-background/60 border border-border px-3 py-2 text-sm"
            >
              <option value="L">L — ~7% recovery</option>
              <option value="M">M — ~15% recovery</option>
              <option value="Q">Q — ~25% recovery</option>
              <option value="H">H — ~30% recovery</option>
            </select>
          </div>
        </div>
        {error && <p className="text-xs text-destructive mt-3">{error}</p>}
      </ToolPanel>

      <ToolPanel title="Preview & download">
        <div className="rounded-xl bg-white p-6 flex items-center justify-center min-h-[240px]">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Generated QR code"
              className="max-w-full"
              width={size}
              height={size}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter text to generate a QR code
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <PrimaryButton onClick={download} disabled={!dataUrl}>
            <Download className="w-4 h-4" /> Download PNG
          </PrimaryButton>
          <button
            type="button"
            onClick={() =>
              void copy().catch(() =>
                setError(
                  "Image copying is unavailable. Download the PNG instead.",
                ),
              )
            }
            disabled={!dataUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border text-sm disabled:opacity-40 hover:border-primary/50"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied" : "Copy image"}
          </button>
        </div>
      </ToolPanel>
    </div>
  );
};

export default QrCodeGeneratorTool;
