"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RichHtmlText;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_render_html_1 = __importDefault(require("react-native-render-html"));
const richText_1 = require("../../utils/richText");
function RichHtmlText({ html, palette, compact = false, fallbackText = "", textColor, }) {
    const { width } = (0, react_native_1.useWindowDimensions)();
    const normalizedHtml = (0, react_1.useMemo)(() => (0, richText_1.normalizeRichTextHtml)(html), [html]);
    const resolvedTextColor = textColor || palette.textSecondary;
    if (!normalizedHtml) {
        return (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: { color: resolvedTextColor }, children: fallbackText });
    }
    return ((0, jsx_runtime_1.jsx)(react_native_render_html_1.default, { contentWidth: Math.max(width - 40, 120), source: { html: normalizedHtml }, ignoredDomTags: ["img", "iframe", "script", "style", "video", "audio"], baseStyle: {
            color: resolvedTextColor,
            fontSize: compact ? 14 : 15,
            lineHeight: compact ? 22 : 24,
        }, tagsStyles: {
            p: {
                color: resolvedTextColor,
                marginTop: 0,
                marginBottom: compact ? 6 : 8,
                lineHeight: compact ? 22 : 24,
            },
            br: {
                lineHeight: compact ? 22 : 24,
            },
            ul: {
                marginTop: 0,
                marginBottom: compact ? 6 : 8,
                paddingLeft: 18,
            },
            ol: {
                marginTop: 0,
                marginBottom: compact ? 6 : 8,
                paddingLeft: 18,
            },
            li: {
                color: resolvedTextColor,
                marginBottom: 4,
                lineHeight: compact ? 22 : 24,
            },
            strong: {
                color: palette.textPrimary,
                fontWeight: "700",
            },
            b: {
                color: palette.textPrimary,
                fontWeight: "700",
            },
            em: {
                color: palette.textPrimary,
                fontStyle: "italic",
            },
            i: {
                color: palette.textPrimary,
                fontStyle: "italic",
            },
            h1: {
                color: palette.textPrimary,
                fontSize: compact ? 18 : 20,
                fontWeight: "800",
                marginTop: 0,
                marginBottom: 8,
            },
            h2: {
                color: palette.textPrimary,
                fontSize: compact ? 17 : 19,
                fontWeight: "800",
                marginTop: 0,
                marginBottom: 8,
            },
            h3: {
                color: palette.textPrimary,
                fontSize: compact ? 16 : 18,
                fontWeight: "700",
                marginTop: 0,
                marginBottom: 8,
            },
            h4: {
                color: palette.textPrimary,
                fontSize: compact ? 15 : 17,
                fontWeight: "700",
                marginTop: 0,
                marginBottom: 6,
            },
            a: {
                color: palette.link,
                textDecorationLine: "underline",
            },
            blockquote: {
                borderLeftWidth: 3,
                borderLeftColor: palette.border,
                backgroundColor: palette.surface,
                color: resolvedTextColor,
                paddingLeft: 12,
                marginLeft: 0,
                marginRight: 0,
            },
        }, renderersProps: {
            a: {
                onPress: (_event, href) => {
                    if (!href)
                        return;
                    react_native_1.Linking.openURL(href).catch(() => undefined);
                },
            },
        } }));
}
