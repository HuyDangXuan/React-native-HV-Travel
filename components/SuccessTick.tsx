import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../config/theme"; // sửa path cho đúng dự án bạn

type Props = {
  color?: string;
  size?: number;       // icon size
  circleSize?: number; // vòng tròn
};

export default function SuccessTick({
  color = theme.colors.primary,
  size = 80,
  circleSize = 120,
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
        Animated.timing(shakeAnim, { toValue: 20, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -20, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 16, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -16, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim, shakeAnim]);

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: shakeAnim }] },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: color, width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
        <Ionicons name="checkmark" size={size} color={theme.colors.white} />
      </View>
      <View style={[styles.iconRing, { borderColor: color, width: circleSize + 30, height: circleSize + 30, borderRadius: (circleSize + 30) / 2 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl * 1.5,
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
