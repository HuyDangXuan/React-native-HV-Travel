import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../config/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={56} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.semantic.emptyState.paddingHorizontal,
    paddingVertical: theme.semantic.emptyState.paddingVertical,
  },
  iconCircle: {
    width: theme.semantic.emptyState.iconSize,
    height: theme.semantic.emptyState.iconSize,
    borderRadius: theme.semantic.emptyState.iconSize / 2,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.pageTitle,
    color: theme.semantic.textPrimary,
    textAlign: "center",
  },
  description: {
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.semantic.textSecondary,
    textAlign: "center",
  },
  action: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: "800",
  },
});
