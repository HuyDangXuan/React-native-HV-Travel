import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import theme from "../../../../config/theme";
import { useNavigation } from "@react-navigation/native";

type Method = {
  id: string;
  name: string;
  logo: string;
};

const METHODS: Method[] = [
  {
    id: "mc",
    name: "MasterCard",
    logo: "https://cdn.simpleicons.org/mastercard",
  },
  {
    id: "visa",
    name: "Visa",
    logo: "https://cdn.simpleicons.org/visa",
  },
  {
    id: "paypal",
    name: "Paypal",
    logo: "https://cdn.simpleicons.org/paypal",
  },
];


export default function PaymentMethodScreen({}: any) {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>

        {/* spacer để title centered */}
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.content}>
        {METHODS.map((m) => (
          <Pressable
            key={m.id}
            style={styles.methodCard}
            onPress={() => {}}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <View style={styles.methodLeft}>
              <View style={styles.logoBox}>
                <SvgUri
                  uri={m.logo}
                  width="100%"
                  height="100%"
                  onError={(error) => console.log('SVG load error:', m.name, error)}
                />
              </View>
              <Text style={styles.methodText}>{m.name}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color={theme.colors.gray} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },

  header: {
    height: 54,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
  },
  headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: "800", color: theme.colors.text },

  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },

  methodCard: {
    height: 72,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },

  logoBox: {
    width: 54,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
  },

  methodText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "700",
  },
});