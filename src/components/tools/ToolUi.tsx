import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Upload, X } from "lucide-react";

interface ImageDropzoneProps {
  accept: string;
  hint: string;
  file: File | null;
  onFile: (file: File | null) => void;
  previewUrl?: string | null;
  children?: ReactNode;
}

export function ImageDropzone({
  accept,
  hint,
  file,
  onFile,
  previewUrl,
  children,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    pick(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all ${
          drag
            ? "border-primary bg-primary/10"
            : "border-border/70 bg-card/30 hover:border-primary/50 hover:bg-card/50"
        }`}
      >
        <Upload className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
        <p className="text-sm font-medium mb-1">
          {file ? file.name : "Drop an image here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          aria-label="Choose an image"
          className="hidden"
          onChange={onChange}
        />
      </div>

      {(previewUrl || file) && (
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-black/40 max-h-64 flex items-center justify-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 object-contain"
            />
          )}
          <button
            type="button"
            aria-label="Clear image"
            onClick={(e) => {
              e.stopPropagation();
              onFile(null);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

export function ToolPanel({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-border/50 p-5 sm:p-7">
      {title && (
        <h2 className="font-heading text-sm font-semibold text-primary mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}
