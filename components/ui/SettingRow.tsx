import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../context/ThemeModeContext";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
  showBorder?: boolean;
};

export default function SettingRow({
  icon,
  title,
  description,
  value,
  danger = false,
  onPress,
  trailing,
  showBorder = false,
}: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.semantic.screenSurface },
        showBorder && { borderBottomWidth: 1, borderBottomColor: theme.semantic.divider },
        pressed && onPress ? { opacity: 0.88 } : null,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: danger ? "rgba(239, 68, 68, 0.12)" : theme.colors.primaryLight,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={danger ? theme.colors.error : theme.colors.primary}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: danger ? theme.colors.error : theme.semantic.textPrimary }]}>
            {title}
          </Text>
          {description ? (
            <Text style={[styles.description, { color: theme.semantic.textSecondary }]}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {value ? (
          <Text style={[styles.value, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {trailing ?? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.semantic.textSecondary}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "42%",
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
  },
});
