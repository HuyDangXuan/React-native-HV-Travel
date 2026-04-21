import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "../../context/ThemeModeContext";

type SkeletonBlockProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SkeletonBlock({ style }: SkeletonBlockProps) {
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        { backgroundColor: theme.semantic.divider },
        style,
        { opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 12,
  },
});

