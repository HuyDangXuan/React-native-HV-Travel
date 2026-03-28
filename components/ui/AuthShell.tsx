import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import theme from "../../config/theme";
import ScreenContainer from "./ScreenContainer";
import SectionCard from "./SectionCard";
import IconButton from "./IconButton";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  cardless?: boolean;
};

export default function AuthShell({
  title,
  subtitle,
  onBack,
  right,
  children,
  footer,
  cardless = false,
}: Props) {
  return (
    <ScreenContainer
      variant="auth"
      scroll
      edges={["top"]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <View style={styles.topSide}>
          {onBack ? <IconButton icon="arrow-back" onPress={onBack} /> : null}
        </View>
        <View style={styles.topSideRight}>{right}</View>
      </View>

      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image source={theme.image.logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {cardless ? children : <SectionCard style={styles.formCard}>{children}</SectionCard>}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.sm,
  },
  topRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topSide: {
    minWidth: 44,
  },
  topSideRight: {
    minWidth: 44,
    alignItems: "flex-end",
  },
  hero: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  logo: {
    width: 72,
    height: 72,
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
  formCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
});
