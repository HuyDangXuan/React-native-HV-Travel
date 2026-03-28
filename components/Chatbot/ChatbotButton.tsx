import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../context/ThemeModeContext";

export default function ChatbotButton({ onPress }: { onPress: () => void }) {
  const appTheme = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        btn: {
          position: "absolute",
          right: 20,
          bottom: 90,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: appTheme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: appTheme.semantic.divider,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 16,
          elevation: 8,
        },
      }),
    [appTheme]
  );

  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Ionicons name="chatbubble-ellipses" size={26} color={appTheme.colors.white} />
    </Pressable>
  );
}
