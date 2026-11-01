import QrCodeGeneratorTool from "./tools/QrCodeGeneratorTool";
import ImageTool from "./ImageTool";
import EverydayTool from "./EverydayTool";
import ExtraTool from "./ExtraTool";
import AdditionalTool from "./AdditionalTool";
export default function ToolRuntime({ slug }: { slug: string }) {
  if (
    [
      "csv-to-json",
      "json-to-csv",
      "markdown-preview",
      "html-entity-encoder-decoder",
      "color-converter",
      "contrast-checker",
      "aspect-ratio-calculator",
    ].includes(slug)
  )
    return <AdditionalTool slug={slug} />;
  if (slug === "qr-code-generator") return <QrCodeGeneratorTool />;
  if (
    [
      "image-compressor",
      "image-resizer",
      "jpg-to-png",
      "png-to-jpg",
      "webp-converter",
    ].includes(slug)
  )
    return <ImageTool slug={slug} />;
  if (
    [
      "word-counter",
      "character-counter",
      "age-calculator",
      "percentage-calculator",
    ].includes(slug)
  )
    return <EverydayTool slug={slug} />;
  return <ExtraTool slug={slug} />;
}
