"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRichTextHtml = exports.containsHtmlMarkup = void 0;
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const containsHtmlMarkup = (value) => HTML_TAG_PATTERN.test(String(value ?? ""));
exports.containsHtmlMarkup = containsHtmlMarkup;
const normalizeRichTextHtml = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw)
        return "";
    if ((0, exports.containsHtmlMarkup)(raw)) {
        return raw;
    }
    const escaped = escapeHtml(raw).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
    return `<p>${escaped}</p>`;
};
exports.normalizeRichTextHtml = normalizeRichTextHtml;
