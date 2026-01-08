import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../config/theme"; // ✅ sửa path theo dự án bạn

type Props = {
  color?: string;
  iconName?: keyof typeof Ionicons.glyphMap; // icon hiển thị (mặc định "close")
  iconSize?: number;      // size icon
  circleSize?: number;    // size vòng tròn
  ringSize?: number;      // size vòng ring
  shakeAxis?: "x" | "y";  // lắc ngang hay dọc
};

export default function FailureIcon({
  color = "#DC2626",
  iconName = "close",
  iconSize = 80,
  circleSize = 120,
  ringSize = 150,
  shakeAxis = "x",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 30, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 7, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim, shakeAnim]);

  const translate = shakeAxis === "y" ? { translateY: shakeAnim } : { translateX: shakeAnim };

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, translate],
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: color,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        <Ionicons name={iconName} size={iconSize} color={theme.colors.white} />
      </View>

      <View
        style={[
          styles.iconRing,
          {
            borderColor: color,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconRing: {
    position: "absolute",
    borderWidth: 3,
    opacity: 0.3,
  },
});
