import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

type RouteParams = {
  id?: string;          // tourId
  total?: number;       // số tiền (number)
  amountText?: string;  // text đã format sẵn (optional)
  orderId?: string;
};

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number.isFinite(v) ? v : 0
  );

export default function MoMoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params: RouteParams = route?.params ?? {};
  const tourId = params?.id;
  const total = typeof params?.total === "number" ? params.total : 0;
  const orderId = params?.orderId || "DL" + Date.now();

  const amountText = useMemo(() => {
    return params?.amountText || formatVND(total);
  }, [params?.amountText, total]);

  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.replace("PaymentFailedScreen", {
            reason: "timeout",
            method: "MoMo",
            orderId,
            id: tourId,
            total,
            amountText,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigation, orderId, tourId, total, amountText]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOpenMoMoApp = () => {
    // TODO: deep link MoMo (sau này)
    console.log("Opening MoMo app...");
  };

  const handleCheckPayment = () => {
    setIsProcessing(true);

    // Giả lập kiểm tra thanh toán
    setTimeout(() => {
      setIsProcessing(false);

      navigation.replace("PaymentSuccessScreen", {
        method: "MoMo",
        orderId,
        id: tourId,
        total,
        amountText,
      });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerIcon}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Thanh toán MoMo</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Timer */}
        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={20} color="#A50064" />
          <Text style={styles.timerText}>Thời gian còn lại: </Text>
          <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
          <Text style={styles.amountValue}>{amountText}</Text>

          {!!tourId && <Text style={styles.subInfo}>Mã tour: {tourId}</Text>}
          <Text style={styles.subInfo}>Mã đơn: {orderId}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={theme.colors.gray} />
            </View>
            <Text style={styles.qrHint}>Mở MoMo và quét mã QR này</Text>
          </View>
        </View>

        {/* Or Divider */}
        <View style={styles.orDivider}>
          <View style={styles.line} />
          <Text style={styles.orText}>HOẶC</Text>
          <View style={styles.line} />
        </View>

        {/* Quick Action */}
        <Pressable style={styles.quickActionBtn} onPress={handleOpenMoMoApp}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="phone-portrait-outline" size={32} color="#A50064" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Mở ứng dụng MoMo</Text>
            <Text style={styles.quickActionDesc}>
              Thanh toán nhanh chóng và bảo mật
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.gray} />
        </Pressable>

        {/* Order Info */}
        <View style={styles.infoBox}>
          <InfoRow icon="document-text-outline" label="Mã đơn hàng" value={orderId} />
          <Divider />
          <InfoRow icon="wallet-outline" label="Phương thức" value="Ví MoMo" />
          <Divider />
          <InfoRow icon="time-outline" label="Thời gian tạo" value={new Date().toLocaleString("vi-VN")} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Hướng dẫn thanh toán</Text>

          <Text style={styles.methodTitle}>💜 Cách 1: Mở ứng dụng trực tiếp</Text>
          <Step n={1} text='Nhấn nút "Mở ứng dụng MoMo" phía trên' color="#A50064" />
          <Step n={2} text="Xác nhận thanh toán trong ứng dụng MoMo" color="#A50064" />
          <Step n={3} text="Nhập mã PIN hoặc xác thực vân tay/khuôn mặt" color="#A50064" />

          <Text style={styles.methodTitle}>📱 Cách 2: Quét mã QR</Text>
          <Step n={1} text="Mở ứng dụng MoMo trên điện thoại" color="#A50064" />
          <Step n={2} text='Chọn biểu tượng "Quét mã QR" trên màn hình chính' color="#A50064" />
          <Step n={3} text="Quét mã QR hiển thị trên màn hình này" color="#A50064" />
          <Step n={4} text="Xác nhận và hoàn tất thanh toán" color="#A50064" />
        </View>

        {/* Features */}
        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>✨ Ưu điểm thanh toán MoMo</Text>
          <Feature text="Thanh toán nhanh chóng trong vài giây" />
          <Feature text="Bảo mật tuyệt đối với mã hóa 256-bit" />
          <Feature text="Tích điểm và nhận ưu đãi hấp dẫn" />
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Ionicons name="shield-checkmark" size={20} color="#A50064" />
          <Text style={styles.noteText}>
            Giao dịch được bảo vệ bởi MoMo với tiêu chuẩn bảo mật quốc tế.
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

function Step({ n, text, color }: { n: number; text: string; color: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNumber, { backgroundColor: color }]}>
        <Text style={styles.stepNumberText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={20} color="#A50064" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#A50064" />
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

  content: { padding: theme.spacing.md },

  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: "#FDF2F8",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  timerText: { fontSize: theme.fontSize.sm, color: theme.colors.text, fontWeight: "600" },
  timerValue: { fontSize: theme.fontSize.lg, color: "#A50064", fontWeight: "800" },

  amountBox: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    gap: 6,
  },
  amountLabel: { fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },
  amountValue: { fontSize: 32, fontWeight: "800", color: "#A50064" },
  subInfo: { fontSize: theme.fontSize.xs, color: theme.colors.gray, fontWeight: "600" },

  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: "#FDF2F8",
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: "#A50064",
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
  quickActionTitle: { fontSize: theme.fontSize.md, fontWeight: "700", color: "#A50064" },
  quickActionDesc: { fontSize: theme.fontSize.sm, color: theme.colors.gray, marginTop: 2 },

  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },

  qrSection: { marginBottom: theme.spacing.lg },
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
  qrHint: { fontSize: theme.fontSize.sm, color: theme.colors.gray, textAlign: "center" },

  infoBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  infoLabel: { fontSize: theme.fontSize.sm, color: theme.colors.gray, fontWeight: "600" },
  infoValue: { fontSize: theme.fontSize.sm, color: theme.colors.text, fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },

  instructionBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionTitle: { fontSize: theme.fontSize.md, fontWeight: "700", color: theme.colors.text, marginBottom: theme.spacing.md },
  methodTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { color: theme.colors.white, fontSize: theme.fontSize.xs, fontWeight: "700" },
  stepText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text, lineHeight: 20, paddingTop: 2 },

  featuresBox: {
    backgroundColor: "#FDF2F8",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  featuresTitle: { fontSize: theme.fontSize.md, fontWeight: "700", color: theme.colors.text, marginBottom: theme.spacing.sm },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  featureText: { flex: 1, fontSize: theme.fontSize.sm, color: theme.colors.text, lineHeight: 20 },

  noteBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#FDF2F8",
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: theme.fontSize.sm, color: "#831843", lineHeight: 20 },

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
    backgroundColor: "#A50064",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "700" },
  secondaryBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: "700" },
});
