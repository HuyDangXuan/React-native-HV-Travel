import React, { useMemo } from "react";
import { Linking, Text, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

import { normalizeRichTextHtml } from "../../utils/richText";

type RichHtmlPalette = {
  textPrimary: string;
  textSecondary: string;
  link: string;
  border: string;
  surface: string;
};

type RichHtmlTextProps = {
  html?: string | null;
  palette: RichHtmlPalette;
  compact?: boolean;
  fallbackText?: string;
  textColor?: string;
};

export default function RichHtmlText({
  html,
  palette,
  compact = false,
  fallbackText = "",
  textColor,
}: RichHtmlTextProps) {
  const { width } = useWindowDimensions();
  const normalizedHtml = useMemo(() => normalizeRichTextHtml(html), [html]);
  const resolvedTextColor = textColor || palette.textSecondary;

  if (!normalizedHtml) {
    return <Text style={{ color: resolvedTextColor }}>{fallbackText}</Text>;
  }

  return (
    <RenderHtml
      contentWidth={Math.max(width - 40, 120)}
      source={{ html: normalizedHtml }}
      ignoredDomTags={["img", "iframe", "script", "style", "video", "audio"]}
      baseStyle={{
        color: resolvedTextColor,
        fontSize: compact ? 14 : 15,
        lineHeight: compact ? 22 : 24,
      }}
      tagsStyles={{
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
      }}
      renderersProps={{
        a: {
          onPress: (_event: unknown, href: string) => {
            if (!href) return;
            Linking.openURL(href).catch(() => undefined);
          },
        },
      }}
    />
  );
}
