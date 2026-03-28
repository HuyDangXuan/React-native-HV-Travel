import React from "react";
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../context/ThemeModeContext";

type Variant = "topLevel" | "detail" | "auth" | "plain";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

export default function ScreenContainer({
  children,
  variant = "topLevel",
  scroll = false,
  edges,
  style,
  contentContainerStyle,
  scrollProps,
}: Props) {
  const theme = useAppTheme();
  const backgroundColor =
    variant === "detail"
      ? theme.semantic.screenSurface
      : theme.semantic.screenBackground;

  const paddingHorizontal =
    variant === "topLevel" || variant === "auth"
      ? theme.layout.topLevelPadding
      : variant === "detail"
        ? theme.layout.detailPadding
        : 0;

  const safe = (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            paddingHorizontal ? { paddingHorizontal } : null,
            contentContainerStyle,
          ]}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );

  return safe;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
});
