import React from "react";
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

import { useAppTheme } from "../context/ThemeModeContext";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({
  title,
  loading,
  disabled,
  onPress,
  variant = "primary",
  style,
}: Props) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor:
            variant === "secondary" ? theme.semantic.screenSurface : theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        variant === "secondary" && styles.buttonSecondary,
        (loading || disabled) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <LottieView source={theme.animation.loading} autoPlay loop style={styles.loading} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color:
                variant === "secondary" ? theme.colors.primary : theme.semantic.screenSurface,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loading: {
    width: 200,
    height: 120,
  },
  text: {
    fontWeight: "800",
    fontSize: 16,
  },
});
