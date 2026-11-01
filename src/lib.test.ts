import { describe, it, expect } from "vitest";
import {
  calendarAge,
  encode64,
  decode64,
  formatJson,
  slugify,
  sitemapXml,
  robotsTxt,
  randomPassword,
  csvToJson,
  jsonToCsv,
  colorValues,
  contrastRatio,
  htmlDecode,
} from "./lib";
import { TOOLS } from "./data/tools";
import { GUIDES } from "./data/guides";
describe("browser utility correctness", () => {
  it("round-trips multilingual UTF-8 and rejects malformed Base64", () => {
    const s = "Hello, دنیا 👋";
    expect(decode64(encode64(s))).toBe(s);
    expect(() => decode64("%%%")).toThrow();
  });
  it("formats valid JSON and reports invalid JSON", () => {
    expect(formatJson('{"x":1}', true)).toBe('{"x":1}');
    expect(() => formatJson('{"x":1,}')).toThrow();
  });
  it("builds stable ASCII slugs", () => {
    expect(slugify(" Crème brûlée & SEO! ")).toBe("creme-brulee-seo");
    expect(slugify("---")).toBe("");
  });
  it("escapes sitemap URLs, removes duplicates and fragments, and rejects unsafe schemes", () => {
    const out = sitemapXml(
      "https://example.com/a?a=1&b=2#top\nhttps://example.com/a?a=1&b=2",
    );
    expect(out).toContain("&amp;");
    expect(out).not.toContain("#top");
    expect((out.match(/<url>/g) || []).length).toBe(1);
    expect(() => sitemapXml("javascript:alert(1)")).toThrow();
    expect(() => sitemapXml("https://secret:password@example.com")).toThrow();
  });
  it("keeps blank robots rules permissive and blocks malformed paths", () => {
    expect(robotsTxt("https://example.com/sitemap.xml", "")).toContain(
      "Allow: /",
    );
    expect(() =>
      robotsTxt("https://example.com/sitemap.xml", "admin"),
    ).toThrow();
  });
  it("handles month ends and leap-day anniversaries without negative days", () => {
    expect(calendarAge("2024-01-31", "2024-03-01")).toEqual({
      years: 0,
      months: 1,
      days: 1,
      totalDays: 30,
    });
    expect(calendarAge("2000-02-29", "2025-02-28")).toMatchObject({
      years: 25,
      months: 0,
      days: 0,
    });
    expect(() => calendarAge("2025-02-29", "2026-01-01")).toThrow();
    expect(() => calendarAge("2026-01-01", "2025-01-01")).toThrow();
  });
  it("generates passwords with selected sets and refuses empty alphabets", () => {
    const result = randomPassword(24, ["abc", "123", "!@"]);
    expect(result).toHaveLength(24);
    expect(result).toMatch(/[abc]/);
    expect(result).toMatch(/[123]/);
    expect(result).toMatch(/[!@]/);
    expect(() => randomPassword(24, [])).toThrow();
  });
  it("parses quoted CSV, newlines, and escaped quotes without losing string values", () => {
    expect(
      JSON.parse(csvToJson('name,note\n"Ibrahim","hello, world"')),
    ).toEqual([{ name: "Ibrahim", note: "hello, world" }]);
    expect(JSON.parse(csvToJson('a,b\n"line\nbreak","a""b"'))[0]).toEqual({
      a: "line\nbreak",
      b: 'a"b',
    });
    expect(() => csvToJson("a,a\nx,y")).toThrow();
    expect(() => csvToJson("a,b\nx")).toThrow();
  });
  it("escapes CSV fields and protects formulas including headers", () => {
    expect(jsonToCsv('[{"name":"=SUM(A1)","note":"a,b"}]')).toContain(
      "'=SUM(A1)",
    );
    expect(jsonToCsv('[{"name":"x","note":"a,b"}]')).toContain('"a,b"');
  });
  it("converts sRGB values and matches known contrast ratios", () => {
    expect(colorValues("#fff")).toMatchObject({
      hex: "#ffffff",
      rgb: "rgb(255, 255, 255)",
      hsl: "hsl(0, 0%, 100%)",
    });
    expect(contrastRatio("#000", "#fff")).toBe(21);
    expect(contrastRatio("#123456", "#123456")).toBe(1);
    expect(() => colorValues("rgb(256,0,0)")).toThrow();
  });
  it("decodes entities as strings and handles invalid Unicode safely", () => {
    expect(htmlDecode("&lt;script&gt;&#x1F600;&copy;")).toBe("<script>😀©");
    expect(htmlDecode("&#xD800;")).toBe("�");
  });
  it("provides a unique guide and resolvable related tools for every tool", () => {
    expect(TOOLS).toHaveLength(31);
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      expect(GUIDES.filter((g) => g.toolSlug === t.slug)).toHaveLength(1);
      for (const slug of t.related)
        expect(TOOLS.some((x) => x.slug === slug)).toBe(true);
    }
  });
});
