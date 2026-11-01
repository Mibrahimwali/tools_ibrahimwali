import { EXTRA_TOOLS } from "./extra-tools";
import type { ComponentType } from "react";

export type ToolCategory =
  "image" | "text" | "calculator" | "generator" | "developer" | "seo";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  keywords: string;
  category: ToolCategory;
  icon: string;
  related: string[];
  howTo: string[];
  faqs: ToolFaq[];
  benefits: string[];
}

export const TOOL_CATEGORIES: Record<
  ToolCategory,
  { label: string; blurb: string }
> = {
  developer: {
    label: "Developer Tools",
    blurb: "Format, encode, hash, and debug without a server.",
  },
  seo: {
    label: "SEO Tools",
    blurb: "Prepare metadata, crawl directives, and campaign links.",
  },
  generator: {
    label: "Generators",
    blurb: "Create assets instantly in your browser.",
  },
  image: {
    label: "Image Tools",
    blurb: "Compress, resize, and convert images privately.",
  },
  text: {
    label: "Text Tools",
    blurb: "Count words and characters for SEO and writing.",
  },
  calculator: {
    label: "Calculators",
    blurb: "Fast answers for everyday number questions.",
  },
};

const ORIGINAL_TOOLS: ToolDefinition[] = [
  {
    slug: "qr-code-generator",
    name: "Free QR Code Generator",
    shortName: "QR Code Generator",
    tagline:
      "Create downloadable QR codes for URLs, text, Wi‑Fi, and more — free, private, instant.",
    description:
      "Generate high-quality QR codes online for free. Create QR codes for websites, contact details, and text, then download as PNG. No signup. Files never leave your browser.",
    keywords:
      "qr code generator, free qr code, create qr code, qr code maker, download qr png, online qr generator",
    category: "generator",
    icon: "QrCode",
    related: [
      "image-compressor",
      "image-resizer",
      "word-counter",
      "percentage-calculator",
    ],
    howTo: [
      "Enter a URL or any text you want encoded.",
      "Choose size and error-correction level.",
      "Preview the generated QR code.",
      "Download a crisp PNG ready for print or digital use.",
    ],
    faqs: [
      {
        question: "Is this QR code generator free?",
        answer:
          "Yes. You can create and download unlimited QR codes with no signup, watermark, or account.",
      },
      {
        question: "Do you store my QR data?",
        answer:
          "No. Generation happens entirely in your browser. Nothing is uploaded to a server.",
      },
      {
        question: "Can I use the QR code commercially?",
        answer:
          "Yes. The PNG you download is yours to use on websites, packaging, posters, and business cards.",
      },
    ],
    benefits: [
      "Works offline after the page loads",
      "Print-ready PNG export",
      "No watermarks or redirect service",
    ],
  },
  {
    slug: "image-compressor",
    name: "Free Image Compressor",
    shortName: "Image Compressor",
    tagline:
      "Shrink JPG, PNG, and WebP file size without leaving your browser.",
    description:
      "Compress images online for free. Reduce JPG, PNG, and WebP file sizes for faster websites and emails while keeping visual quality. Private — processing stays on your device.",
    keywords:
      "image compressor, compress jpg, compress png, reduce image size, free image optimizer, compress photo online",
    category: "image",
    icon: "Minimize2",
    related: ["image-resizer", "jpg-to-png", "png-to-jpg", "webp-converter"],
    howTo: [
      "Upload a JPG, PNG, or WebP image.",
      "Choose a quality level (lower = smaller file).",
      "Compare original vs compressed size.",
      "Download the optimized image.",
    ],
    faqs: [
      {
        question: "Will compressing ruin my photo?",
        answer:
          "Mild compression is usually hard to notice. Start around 80% quality and lower only if you need a smaller file.",
      },
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. Compression runs locally in your browser for privacy and speed.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "JPG/JPEG, PNG, and WebP. Convert formats first if needed using our free converters.",
      },
    ],
    benefits: [
      "Faster page loads and Core Web Vitals",
      "Private local processing",
      "Great before uploading to CMS or email",
    ],
  },
  {
    slug: "image-resizer",
    name: "Free Image Resizer",
    shortName: "Image Resizer",
    tagline:
      "Resize photos to exact pixel dimensions for social, web, and print.",
    description:
      "Resize images online free. Set exact width and height in pixels, keep aspect ratio, and download instantly. Ideal for thumbnails, social banners, and product photos.",
    keywords:
      "image resizer, resize image online, change photo size, resize jpg, resize png, free photo resizer",
    category: "image",
    icon: "Scaling",
    related: ["image-compressor", "jpg-to-png", "png-to-jpg", "webp-converter"],
    howTo: [
      "Upload the image you want to resize.",
      "Enter a new width and/or height.",
      "Keep aspect ratio locked or unlock for custom crop-free stretch.",
      "Download the resized image.",
    ],
    faqs: [
      {
        question: "Can I resize without stretching?",
        answer:
          "Yes. Keep “Lock aspect ratio” on so only one dimension changes and the other scales proportionally.",
      },
      {
        question: "What is a good size for web images?",
        answer:
          "Hero images often work at 1200–1920px wide. Thumbnails are commonly 300–600px. Compress after resizing for best performance.",
      },
    ],
    benefits: [
      "Exact pixel control",
      "Aspect-ratio lock",
      "Pairs perfectly with the image compressor",
    ],
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    shortName: "JPG → PNG",
    tagline:
      "Convert JPG/JPEG photos to transparent-friendly PNG in one click.",
    description:
      "Convert JPG to PNG online free. Turn JPEG photos into high-quality PNG files in your browser — no upload to a server, no signup.",
    keywords:
      "jpg to png, jpeg to png, convert jpg to png, jpg to png converter free, change jpeg to png",
    category: "image",
    icon: "ImagePlus",
    related: [
      "png-to-jpg",
      "webp-converter",
      "image-compressor",
      "image-resizer",
    ],
    howTo: [
      "Upload a JPG or JPEG file.",
      "Convert the image, then inspect its PNG preview.",
      "Download the PNG instantly.",
    ],
    faqs: [
      {
        question: "Why convert JPG to PNG?",
        answer:
          "PNG supports lossless storage and transparency, but converting an existing JPEG does not recover lost detail or remove its background.",
      },
      {
        question: "Will the PNG be larger than the JPG?",
        answer:
          "Often yes — PNG is lossless. Use the Image Compressor afterward if you need a smaller file.",
      },
    ],
    benefits: ["Lossless output", "Browser-only conversion", "No watermarks"],
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    shortName: "PNG → JPG",
    tagline: "Convert PNG images to smaller JPG files for web and email.",
    description:
      "Convert PNG to JPG online free. Create smaller JPEG files from PNG images with adjustable quality. Private browser conversion — no account required.",
    keywords:
      "png to jpg, png to jpeg, convert png to jpg, png to jpg converter free, change png to jpeg",
    category: "image",
    icon: "ImageMinus",
    related: [
      "jpg-to-png",
      "webp-converter",
      "image-compressor",
      "image-resizer",
    ],
    howTo: [
      "Upload a PNG image.",
      "Pick JPEG quality.",
      "Download the JPG file.",
    ],
    faqs: [
      {
        question: "Does PNG to JPG remove transparency?",
        answer:
          "Yes. JPG does not support transparency. Transparent areas are filled with a solid background color (white by default).",
      },
      {
        question: "When should I use JPG instead of PNG?",
        answer:
          "Use JPG for photos and complex images when you need smaller files and do not need transparency.",
      },
    ],
    benefits: [
      "Smaller photo files",
      "Quality slider",
      "Fast local conversion",
    ],
  },
  {
    slug: "webp-converter",
    name: "WebP to JPG / PNG Converter",
    shortName: "WebP Converter",
    tagline:
      "Convert WebP images to JPG or PNG for apps that need classic formats.",
    description:
      "Convert WebP to JPG or PNG online free. Open modern WebP images in older tools, PowerPoint, and email clients. Conversion happens privately in your browser.",
    keywords:
      "webp to jpg, webp to png, convert webp, webp converter free, webp to jpeg online",
    category: "image",
    icon: "RefreshCw",
    related: ["jpg-to-png", "png-to-jpg", "image-compressor", "image-resizer"],
    howTo: [
      "Upload a WebP image.",
      "Choose JPG or PNG as the output format.",
      "Adjust quality if converting to JPG.",
      "Download the converted file.",
    ],
    faqs: [
      {
        question: "Why can’t I open a WebP file?",
        answer:
          "Some older software and email clients still lack WebP support. Converting to JPG or PNG fixes compatibility.",
      },
      {
        question: "JPG or PNG — which should I pick?",
        answer:
          "Choose JPG for photos (smaller). Choose PNG when you need lossless quality or plan further editing.",
      },
    ],
    benefits: [
      "Fixes WebP compatibility",
      "JPG or PNG output",
      "Private & free",
    ],
  },
  {
    slug: "word-counter",
    name: "Free Word Counter",
    shortName: "Word Counter",
    tagline:
      "Count words, sentences, and reading time for essays, blogs, and SEO copy.",
    description:
      "Free online word counter. Instantly count words, sentences, paragraphs, and estimated reading time. Perfect for students, bloggers, and SEO writers.",
    keywords:
      "word counter, word count tool, count words online, free word counter, essay word count, seo word counter",
    category: "text",
    icon: "WholeWord",
    related: [
      "character-counter",
      "percentage-calculator",
      "age-calculator",
      "qr-code-generator",
    ],
    howTo: [
      "Paste or type your text into the box.",
      "See live word, sentence, and paragraph counts.",
      "Check estimated reading time.",
      "Copy your text when you are done.",
    ],
    faqs: [
      {
        question: "How do you count words?",
        answer:
          "Words are counted as sequences of letters/numbers separated by spaces or punctuation — the same approach most editors use.",
      },
      {
        question: "What is a good blog post word count?",
        answer:
          "Helpful posts often land between 800–2,000 words, but clarity matters more than hitting a magic number.",
      },
    ],
    benefits: [
      "Live counting",
      "Reading-time estimate",
      "Useful for writing drafts",
    ],
  },
  {
    slug: "character-counter",
    name: "Free Character Counter",
    shortName: "Character Counter",
    tagline:
      "Count characters with and without spaces for titles, meta descriptions, and tweets.",
    description:
      "Free character counter online. Count characters with/without spaces, plus words. Ideal for Google title tags (≈60), meta descriptions (≈155), and social captions.",
    keywords:
      "character counter, character count tool, count characters online, meta description length, title tag character count",
    category: "text",
    icon: "Type",
    related: [
      "word-counter",
      "percentage-calculator",
      "qr-code-generator",
      "age-calculator",
    ],
    howTo: [
      "Paste your title, caption, or meta description.",
      "View characters with and without spaces.",
      "Use SEO length hints for titles and descriptions.",
      "Trim until you hit your target.",
    ],
    faqs: [
      {
        question: "How long should a Google title tag be?",
        answer:
          "Aim for about 50–60 characters so the title displays well in search results on most devices.",
      },
      {
        question: "How long should a meta description be?",
        answer:
          "Roughly 140–160 characters is a practical target for snippets, though Google may rewrite them.",
      },
    ],
    benefits: ["With/without spaces", "SEO length guides", "Instant feedback"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    shortName: "Age Calculator",
    tagline:
      "Calculate exact age in years, months, and days from a date of birth.",
    description:
      "Calculate age in calendar years, months, and days. Choose a date of birth and a reference date, with a clear breakdown and no upload.",
    keywords:
      "age calculator, calculate age, how old am I, exact age calculator, date of birth age, birthday calculator",
    category: "calculator",
    icon: "Cake",
    related: [
      "percentage-calculator",
      "word-counter",
      "character-counter",
      "qr-code-generator",
    ],
    howTo: [
      "Select your date of birth.",
      "Optionally set “as of” a specific date.",
      "See exact years, months, and days.",
      "Compare the calendar breakdown with total elapsed days.",
    ],
    faqs: [
      {
        question: "Does this account for leap years?",
        answer:
          "Yes. Calendar month anniversaries are clamped to the last valid day of each month. February 29 anniversaries use February 28 in non-leap years.",
      },
      {
        question: "Can I calculate age on a past or future date?",
        answer: "Yes. Change the “Age as of” date to compute age on any day.",
      },
    ],
    benefits: ["Calendar Y/M/D breakdown", "Total elapsed days", "No signup"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortName: "Percentage Calculator",
    tagline:
      "Find percentages, discounts, increases, and “what percent of” in seconds.",
    description:
      "Free percentage calculator for discounts, tips, exam scores, and growth rates. Solve “X% of Y”, percentage change, and reverse percentages instantly.",
    keywords:
      "percentage calculator, percent calculator, discount calculator, what percent of, percentage increase, percentage decrease",
    category: "calculator",
    icon: "Percent",
    related: [
      "age-calculator",
      "word-counter",
      "character-counter",
      "image-compressor",
    ],
    howTo: [
      "Pick a calculation mode (percent of, change, or reverse).",
      "Enter your numbers.",
      "Get the answer instantly.",
      "Copy the result if needed.",
    ],
    faqs: [
      {
        question: "How do I calculate a discount?",
        answer:
          "Use “X% of Y” with the discount percent and original price, then subtract from the original — or use percentage decrease mode.",
      },
      {
        question: "What is percentage change?",
        answer:
          "Percentage change = ((new − old) / old) × 100. Positive means increase; negative means decrease.",
      },
    ],
    benefits: ["Multiple modes", "Discount & tip friendly", "Instant results"],
  },
];

export const TOOLS: ToolDefinition[] = [...ORIGINAL_TOOLS, ...EXTRA_TOOLS];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string): ToolDefinition[] {
  const tool = getTool(slug);
  if (!tool) return TOOLS.slice(0, 4);
  return tool.related
    .map((s) => getTool(s))
    .filter((t): t is ToolDefinition => Boolean(t));
}

export function toolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category);
}

export type ToolComponentMap = Record<string, ComponentType>;
