import React from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

import { useAppTheme } from "../../context/ThemeModeContext";

type Props = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function SectionCard({
  children,
  padded = true,
  elevated = false,
  style,
  ...rest
}: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.semantic.screenSurface,
          borderRadius: theme.radius.xl,
          borderColor: theme.semantic.divider,
        },
        padded && { padding: theme.spacing.md },
        elevated && theme.shadow.md,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
