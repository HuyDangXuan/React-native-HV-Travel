const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const containsHtmlMarkup = (value: string | null | undefined) =>
  HTML_TAG_PATTERN.test(String(value ?? ""));

export const normalizeRichTextHtml = (value: string | null | undefined) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (containsHtmlMarkup(raw)) {
    return raw;
  }

  const escaped = escapeHtml(raw).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
  return `<p>${escaped}</p>`;
};
