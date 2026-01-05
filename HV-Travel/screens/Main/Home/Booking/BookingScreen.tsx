import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation } from "@react-navigation/native";

export default function BookingScreen({}: any) {
  const navigation = useNavigation<any>();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const pricePerAdult = 20000000;
  const pricePerChild = 15000000;
  const pricePerInfant = 5000000;

  const subtotal = adults * pricePerAdult + children * pricePerChild + infants * pricePerInfant;
  const serviceFee = 6000000;
  const discount = 5500000;
  const total = subtotal + serviceFee - discount;

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const getGuestSummary = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Người lớn`);
    if (children > 0) parts.push(`${children} Trẻ em`);
    if (infants > 0) parts.push(`${infants} Em bé`);
    return parts.join(", ") || "Chưa chọn";
  };

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
          <SelectableDetailRow
            icon="people-outline"
            label="Số lượng khách"
            value={getGuestSummary()}
            onPress={() => setShowGuestModal(true)}
          />
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
              {adults > 0 && (
                <Text style={styles.itemSub}>{adults} Người lớn x {formatMoney(pricePerAdult)}</Text>
              )}
              {children > 0 && (
                <Text style={styles.itemSub}>{children} Trẻ em x {formatMoney(pricePerChild)}</Text>
              )}
              {infants > 0 && (
                <Text style={styles.itemSub}>{infants} Em bé x {formatMoney(pricePerInfant)}</Text>
              )}
            </View>
            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Tổng phụ</Text>
            <Text style={styles.money}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Phí dịch vụ</Text>
            <Text style={styles.money}>{formatMoney(serviceFee)}</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.muted}>Giảm giá</Text>
            <Text style={styles.money}>-{formatMoney(discount)}</Text>
          </View>

          <View style={styles.rule} />

          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.totalMoney}>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cta}
          onPress={() => {
            navigation.navigate("PaymentMethodScreen");
          }}
        >
          <Text style={styles.ctaText}>Thanh toán</Text>
        </Pressable>
      </View>

      {/* Guest Selection Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowGuestModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn số lượng khách</Text>
              <Pressable onPress={() => setShowGuestModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Adults */}
              <GuestCounter
                label="Người lớn"
                subtitle="Từ 12 tuổi trở lên"
                value={adults}
                onDecrement={() => setAdults(Math.max(1, adults - 1))}
                onIncrement={() => setAdults(adults + 1)}
                minValue={1}
              />

              {/* Children */}
              <GuestCounter
                label="Trẻ em"
                subtitle="Từ 2-11 tuổi"
                value={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(children + 1)}
                minValue={0}
              />

              {/* Infants */}
              <GuestCounter
                label="Em bé"
                subtitle="Dưới 2 tuổi"
                value={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(infants + 1)}
                minValue={0}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalBtn} onPress={() => setShowGuestModal(false)}>
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

function SelectableDetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </Pressable>
  );
}

function GuestCounter({
  label,
  subtitle,
  value,
  onDecrement,
  onIncrement,
  minValue,
}: {
  label: string;
  subtitle: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minValue: number;
}) {
  return (
    <View style={styles.counterRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.counterSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.counterControls}>
        <Pressable
          style={[styles.counterBtn, value <= minValue && styles.counterBtnDisabled]}
          onPress={onDecrement}
          disabled={value <= minValue}
        >
          <Ionicons name="remove" size={20} color={value <= minValue ? theme.colors.gray : theme.colors.primary} />
        </Pressable>

        <Text style={styles.counterValue}>{value}</Text>

        <Pressable style={styles.counterBtn} onPress={onIncrement}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
        </Pressable>
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

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  modalFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  modalBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },

  // Counter
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  counterSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnDisabled: {
    borderColor: theme.colors.border,
  },
  counterValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    minWidth: 24,
    textAlign: "center",
  },
});