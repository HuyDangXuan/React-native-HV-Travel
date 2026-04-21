import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { useAppTheme } from "../../context/ThemeModeContext";
import IconButton from "./IconButton";

type Variant = "hero" | "compact" | "overlay";

type Props = {
  variant: Variant;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
};

export default function AppHeader({
  variant,
  title,
  subtitle,
  onBack,
  left,
  right,
  showDivider = variant !== "overlay",
  style,
  titleStyle,
  subtitleStyle,
}: Props) {
  const theme = useAppTheme();
  const isHero = variant === "hero";
  const isOverlay = variant === "overlay";

  const leftNode =
    left ??
    (onBack ? (
      <IconButton icon="arrow-back" onPress={onBack} variant={isOverlay ? "overlay" : "surface"} />
    ) : null);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: isOverlay ? "transparent" : theme.semantic.screenBackground,
          borderBottomColor: theme.semantic.divider,
        },
        isHero && {
          paddingHorizontal: theme.layout.topLevelPadding,
          paddingTop: theme.spacing.heroTop,
          paddingBottom: 14,
        },
        variant === "compact" && {
          paddingHorizontal: theme.layout.detailPadding,
          paddingVertical: 10,
          backgroundColor: theme.semantic.screenSurface,
        },
        isOverlay && {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: theme.layout.detailPadding,
          paddingTop: 10,
          paddingBottom: 12,
          zIndex: 10,
        },
        showDivider && !isOverlay && styles.divider,
        style,
      ]}
    >
      <View style={[styles.row, isHero && styles.heroRow]}>
        {leftNode ? <View style={styles.side}>{leftNode}</View> : isHero ? null : <View style={styles.side} />}

        <View style={[styles.titleWrap, isHero && styles.heroTitleWrap]}>
          <Text
            style={[
              isHero ? theme.typography.heroTitle : theme.typography.pageTitle,
              {
                color: isOverlay ? theme.colors.white : theme.semantic.textPrimary,
                textAlign: "center",
              },
              titleStyle,
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                isOverlay ? styles.overlaySubtitle : theme.typography.body,
                {
                  color: isOverlay ? "rgba(255,255,255,0.9)" : theme.semantic.textSecondary,
                  textAlign: "center",
                },
                subtitleStyle,
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ? <View style={[styles.side, styles.right]}>{right}</View> : isHero ? null : <View style={styles.side} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  divider: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroRow: {
    alignItems: "flex-start",
  },
  side: {
    minWidth: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  right: {
    alignItems: "flex-end",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitleWrap: {
    paddingTop: 2,
  },
  overlaySubtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
});
