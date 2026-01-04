import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation } from "@react-navigation/native";

export default function BookingScreen({}: any) {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Đặt vé</Text>

        {/* spacer để title ở giữa */}
        <View style={styles.headerIcon} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Booking Details */}
        <Text style={styles.h2}>Thông tin vé</Text>

        <View style={styles.card}>
          <DetailRow icon="briefcase-outline" label="Gói tour" value="Du lịch Maldives" />
          <Divider />
          <DetailRow icon="calendar-outline" label="Thời gian" value="2 Ngày 3 Đêm" />
          <Divider />
          <DetailRow icon="people-outline" label="Số lượng khách" value="2 Người lớn" />
          <Divider />
          <DetailRow icon="bus-outline" label="Phương tiện" value="Máy bay" />
          <Divider />
          <DetailRow icon="home-outline" label="Hotel & Resort" value="Khách sạn Mường Thanh (5 Sao)" />
          <Divider />
          <DetailRow icon="time-outline" label="Ngày xuất phát / Ngày về" value="18 Tháng 3 - 22 Tháng 3" />
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentHeader}>
          <Text style={styles.h2}>Tổng thanh toán</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.addPromo}>Thêm khuyến mãi</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.lineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Du lịch Maldives</Text>
              <Text style={styles.itemSub}>2 x 20.000.000đ</Text>
            </View>
            <Text style={styles.money}>40.000.000đ</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Tổng phụ</Text>
            <Text style={styles.money}>40.000.000đ</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Phí dịch vụ</Text>
            <Text style={styles.money}>6.000.000đ</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Giảm giá</Text>
            <Text style={styles.money}>5.500.000đ</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.totalMoney}>40.500.000đ</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cta} onPress={() => {
          navigation.navigate("PaymentMethodScreen");
        }}>
          <Text style={styles.ctaText}>Thanh toán</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ---------- Styles ---------- */

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

  content: { padding: theme.spacing.md },

  h2: { fontSize: theme.fontSize.lg, fontWeight: "800", color: theme.colors.text, marginBottom: theme.spacing.md },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },

  divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md + 46 + theme.spacing.md },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  rowLabel: { color: theme.colors.gray, fontSize: theme.fontSize.md, fontWeight: "600" },
  rowValue: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: "500", marginTop: 2 },

  paymentHeader: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addPromo: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: "800" },

  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  rule: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },

  itemTitle: { fontSize: theme.fontSize.md, fontWeight: "600", color: theme.colors.text },
  itemSub: { marginTop: 6, fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },

  muted: { fontSize: theme.fontSize.md, color: theme.colors.gray, fontWeight: "600" },
  money: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: "600" },

  totalLabel: { fontSize: theme.fontSize.lg, fontWeight: "900", color: theme.colors.text },
  totalMoney: { fontSize: theme.fontSize.lg, fontWeight: "900", color: theme.colors.text },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cta: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "900" },
});
