const {
  containsHtmlMarkup,
  normalizeRichTextHtml,
} = require("../.test-dist/utils/richText");

describe("rich text helpers", () => {
  test("detects html markup correctly", () => {
    expect(containsHtmlMarkup("<p><strong>Hello</strong></p>")).toBe(true);
    expect(containsHtmlMarkup("Plain text only")).toBe(false);
  });

  test("wraps plain text as safe html and preserves line breaks", () => {
    expect(normalizeRichTextHtml("Xin chào\nNgày 1")).toBe("<p>Xin chào<br />Ngày 1</p>");
  });

  test("keeps html input untouched", () => {
    const html = "<ul><li>Ngày 1</li><li>Ngày 2</li></ul>";
    expect(normalizeRichTextHtml(html)).toBe(html);
  });
});
