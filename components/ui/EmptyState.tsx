import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../context/ThemeModeContext";

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
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            width: theme.semantic.emptyState.iconSize,
            height: theme.semantic.emptyState.iconSize,
            borderRadius: theme.semantic.emptyState.iconSize / 2,
            backgroundColor: theme.colors.primaryLight,
            marginBottom: theme.spacing.lg,
          },
        ]}
      >
        <Ionicons name={icon} size={56} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, { color: theme.semantic.textPrimary }, theme.typography.pageTitle]}>
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            marginTop: theme.spacing.sm,
            color: theme.semantic.textSecondary,
          },
          theme.typography.body,
        ]}
      >
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          style={[
            styles.action,
            {
              marginTop: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={onAction}
        >
          <Text style={[styles.actionText, { color: theme.colors.white, fontSize: theme.fontSize.sm }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  action: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  actionText: {
    fontWeight: "800",
  },
});
