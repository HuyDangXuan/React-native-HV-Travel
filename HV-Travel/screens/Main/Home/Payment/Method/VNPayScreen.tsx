import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function VNPayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = route.params?.amount || "40.500.000đ";
  const orderId = route.params?.orderId || "DL" + Date.now();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.replace("PaymentFailedScreen", { reason: "timeout" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenVNPayApp = () => {
    // Trong thực tế sẽ mở deep link VNPay
    console.log("Opening VNPay app...");
  };

  const handleCheckPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigation.replace("PaymentFailedScreen", { method: "VNPay", orderId });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Thanh toán VNPay</Text>

        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Timer */}
        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={20} color="#DC2626" />
          <Text style={styles.timerText}>Thời gian còn lại: </Text>
          <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
          <Text style={styles.amountValue}>{amount}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Quét mã QR với VNPay</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={theme.colors.gray} />
            </View>
            <Text style={styles.qrHint}>Quét mã bằng ứng dụng VNPay</Text>
          </View>
        </View>

        {/* Or Divider */}
        <View style={styles.orDivider}>
          <View style={styles.line} />
          <Text style={styles.orText}>HOẶC</Text>
          <View style={styles.line} />
        </View>
        
        {/* Quick Action */}
        <Pressable style={styles.quickActionBtn} onPress={handleOpenVNPayApp}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="phone-portrait-outline" size={32} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Mở ứng dụng VNPay</Text>
            <Text style={styles.quickActionDesc}>Thanh toán nhanh chóng và bảo mật</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.gray} />
        </Pressable>

        {/* Order Info */}
        <View style={styles.infoBox}>
          <InfoRow icon="document-text-outline" label="Mã đơn hàng" value={orderId} />
          <Divider />
          <InfoRow icon="card-outline" label="Phương thức" value="VNPay QR" />
          <Divider />
          <InfoRow icon="time-outline" label="Thời gian tạo" value={new Date().toLocaleString("vi-VN")} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Hướng dẫn thanh toán</Text>
          
          <Text style={styles.methodTitle}>Cách 1: Quét mã QR</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Mở ứng dụng VNPay</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Chọn biểu tượng quét QR</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Quét mã QR trên màn hình</Text>
          </View>

          <Text style={styles.methodTitle}>Cách 2: Mở ứng dụng</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Nhấn nút "Mở ứng dụng VNPay"</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Xác nhận thanh toán trong app</Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color="#DC2626" />
          <Text style={styles.noteText}>
            VNPay hỗ trợ thanh toán qua thẻ ATM nội địa, thẻ quốc tế và tài khoản ngân hàng liên kết.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.secondaryBtn, { flex: 1 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryBtnText}>Hủy</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { flex: 2 }]}
          onPress={handleCheckPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Kiểm tra thanh toán</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#DC2626" />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: "800", color: theme.colors.text },

  content: {
    padding: theme.spacing.md,
  },

  // Timer
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: "#FEF2F2",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  timerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "600",
  },
  timerValue: {
    fontSize: theme.fontSize.lg,
    color: "#DC2626",
    fontWeight: "800",
  },

  // Amount
  amountBox: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#DC2626",
  },

  // Quick Action
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "#FDF2F8",
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: "#DC2626",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#DC2626",
  },
  quickActionDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },

  // Or Divider
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },

  // QR
  qrSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  qrBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  qrHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    textAlign: "center",
  },

  // Open App Button
  openAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    height: 54,
    backgroundColor: "#DC2626",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  openAppText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },

  // Info
  infoBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "700",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  // Instructions
  instructionBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  methodTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    paddingTop: 2,
  },

  // Note
  noteBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#FEF2F2",
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
  },
  noteText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: "#991B1B",
    lineHeight: 20,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  primaryBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  secondaryBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});