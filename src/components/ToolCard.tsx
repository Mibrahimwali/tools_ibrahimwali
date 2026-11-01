import {
  ArrowUpRight,
  Image,
  Type,
  Braces,
  ScanSearch,
  Calculator,
  QrCode,
  Star,
} from "lucide-react";
import { TOOL_CATEGORIES, type ToolDefinition } from "../data/tools";
const icons = {
  image: Image,
  text: Type,
  developer: Braces,
  seo: ScanSearch,
  calculator: Calculator,
  generator: QrCode,
};
export default function ToolCard({
  tool,
  saved,
  onSave,
}: {
  tool: ToolDefinition;
  saved: boolean;
  onSave: () => void;
}) {
  const Icon = icons[tool.category];
  return (
    <article className="tool-card">
      <div className="card-top">
        <span className={`tool-icon ${tool.category}`}>
          <Icon size={21} aria-hidden />
        </span>
        <button
          className={`icon-button ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          aria-pressed={saved}
          aria-label={`${saved ? "Unsave" : "Save"} ${tool.shortName}`}
        >
          <Star size={16} />
        </button>
      </div>
      <a href={`/${tool.slug}`} className="tool-card-link">
        <h3>
          {tool.shortName}
          <ArrowUpRight size={18} aria-hidden />
        </h3>
        <p>{tool.description}</p>
      </a>
      <a className="category-label" href={`/category/${tool.category}`}>
        {TOOL_CATEGORIES[tool.category].label}
      </a>
    </article>
  );
}
