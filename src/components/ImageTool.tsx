import { useEffect, useRef, useState } from "react";
import { Field, ErrorMessage } from "./WorkspaceUi";
import { ImageDropzone } from "./tools/ToolUi";
import {
  loadImageFromFile,
  drawImageToCanvas,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  replaceExt,
} from "./tools/imageUtils";
export default function ImageTool({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [output, setOutput] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [width, setWidth] = useState(800),
    [height, setHeight] = useState(600),
    [lock, setLock] = useState(true),
    [natural, setNatural] = useState({ w: 0, h: 0 }),
    [quality, setQuality] = useState(80),
    [type, setType] = useState("image/jpeg");
  const blobRef = useRef<Blob | null>(null),
    version = useRef(0);
  useEffect(() => {
    let live = true;
    version.current++;
    setOutput("");
    blobRef.current = null;
    setError("");
    setNatural({ w: 0, h: 0 });
    if (!file) {
      setPreview("");
      setNatural({ w: 0, h: 0 });
      return;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    loadImageFromFile(file)
      .then((img) => {
        if (!live) return;
        if (img.naturalWidth * img.naturalHeight > 24000000) {
          setError(
            "Use an image up to 24 megapixels to avoid exhausting browser memory.",
          );
          return;
        }
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      })
      .catch(() => {
        if (live)
          setError(
            "Could not decode this image. Choose a valid JPG, PNG, or WebP.",
          );
      });
    return () => {
      live = false;
      URL.revokeObjectURL(u);
    };
  }, [file]);
  useEffect(
    () => () => {
      if (output) URL.revokeObjectURL(output);
    },
    [output],
  );
  const pick = (f: File | null) => {
    setError("");
    if (
      f &&
      (!["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
        f.size > 20 * 1024 * 1024)
    ) {
      setError("Choose a JPG, PNG, or WebP image under 20 MB.");
      return;
    }
    setFile(f);
  };
  const run = async () => {
    if (!file) return;
    const v = version.current;
    setBusy(true);
    setError("");
    setOutput("");
    blobRef.current = null;
    try {
      const img = await loadImageFromFile(file);
      const resize = slug === "image-resizer";
      const w = resize ? width : img.naturalWidth,
        h = resize ? height : img.naturalHeight;
      if (
        !Number.isInteger(w) ||
        !Number.isInteger(h) ||
        w < 1 ||
        h < 1 ||
        w * h > 24000000 ||
        w > 10000 ||
        h > 10000
      )
        throw new Error(
          "Choose whole pixel dimensions, up to 10,000 per side and 24 megapixels total.",
        );
      const mime =
        slug === "jpg-to-png"
          ? "image/png"
          : slug === "png-to-jpg"
            ? "image/jpeg"
            : resize
              ? file.type
              : type;
      const canvas = drawImageToCanvas(
        img,
        w,
        h,
        mime === "image/jpeg" ? "#fff" : undefined,
      );
      const b = await canvasToBlob(canvas, mime, quality / 100);
      if (v !== version.current) return;
      blobRef.current = b;
      setOutput(URL.createObjectURL(b));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Image processing failed. Try a smaller file.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="tool-workspace">
      <div className="editor-panel">
        <h2>Your image</h2>
        <ImageDropzone
          accept="image/jpeg,image/png,image/webp"
          hint="JPG, PNG, WebP · up to 20 MB / 24 megapixels"
          file={file}
          onFile={pick}
          previewUrl={preview}
        />
        <ErrorMessage message={error} />
      </div>
      <div className="editor-panel">
        <h2>{slug === "image-resizer" ? "Set dimensions" : "Choose output"}</h2>
        {slug === "image-resizer" ? (
          <>
            <div className="form-grid">
              <Field label="Width (pixels)">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={width}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setWidth(w);
                    if (lock && natural.w)
                      setHeight(Math.round((w / natural.w) * natural.h));
                  }}
                />
              </Field>
              <Field label="Height (pixels)">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={height}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setHeight(h);
                    if (lock && natural.h)
                      setWidth(Math.round((h / natural.h) * natural.w));
                  }}
                />
              </Field>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={lock}
                onChange={(e) => setLock(e.target.checked)}
              />
              Lock aspect ratio
            </label>
          </>
        ) : !["jpg-to-png", "png-to-jpg"].includes(slug) ? (
          <Field label="Output format">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="image/jpeg">
                JPEG · white transparency background
              </option>
              <option value="image/png">PNG · preserves transparency</option>
              {slug === "image-compressor" && (
                <option value="image/webp">WebP · supports transparency</option>
              )}
            </select>
          </Field>
        ) : (
          <p className="helper">
            Output:{" "}
            {slug === "jpg-to-png"
              ? "PNG (does not add transparency or recover detail)"
              : "JPEG (transparent areas become white)"}
          </p>
        )}
        <Field
          label={`JPEG / WebP quality: ${quality}%`}
          hint="PNG is lossless and ignores the quality slider."
        >
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </Field>
        <button
          className="button"
          disabled={!file || !natural.w || busy}
          onClick={() => void run()}
        >
          {busy
            ? "Processing…"
            : slug === "image-resizer"
              ? "Resize image"
              : slug === "image-compressor"
                ? "Compress image"
                : "Convert image"}
        </button>
        {output && blobRef.current && file && (
          <div className="image-result">
            <img src={output} alt="Processed image preview" />
            <p>
              {formatBytes(file.size)} → {formatBytes(blobRef.current.size)}
            </p>
            {blobRef.current.size >= file.size && (
              <p className="helper">
                The result is not smaller. Try a lower quality or resize first.
              </p>
            )}
            <button
              className="button"
              onClick={() => {
                const blob = blobRef.current;
                if (blob)
                  downloadBlob(
                    blob,
                    replaceExt(
                      file.name,
                      blob.type === "image/png"
                        ? "png"
                        : blob.type === "image/webp"
                          ? "webp"
                          : "jpg",
                    ),
                  );
              }}
            >
              Download image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
