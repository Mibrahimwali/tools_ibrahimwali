export const SITE_URL = "https://tools.ibrahimwali.com";
export const AUTHOR_URL = "https://ibrahimwali.com";
export function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
export function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function formatJson(s: string, compact = false) {
  return JSON.stringify(JSON.parse(s), null, compact ? 0 : 2);
}
export function encode64(s: string) {
  return btoa(
    Array.from(new TextEncoder().encode(s), (n) => String.fromCharCode(n)).join(
      "",
    ),
  );
}
export function decode64(s: string) {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)),
  );
}
export function sitemapXml(input: string) {
  const raw = input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!raw.length) throw new Error("Add at least one URL.");
  if (raw.length > 5000)
    throw new Error("Use up to 5,000 URLs per file in this browser tool.");
  const urls = [
    ...new Set(
      raw.map((s) => {
        const u = new URL(s);
        if (
          !["https:", "http:"].includes(u.protocol) ||
          u.username ||
          u.password
        )
          throw new Error("Use public HTTP or HTTPS URLs without credentials.");
        u.hash = "";
        return u.href;
      }),
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join("\n")}\n</urlset>`;
}
export function robotsTxt(sitemap: string, paths: string) {
  const u = new URL(sitemap);
  if (!["http:", "https:"].includes(u.protocol))
    throw new Error("Sitemap must use HTTP or HTTPS.");
  const disallow = paths
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (disallow.some((x) => !x.startsWith("/") || /[\s#]/.test(x)))
    throw new Error(
      "Each disallow path must start with / and have no whitespace or #.",
    );
  return `User-agent: *\n${disallow.length ? disallow.map((x) => `Disallow: ${x}`).join("\n") : "Allow: /"}\n\nSitemap: ${u.href}\n`;
}
export function randomPassword(length: number, sets: string[]) {
  if (!sets.length) throw new Error("Select at least one character set.");
  if (!Number.isInteger(length) || length < 8 || length > 128)
    throw new Error("Use a length from 8 to 128.");
  const alphabet = sets.join("");
  const pick = (max: number) => {
    const limit = 256 - (256 % max);
    const b = new Uint8Array(1);
    do {
      crypto.getRandomValues(b);
    } while (b[0] >= limit);
    return b[0] % max;
  };
  const chars = sets.map((s) => s[pick(s.length)]);
  while (chars.length < length) chars.push(alphabet[pick(alphabet.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
export function calendarAge(from: string, to: string) {
  const parse = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s))
      throw new Error("Enter complete dates.");
    const d = new Date(s + "T00:00:00Z");
    if (!Number.isFinite(+d) || d.toISOString().slice(0, 10) !== s)
      throw new Error("Enter valid calendar dates.");
    return d;
  };
  const start = parse(from),
    end = parse(to);
  if (end < start)
    throw new Error("The reference date must be on or after birth.");
  const add = (months: number) => {
    const d = new Date(+start);
    d.setUTCDate(1);
    d.setUTCMonth(start.getUTCMonth() + months);
    const next = new Date(+d);
    next.setUTCMonth(d.getUTCMonth() + 1);
    next.setUTCDate(0);
    d.setUTCDate(Math.min(start.getUTCDate(), next.getUTCDate()));
    return d;
  };
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth();
  if (add(months) > end) months--;
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.round((+end - +add(months)) / 86400000),
    totalDays: Math.round((+end - +start) / 86400000),
  };
}

export function csvToJson(input: string) {
  if (input.length > 1000000)
    throw new Error("Use CSV up to 1 MB in this browser tool.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const pushCell = () => {
    row.push(cell);
    cell = "";
    closed = false;
  };
  const pushRow = () => {
    pushCell();
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += c;
      continue;
    }
    if (c === '"') {
      if (cell || closed)
        throw new Error("Unexpected quote in CSV. Quote the whole field.");
      quoted = true;
      continue;
    }
    if (c === ",") {
      pushCell();
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      pushRow();
      continue;
    }
    if (closed) throw new Error("Unexpected text after a closing quote.");
    cell += c;
  }
  if (quoted) throw new Error("A quoted CSV field is not closed.");
  if (cell || closed || row.length) pushRow();
  if (rows.length < 2)
    throw new Error("Include a header row and at least one data row.");
  const headers = rows
    .shift()!
    .map((s, i) => (i === 0 ? s.replace(/^\uFEFF/, "") : s).trim());
  if (headers.some((s) => !s) || new Set(headers).size !== headers.length)
    throw new Error("Use nonempty, unique column headers.");
  return JSON.stringify(
    rows.map((r, i) => {
      if (r.length !== headers.length)
        throw new Error(
          `Row ${i + 2} has ${r.length} fields; expected ${headers.length}.`,
        );
      return Object.fromEntries(headers.map((h, j) => [h, r[j]]));
    }),
    null,
    2,
  );
}
export function jsonToCsv(input: string, protect = true) {
  const data = JSON.parse(input) as unknown;
  if (
    !Array.isArray(data) ||
    !data.length ||
    data.some((r) => !r || typeof r !== "object" || Array.isArray(r))
  )
    throw new Error("Use a nonempty array of JSON objects.");
  const keys = [...new Set(data.flatMap((r) => Object.keys(r)))];
  if (!keys.length) throw new Error("Objects need at least one field.");
  const cell = (v: unknown) => {
    let s =
      v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (protect && /^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [
    keys.map(cell).join(","),
    ...data.map((row) =>
      keys.map((k) => cell((row as Record<string, unknown>)[k])).join(","),
    ),
  ].join("\r\n");
}
export function parseColor(input: string): [number, number, number] {
  const s = input.trim();
  const hex = s.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
  if (hex) {
    const value =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((x) => x + x)
            .join("")
        : hex[1];
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }
  const rgb = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgb) {
    const values = rgb.slice(1).map(Number);
    if (values.every((n) => n >= 0 && n <= 255))
      return values as [number, number, number];
  }
  throw new Error("Use a three- or six-digit HEX color or rgb(0, 128, 255).");
}
export function colorValues(input: string) {
  const [r, g, b] = parseColor(input);
  const [red, green, blue] = [r, g, b].map((v) => v / 255);
  const max = Math.max(red, green, blue),
    min = Math.min(red, green, blue),
    delta = max - min,
    l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (delta) {
    s = delta / (1 - Math.abs(2 * l - 1));
    h =
      max === red
        ? ((green - blue) / delta) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4;
    h = (((h * 60) % 360) + 360) % 360;
  }
  return {
    hex: "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
  };
}
export function contrastRatio(foreground: string, background: string) {
  const lum = (s: string) => {
    const [r, g, b] = parseColor(s).map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(foreground),
    b = lum(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function htmlDecode(input: string) {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: "\u00a0",
    copy: "©",
    reg: "®",
  };
  return input.replace(/&(#x[a-f\d]+|#\d+|[a-z]+);/gi, (raw, key: string) => {
    if (!key.startsWith("#")) return named[key] ?? raw;
    const n =
      key[1].toLowerCase() === "x"
        ? parseInt(key.slice(2), 16)
        : parseInt(key.slice(1), 10);
    return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff)
      ? String.fromCodePoint(n)
      : "\ufffd";
  });
}
