import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../config/theme";
import App from "../App";

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress}: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={style.iconBtn}
    >
      <Ionicons name="arrow-back" size={32} color={theme.colors.text} />
    </Pressable>
  );
}

const style = StyleSheet.create({
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
});
