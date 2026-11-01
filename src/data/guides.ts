import { TOOLS, type ToolDefinition } from "./tools";
import { EXTRA_DETAILS } from "./extra-tools";
export type GuideSection = { heading: string; paragraphs: string[] };
export type Guide = {
  slug: string;
  toolSlug: string;
  title: string;
  description: string;
  sections: GuideSection[];
};
/** Editorial notes are specific to each operation, rather than keyword-swapped filler. */
const notes: Record<string, [string, string, string, string]> = {
  "qr-code-generator": [
    "Make a QR code people can actually scan",
    "A QR code is useful when someone moves between a physical object and a digital destination: a business card, a workshop handout, a menu, or a product label. Start with the final HTTPS destination rather than a temporary preview URL. This tool generates a static PNG, so the encoded value cannot be changed after printing.",
    "Keep a clear margin around the code and preserve a dark foreground on a light background. A large logo or a tight crop can remove data modules. Longer URLs produce denser patterns, so test the actual printed size rather than assuming a large file will scan on a small label. Error correction can recover some damaged modules, but it is not a replacement for contrast or adequate size.",
    "Scan the downloaded PNG on at least two phones and open the destination on mobile. Check that it does not require an unintended login. A static code has no built-in expiry, but the linked website can still move or disappear. To change destinations later, encode a stable URL on a domain you control and manage the redirect there.",
  ],
  "image-compressor": [
    "Compress images without losing the details that matter",
    "Images often dominate page weight. Reducing bytes can make a product catalog or article faster to load, especially on mobile connections. Compression and resizing are separate decisions: lowering quality changes image fidelity, while resizing removes pixels. A 4000-pixel image shown at 600 pixels wide is usually worth resizing before you tune quality.",
    "Use JPEG for photographic material, WebP when the receiving system supports it, and PNG for graphics that need lossless storage or transparency. PNG does not respond to a lossy quality slider in the same way as JPEG. In this tool, JPEG output fills transparent areas with white; choose PNG or WebP when you need to keep an alpha channel.",
    "Start near 80% quality, compare text edges and detailed areas at their display size, and check the output byte count. A re-encoded file can be larger than the original, particularly when the original is already optimized. Keep your source file, avoid repeated lossy saves, and test the downloaded file in the system where it will be used.",
  ],
  "image-resizer": [
    "Choose the right pixel dimensions before resizing",
    "A useful resize begins with where the image will be displayed. Website thumbnails, email banners, and social images have different aspect ratios and pixel needs. The number of pixels affects sharpness and download weight; changing an image’s pixel width does not automatically change a print layout’s physical size.",
    "Keep the aspect-ratio lock enabled to preserve proportions. Entering a new width calculates the corresponding height. Unlocking the ratio stretches the image rather than cropping it. If a composition needs a different shape, crop it in an editor first. Enlarging a small source cannot recover detail that was never present.",
    "Compare the result at its intended display size and inspect faces, logos, and small text. Allow for high-density screens when choosing a source size, then run the image compressor if the resized file is still heavy. This browser tool limits dimensions and total pixels to reduce memory failures on phones.",
  ],
  "jpg-to-png": [
    "When converting a JPEG to PNG is useful",
    "JPEG and PNG use different compression models. JPEG discards some visual information to reduce photographic file sizes, while PNG stores its pixel data losslessly. Converting an existing JPEG to PNG preserves the decoded pixels for subsequent saves, but it cannot recover detail that the original JPEG already removed.",
    "PNG is often useful when a receiving application requires that format or when you want to avoid additional JPEG encoding during later edits. The output may be considerably larger, especially for photos. A PNG container supports transparency, but this conversion does not remove the JPEG’s background or invent an alpha channel.",
    "Download the result, check dimensions, and compare byte sizes before publishing. If a web page does not require PNG, keeping an optimized JPEG may be a better choice. For sharp interface artwork, a lossless original is preferable to converting a compressed screenshot through multiple formats.",
  ],
  "png-to-jpg": [
    "Convert PNG photos to JPEG safely",
    "A PNG photo can be much heavier than a visually similar JPEG. Converting it is useful for email attachments, product photographs, and publishing systems that require JPEG. Before converting, decide whether transparency, fine text, or a lossless source is important for the final use.",
    "JPEG has no alpha channel. This tool fills transparent pixels with white before exporting, so the result can look different on dark backgrounds. Start with a relatively high quality and inspect small text and high-contrast edges, which often reveal compression before large photographic areas do.",
    "Save the original PNG separately, test the downloaded image against the background where it will appear, and compare file sizes. Conversion is not guaranteed to make every file smaller. If the result is still large, resize to the actual display dimensions and compress the resized image once.",
  ],
  "webp-converter": [
    "Open WebP images in applications that need JPEG or PNG",
    "WebP is a useful web format, but older applications and some upload workflows still expect JPEG or PNG. Converting locally solves that compatibility problem without sending your image to an external conversion service. The correct output depends on the content rather than the file extension alone.",
    "Choose JPEG for photographs when a solid background is acceptable. Choose PNG for transparent graphics and assets where a lossless decoded output matters. Converting lossy WebP to PNG does not restore details from before the WebP encoding; it simply stores the current decoded image in another container.",
    "Open the exported image in the destination application and verify transparency and dimensions. Browser canvas conversion produces a still image, so animated WebP is not preserved as an animation. Keep the source if you need motion, metadata, or a reversible editing workflow.",
  ],
  "word-counter": [
    "Use word counts as an editing aid",
    "A word counter helps when writing to a brief, estimating reading time, or checking an essay’s length. It is most useful as a diagnostic rather than a target to fill. A short explanation that answers the question is often more useful than a long page that repeats it.",
    "This counter groups letters and numbers into words and treats apostrophes within a word as part of that word. Editors can differ on hyphenated words, punctuation, and scripts without spaces. Reading time assumes 200 words per minute and should be treated as an estimate rather than a measured reading duration.",
    "Paste a finished section, check the count, and review paragraph lengths before polishing headings and links. Use the character counter when the constraint is a title, caption, or interface field. For contractual or academic limits, use the counting rules of the final submission system.",
  ],
  "character-counter": [
    "Count characters without mistaking a target for a rule",
    "Character limits matter in database fields, social captions, interface labels, and metadata drafts. Different systems count different things: code units, Unicode code points, bytes, or visible grapheme clusters. This tool counts Unicode code points, so a combined emoji may contribute more than one.",
    "The without-spaces total removes whitespace, including line breaks. Search titles and descriptions do not have a single universal character cutoff: rendered width, device, query, and search engine rewriting affect what appears. Use counts to find long drafts and prioritize the words readers need first.",
    "Review the text in its actual destination after copying. If the limit is bytes rather than characters, accented letters and emoji can use multiple UTF-8 bytes. Use the meta tag preview for an illustrative title and description layout, and avoid treating that preview as a promise about search results.",
  ],
  "age-calculator": [
    "Calculate calendar age across months and leap years",
    "Calendar age is not simply elapsed days divided by 365. Months have different lengths and leap years add a day. Start with a date of birth and an explicit reference date so the result answers a clear question. This tool treats the inputs as dates, without a time of day or time zone offset.",
    "The calculation counts complete calendar months and then the remaining days. If an anniversary falls on a date that the next month does not contain, the anniversary is clamped to that month’s final day. February 29 therefore uses February 28 in a non-leap year. Total elapsed days are shown separately.",
    "Check both dates before copying the result. Eligibility policies and legal definitions may use their own anniversary rules, so confirm the governing rule for official decisions. For a past or future comparison, change the reference date rather than assuming the tool always uses today.",
  ],
  "percentage-calculator": [
    "Percentages: amounts, change, and ratios",
    "Percentage calculations look similar but answer different questions. Twenty percent of 150 is an amount: 20 × 150 ÷ 100 = 30. By contrast, asking what percent 30 is of 150 produces a ratio: 30 ÷ 150 × 100 = 20%. Choose the mode before entering numbers.",
    "Percentage change uses the old value as its base: (new − old) ÷ old × 100. Moving from 100 to 120 is a 20% increase; returning from 120 to 100 is about a 16.67% decrease. Changes from a zero base are undefined, so this tool does not manufacture a result for that case.",
    "For discounts, calculate the discount amount and subtract it from the original price. Be careful when comparing percentages with percentage points: a rate moving from 4% to 5% rises by one percentage point but by 25% relative to its starting value. Results use floating-point arithmetic and are not an accounting ledger.",
  ],
};
const extraNotes: Record<string, [string, string, string]> = {
  "json-formatter": [
    "JSON is a data-interchange format with a precise grammar. Pretty printing adds indentation and line breaks without changing the parsed data. Minifying removes that formatting for a compact representation. A readable document helps identify nested objects and arrays when inspecting an API response.",
    "Paste a complete document and choose Format. Object keys and string values require double quotes; comments, undefined values, and trailing commas are not valid JSON. The parser reports syntax errors, but successful parsing does not prove that a payload matches your application’s schema.",
    "JavaScript numbers can lose precision for large integer identifiers. Encode such identifiers as strings before formatting, and do not use this tool to round-trip number-sensitive financial payloads. Duplicate object keys may also collapse when parsed.",
  ],
  "base64-encoder-decoder": [
    "Base64 represents bytes using a limited text alphabet, which is useful when a channel expects printable text. It is often seen in small data payloads and protocol examples. Encoding increases the size and provides no confidentiality: anyone with the value can decode it.",
    "The encoder converts your text to UTF-8 bytes before Base64 encoding, allowing accented characters and non-Latin text to round-trip. Decode expects standard Base64 representing valid UTF-8. Binary file contents or URL-safe Base64 variants may require a different workflow.",
    "Check the decoded text against the source, including line endings. Never treat an encoded API key as protected. If a value contains a password, avoid copying it on shared computers, because clipboard managers can retain it after the page closes.",
  ],
  "url-encoder-decoder": [
    "URL components use percent encoding for characters that could otherwise be interpreted as structure. A space or ampersand inside a parameter value should not become a separator. Encoding the value allows it to travel safely as part of a query string.",
    "This tool uses component encoding. Enter the value rather than an entire URL, because encoding all slashes and delimiters changes the URL structure. Decode expects valid percent escapes and UTF-8; malformed input produces an error instead of a guessed result.",
    "Avoid encoding a value twice. A percent sign in an already encoded value becomes %25, producing a different string. This decoder also leaves plus signs unchanged: application/x-www-form-urlencoded uses a separate plus-for-space convention.",
  ],
  "uuid-generator": [
    "UUID version 4 uses random data to produce identifiers that can be created without a central counter. They are useful for draft records, fixtures, distributed systems, and public identifiers. They do not encode creation time or establish an ordering.",
    "Choose a count and generate a batch. The browser uses crypto.randomUUID rather than Math.random. Copy one identifier per record and preserve the standard hyphenated representation unless the receiving system requires another format.",
    "Randomness makes collisions unlikely, not impossible. A database uniqueness constraint remains appropriate. Knowing a record’s UUID should never be enough to authorize access: validate the user’s permissions independently of the identifier.",
  ],
  "password-generator": [
    "A generated password avoids the patterns people commonly introduce when inventing memorable secrets. Length and a broad random alphabet make exhaustive guessing harder. Use a unique password for every account and save it in a reputable password manager.",
    "Choose between 8 and 128 characters and enable the character sets that the destination permits. The generator uses cryptographic random bytes with rejection sampling, includes each selected set, and shuffles the result. Generation happens only when you press the button.",
    "The page does not retain your result after reloading, but a browser extension or clipboard manager might observe it. Never paste a real password into an AI question, an issue report, or a public form. A password does not replace multifactor authentication where available.",
  ],
  "slug-generator": [
    "A slug is the readable part of a page path. A concise, stable slug helps humans recognize a link and makes a content collection easier to maintain. It should identify the page without depending on a temporary marketing headline.",
    "This tool normalizes accented Latin letters, lowercases text, replaces punctuation and spaces with hyphens, and trims outer hyphens. Non-Latin letters are omitted because the output is deliberately ASCII. Review the result for multilingual pages.",
    "Once a URL is public, changing its title does not require changing its slug. If a slug must move, implement a permanent redirect from the old URL to preserve visitor access. Keep canonical tags and sitemap entries aligned with the chosen URL.",
  ],
  "case-converter": [
    "Case conversion is useful when cleaning pasted lists, preparing headings, or adjusting text to an interface style. It changes letter casing, not meaning, grammar, or spelling. Review the result whenever proper names or technical identifiers appear in the source.",
    "Choose uppercase, lowercase, simple title case, or simple sentence case. Title case capitalizes each whitespace-separated word and is not an implementation of a publishing style manual. Sentence case capitalizes a leading letter and letters after sentence-ending punctuation.",
    "Acronyms such as API and names such as iPhone can lose their intended casing in automated conversion. Locale-specific language rules can also differ. For code, case-sensitive IDs, and file paths, verify that the transformed text remains valid in the receiving system.",
  ],
  "remove-duplicate-lines": [
    "Duplicate-line removal is helpful for lists of URLs, tags, labels, and imported values. Deduplication requires a definition of equality. A case-sensitive identifier list and a human-entered contact list may need different comparison rules.",
    "Paste one item per line and choose whether to ignore case or surrounding whitespace. The first matching line is preserved in its original form, and later matches are removed without sorting. The result therefore retains the source’s order.",
    "Ignoring case can merge distinct case-sensitive paths or IDs. Ignoring surrounding whitespace affects comparison but does not rewrite the first line. Save your original list before replacing it, particularly when a duplicate may represent repeated work rather than redundant data.",
  ],
  "sha256-generator": [
    "SHA-256 maps an input to a 256-bit digest commonly displayed as 64 hexadecimal characters. Digests help compare exact content or produce reproducible test vectors. Changing a single character, space, or newline generally changes the entire displayed digest.",
    "Enter the exact text and calculate the hash. The browser encodes the string as UTF-8 and uses Web Crypto. This interface hashes text only; it does not hash an uploaded file or parse a hexadecimal string as raw bytes.",
    "A hash is not encryption and cannot be decoded to recover the input. Plain SHA-256 is unsuitable for password storage because it is fast and unsalted. Use an appropriate password-hashing scheme in a real authentication system.",
  ],
  "timestamp-converter": [
    "Unix timestamps count time since the UTC epoch at the start of 1970. API payloads commonly use seconds, while JavaScript dates use milliseconds. A value interpreted with the wrong unit can point decades away from the date you intended.",
    "Choose the unit explicitly, paste an integer timestamp, and convert it to an ISO UTC date. For the reverse direction, the date-time field is explicitly interpreted as UTC. It does not infer the time zone of an office or a city from your browser.",
    "Use zero as a test: it corresponds to 1970-01-01T00:00:00.000Z. Negative timestamps refer to dates before the epoch. Check the API’s documented precision and avoid treating Unix time as a model for every leap-second or civil-time calculation.",
  ],
  "meta-tag-preview": [
    "A title and description help visitors understand what a page offers before opening it. Write specific copy that matches the content a reader will actually find. Leading with the task or subject is more useful than repeating generic claims across every page.",
    "Draft your title, description, and absolute canonical URL. The preview shows an illustrative search layout and character counts. Generated HTML escapes text for safe attribute values; paste the tags into your document head, then inspect the served HTML.",
    "Search engines can rewrite titles and snippets, and display lengths depend on rendered width and device. Character counts are editing aids, not ranking thresholds. Use one clear canonical for the preferred public URL and avoid pointing unrelated pages at the home page.",
  ],
  "robots-txt-generator": [
    "Robots.txt tells cooperating crawlers which paths they may crawl on a host. It belongs at the root of the exact host being governed: a subdomain needs its own file. The file is public and should never be treated as protection for private documents.",
    "Supply an absolute sitemap URL and optional disallow paths. With no disallowed paths, the output permits crawling. Review a slash-only rule carefully: Disallow: / requests that cooperating crawlers avoid the whole host. The generator does not guess which paths are safe to block.",
    "Disallow is not a guaranteed removal instruction. A blocked URL may still be known to search engines, and crawlers may not be able to read a noindex tag on a page they cannot fetch. Use authentication for private information and verify crawl behavior after deployment.",
  ],
  "sitemap-generator": [
    "An XML sitemap lists the canonical pages you want search engines to discover. It is especially useful for a new collection or pages with fewer incoming links. It is a discovery hint, not a guarantee of crawling, indexing, or ranking.",
    "Paste absolute HTTP or HTTPS URLs, one per line. The tool removes duplicates and fragments, validates schemes, and escapes special XML characters such as ampersands. It generates a standard urlset rather than fetching or crawling those URLs.",
    "Include only public, indexable pages that return useful content. Do not populate a lastmod field with a fresh date on every build unless the page meaningfully changed. After publishing the file, reference it from robots.txt and submit it to the search engine’s webmaster console.",
  ],
  "utm-builder": [
    "UTM parameters label where a campaign link came from. A consistent source, medium, and campaign name makes reports easier to compare. Agree a naming convention before creating links, such as lowercase source names and a stable campaign label.",
    "Start with an absolute destination URL and add the required source, medium, and campaign. The builder preserves existing parameters and the fragment while replacing UTM parameters you set. Optional empty term and content fields remove those matching parameters.",
    "Test the copied link in a browser. UTM values are visible, can be copied, and may appear in logs, so do not include personal information or credentials. Campaign tagging does not create analytics by itself; the destination needs an appropriately configured measurement system.",
  ],
  "csv-to-json": [
    "CSV is a row-and-column format often used for exports and spreadsheet handoffs. Turning it into JSON is useful when an API, fixture, or script expects named fields. A reliable conversion needs a clear header row and a parser that understands quoted commas, embedded newlines, and doubled quotes.",
    "Paste the complete CSV including its header and convert it. Each data row becomes an object keyed by the headers. This tool keeps values as strings, so a code such as 0012 remains 0012 rather than becoming the number 12. Headers must be nonempty and unique; inconsistent row lengths produce a validation error.",
    "A comma is the delimiter in this tool. Tab-separated and semicolon-delimited files need a separate conversion first. Review dates, blank values, and whitespace according to your schema before sending the JSON to an API. The browser tool limits source text to 1 MB to keep memory use predictable.",
  ],
  "json-to-csv": [
    "JSON objects and CSV tables represent data differently. A CSV export needs a column order and one cell per field, while JSON can contain nested objects and arrays. This tool accepts a nonempty array of objects and builds columns from the union of their field names.",
    "Paste the array and convert it. Missing or null fields become empty CSV cells, while nested values become JSON text inside a cell. Commas, quotes, and line breaks are quoted using CSV conventions. The result is downloadable with a .csv extension and uses CRLF record separators.",
    "Spreadsheet formula protection is enabled by default. It prefixes potentially formula-like values with an apostrophe, including sensitive headers, before quoting. This changes those values intentionally. Confirm the importing application’s rules, especially for leading zeros, dates, formula detection, and character encoding; CSV does not carry data types.",
  ],
  "markdown-preview": [
    "Markdown is a lightweight source format for notes, documentation, and publishing drafts. A preview helps check heading structure and emphasis while keeping the source easy to edit. Different publishing systems implement different extensions, so a basic preview cannot promise identical rendering everywhere.",
    "Write a heading with #, add paragraphs separated by blank lines, use **bold** or inline code, and try a fenced code block. Simple bullet lines and HTTP or HTTPS links are supported. The preview renders source through React text nodes rather than executing raw HTML, and remote images are deliberately omitted.",
    "This is a limited Markdown subset, not a full CommonMark or GitHub-flavored Markdown implementation. Tables, nested lists, inline HTML, and advanced syntax may render as plain text. Check the final output in your publishing system before release. Link clicks open external destinations; input itself remains local.",
  ],
  "html-entity-encoder-decoder": [
    "HTML-sensitive characters need escaping when you want to display them as text or place text inside an attribute. An ampersand or less-than sign can otherwise be interpreted as markup. Encoding and decoding are representation changes; neither operation decides whether untrusted HTML is safe to execute.",
    "Encode converts ampersands, angle brackets, double quotes, and apostrophes to entities. Decode understands amp, lt, gt, quot, apos, nbsp, copy, reg, and decimal or hexadecimal numeric references. The decoded result is displayed as text, including any apparent tags, rather than inserted into the page as HTML.",
    "This decoder does not implement the complete HTML5 named-entity table. Unknown named entities remain unchanged and invalid Unicode references become a replacement character. Do not use the output as a sanitizer or a substitute for context-aware escaping, DOM-safe insertion, or a maintained HTML sanitization library.",
  ],
  "color-converter": [
    "A single visual color can be expressed in several useful forms. HEX is compact in stylesheets, RGB shows the red, green, and blue channel values, and HSL makes hue, saturation, and lightness easier to inspect. These representations describe a color within a particular color space.",
    "Enter a three- or six-digit HEX value, with or without #, or integer rgb(r, g, b). The result expands shorthand to six digits, returns RGB channels from 0 to 255, and calculates an HSL representation. A swatch lets you check whether you entered the expected color before copying.",
    "This tool operates on opaque sRGB colors. It does not parse CSS names, percentages, alpha channels, modern space-separated syntax, or wide-gamut spaces such as Display P3. HSL values are rounded for readability, so use the HEX value when you need an exact round-trip of the input channels.",
  ],
  "contrast-checker": [
    "Readable text depends partly on the difference between foreground and background luminance. The WCAG 2.x contrast ratio offers a useful quantitative check for solid colors. It is one part of accessibility and should be combined with readable typography, keyboard access, clear labels, and testing.",
    "Enter the foreground and background colors. The tool linearizes sRGB channel values, calculates relative luminance, and divides the lighter value plus 0.05 by the darker value plus 0.05. It compares the unrounded result with AA and AAA thresholds while displaying the ratio to two decimal places.",
    "Normal text needs 4.5:1 for AA and 7:1 for AAA. Large text uses 3:1 and 4.5:1 respectively; large means at least 18 pt regular or 14 pt bold. Non-text contrast has a 3:1 threshold where applicable. This solid-color check does not account for transparency, gradient backgrounds, images, anti-aliasing, or full conformance.",
  ],
  "aspect-ratio-calculator": [
    "An aspect ratio describes an image’s proportions rather than its file size or resolution. A 1920 by 1080 image and a 1280 by 720 image both have a 16:9 ratio. Matching ratios makes it easier to scale an image without stretching its subject.",
    "Enter the original width and height as whole pixel counts. The tool divides both by their greatest common divisor to produce the simplified ratio. Enter a target width to calculate target height using original height multiplied by target width divided by original width.",
    "A calculated height may include a fraction, while an exported raster image needs whole pixels. Round for the actual resize and inspect the result. The calculator does not crop or enlarge an image by itself. Use the image resizer next with its aspect-ratio lock enabled, then compress the output if needed.",
  ],
};
function createGuide(tool: ToolDefinition): Guide {
  const old = notes[tool.slug];
  const extra = extraNotes[tool.slug];
  if (!old && !extra) throw new Error(`Missing editorial guide: ${tool.slug}`);
  const title = old ? old[0] : `${tool.shortName}: a practical guide`;
  const paragraphs = old ? old.slice(1) : extra;
  const example = EXTRA_DETAILS[tool.slug]?.example;
  return {
    slug: `${tool.slug}-guide`,
    toolSlug: tool.slug,
    title,
    description: `${title}. Learn the workflow, check the result, and understand the limits before using ${tool.shortName.toLowerCase()}.`,
    sections: [
      { heading: "When this is useful", paragraphs: [paragraphs[0]] },
      {
        heading: "A reliable workflow",
        paragraphs: [
          paragraphs[1],
          example ? `Example input: ${example}` : tool.howTo.join(" "),
        ],
      },
      {
        heading: "What to check before you finish",
        paragraphs: [paragraphs[2]],
      },
      {
        heading: "Keep the next step simple",
        paragraphs: [
          `Open the ${tool.shortName} above to try the workflow. Your input is processed in your browser, without an account or file uploads. The related tools below can help with the next step; check the output before publishing it or adding it to a production system.`,
        ],
      },
    ],
  };
}
export const GUIDES = TOOLS.map(createGuide);
