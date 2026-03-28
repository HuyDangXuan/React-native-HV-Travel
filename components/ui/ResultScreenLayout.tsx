import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";
import ScreenContainer from "./ScreenContainer";
import SectionCard from "./SectionCard";

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

const toneToColor: Record<Tone, string> = {
  success: theme.colors.success,
  error: theme.colors.error,
  info: theme.colors.primary,
};

export default function ResultScreenLayout({
  tone = "info",
  icon,
  title,
  subtitle,
  children,
  footerActions = [],
}: Props) {
  const accent = toneToColor[tone];

  return (
    <ScreenContainer variant="detail" edges={["top"]}>
      <View style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCircle, { backgroundColor: `${accent}14` }]}>
            <Ionicons name={icon} size={56} color={accent} />
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
                    ? [styles.secondaryAction, { borderColor: accent }]
                    : [styles.primaryAction, { backgroundColor: accent }],
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.variant === "secondary"
                      ? { color: accent }
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
  return (
    <SectionCard style={[styles.card, style]}>
      {children}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.detailPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
    marginTop: theme.spacing.lg,
    ...theme.typography.heroTitle,
    color: theme.semantic.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.semantic.textSecondary,
    textAlign: "center",
  },
  body: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.lg,
  },
  bottomBar: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.layout.bottomBarPadding,
    borderTopWidth: 1,
    borderTopColor: theme.semantic.divider,
    backgroundColor: theme.semantic.screenSurface,
  },
  action: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: theme.semantic.screenSurface,
  },
  actionText: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
  },
  primaryActionText: {
    color: theme.colors.white,
  },
});
