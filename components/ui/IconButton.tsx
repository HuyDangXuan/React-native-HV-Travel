import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../context/ThemeModeContext";

type Variant = "surface" | "overlay" | "ghost";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badgeText?: string | number;
  variant?: Variant;
  size?: number;
  color?: string;
  disabled?: boolean;
};

export default function IconButton({
  icon,
  onPress,
  badgeText,
  variant = "surface",
  size = 40,
  color,
  disabled = false,
}: Props) {
  const theme = useAppTheme();
  const iconColor =
    color ?? (variant === "overlay" ? theme.colors.white : theme.semantic.textPrimary);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor:
            variant === "surface"
              ? theme.semantic.screenMutedSurface
              : variant === "overlay"
                ? "rgba(255,255,255,0.2)"
                : "transparent",
          borderWidth: variant === "overlay" ? 1 : 0,
          borderColor: variant === "overlay" ? "rgba(255,255,255,0.3)" : "transparent",
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons name={icon} size={Math.max(18, size * 0.52)} color={iconColor} />
      {badgeText ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.badgeText, { color: theme.colors.white }]}>{badgeText}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
});
