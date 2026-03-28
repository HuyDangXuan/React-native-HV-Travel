import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import ScreenContainer from "./ScreenContainer";
import SectionCard from "./SectionCard";
import { useAppTheme, useThemeMode } from "../../context/ThemeModeContext";

type Tone = "success" | "error" | "info";

type Action = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

type Props = {
  tone?: Tone;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  footerActions?: Action[];
};

export default function ResultScreenLayout({
  tone = "info",
  icon,
  title,
  subtitle,
  children,
  footerActions = [],
}: Props) {
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();

  const accent = useMemo(() => {
    if (tone === "success") return appTheme.colors.success;
    if (tone === "error") return appTheme.colors.error;
    return appTheme.colors.primary;
  }, [appTheme, tone]);

  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      divider: appTheme.semantic.divider,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      onPrimary: appTheme.colors.white,
      accent,
      accentSoft: `${accent}14`,
    }),
    [accent, appTheme]
  );

  const styles = useMemo(() => createStyles(appTheme, ui), [appTheme, ui]);

  return (
    <ScreenContainer variant="detail" edges={["top"]}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.bg} />

      <View style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCircle, { backgroundColor: ui.accentSoft }]}>
            <Ionicons name={icon} size={56} color={ui.accent} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.body}>{children}</View>
          <View style={{ height: 110 }} />
        </ScrollView>

        {footerActions.length ? (
          <View style={styles.bottomBar}>
            {footerActions.map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={[
                  styles.action,
                  action.variant === "secondary"
                    ? [styles.secondaryAction, { borderColor: ui.accent }]
                    : [styles.primaryAction, { backgroundColor: ui.accent }],
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.variant === "secondary"
                      ? { color: ui.accent }
                      : styles.primaryActionText,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

export function ResultCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const appTheme = useAppTheme();

  return <SectionCard style={[{ padding: appTheme.spacing.lg }, style]}>{children}</SectionCard>;
}

function createStyles(
  appTheme: ReturnType<typeof useAppTheme>,
  ui: {
    bg: string;
    textPrimary: string;
    textSecondary: string;
    divider: string;
    mutedSurface: string;
    onPrimary: string;
    accent: string;
    accentSoft: string;
  }
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: ui.bg,
    },
    scrollContent: {
      paddingHorizontal: appTheme.layout.detailPadding,
      paddingTop: appTheme.spacing.xl,
      paddingBottom: appTheme.spacing.lg,
    },
    heroCircle: {
      width: 116,
      height: 116,
      borderRadius: 58,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    title: {
      marginTop: appTheme.spacing.lg,
      ...appTheme.typography.heroTitle,
      color: ui.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      marginTop: appTheme.spacing.sm,
      ...appTheme.typography.body,
      color: ui.textSecondary,
      textAlign: "center",
    },
    body: {
      marginTop: appTheme.spacing.xl,
      gap: appTheme.spacing.md,
    },
    bottomBar: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.layout.bottomBarPadding,
      borderTopWidth: 1,
      borderTopColor: ui.divider,
      backgroundColor: ui.bg,
    },
    action: {
      minHeight: 54,
      borderRadius: appTheme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: appTheme.spacing.md,
    },
    primaryAction: {
      flex: 1,
    },
    secondaryAction: {
      flex: 1,
      borderWidth: 1,
      backgroundColor: ui.mutedSurface,
    },
    actionText: {
      fontSize: appTheme.fontSize.md,
      fontWeight: "800",
    },
    primaryActionText: {
      color: ui.onPrimary,
    },
  });
}
