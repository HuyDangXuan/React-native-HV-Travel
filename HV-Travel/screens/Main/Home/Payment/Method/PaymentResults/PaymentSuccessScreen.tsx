import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string; // string hiển thị (đúng flow mới)
  amount?: string;     // fallback cũ
  method?: string;
  orderId?: string;
  transactionId?: string;
};

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number.isFinite(v) ? v : 0
  );

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params: RouteParams = route?.params ?? {};

  const method = params?.method || "Unknown";
  const orderId = params?.orderId || "DL" + Date.now();
  const transactionId = params?.transactionId || "TX" + Date.now();
  const tourId = params?.id;

  const total = typeof params?.total === "number" ? params.total : 0;

  // Ưu tiên amountText (flow mới) -> nếu không có thì lấy total -> fallback amount cũ
  const amountText = useMemo(() => {
    if (typeof params?.amountText === "string" && params.amountText.trim()) return params.amountText;
    if (total > 0) return formatVND(total);
    if (typeof params?.amount === "string" && params.amount.trim()) return params.amount;
    return formatVND(0);
  }, [params?.amountText, params?.amount, total]);

  // Animation
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
  }, []);

  const getMethodColor = () => {
    switch ((method || "").toLowerCase()) {
      case "zalopay":
        return "#3B82F6";
      case "vnpay":
        return "#DC2626";
      case "momo":
        return "#A50064";
      case "bank":
      case "chuyển khoản":
        return "#059669";
      case "cash":
      case "tiền mặt":
        return "#F59E0B";
      default:
        return theme.colors.primary;
    }
  };

  const getMethodIcon = () => {
    switch ((method || "").toLowerCase()) {
      case "zalopay":
      case "vnpay":
      case "momo":
        return "phone-portrait";
      case "bank":
      case "chuyển khoản":
        return "card";
      case "cash":
      case "tiền mặt":
        return "cash";
      default:
        return "checkmark-circle";
    }
  };

  const color = getMethodColor();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: shakeAnim }],
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={80} color={theme.colors.white} />
          </View>
          <View style={[styles.iconRing, { borderColor: color }]} />
        </Animated.View>

        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Thanh toán thành công!</Text>
          <Text style={styles.subtitle}>
            Đơn hàng của bạn đã được xác nhận và đang được xử lý
          </Text>

          {/* Amount */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Số tiền đã thanh toán</Text>
            <Text style={[styles.amountValue, { color }]}>{amountText}</Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            {!!tourId && (
              <>
                <DetailRow icon="pricetag-outline" label="Mã tour" value={tourId} iconColor={color} />
                <Divider />
              </>
            )}

            <DetailRow icon="receipt-outline" label="Mã đơn hàng" value={orderId} iconColor={color} />
            <Divider />
            <DetailRow icon="card-outline" label="Mã giao dịch" value={transactionId} iconColor={color} />
            <Divider />
            <DetailRow icon={getMethodIcon()} label="Phương thức" value={method} iconColor={color} />
            <Divider />
            <DetailRow
              icon="time-outline"
              label="Thời gian"
              value={new Date().toLocaleString("vi-VN")}
              iconColor={color}
            />
            <Divider />
            <DetailRow
              icon="shield-checkmark-outline"
              label="Trạng thái"
              value="Đã xác nhận"
              iconColor={color}
              valueStyle={[styles.successText, { color }]}
            />
          </View>

          {/* Next Steps */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Các bước tiếp theo</Text>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: color }]}>
                <Ionicons name="mail" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>Email xác nhận đã được gửi đến hộp thư của bạn</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: color }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>Kiểm tra lịch trình chi tiết trong mục "Đơn hàng của tôi"</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: color }]}>
                <Ionicons name="headset" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>Liên hệ hotline 1900-xxxx nếu cần hỗ trợ</Text>
            </View>
          </View>

          <View style={[styles.infoBox, { backgroundColor: color + "15" }]}>
            <Ionicons name="information-circle" size={20} color={color} />
            <Text style={[styles.infoText, { color }]}>
              Vui lòng lưu lại thông tin giao dịch để tra cứu sau này. Chúng tôi sẽ liên hệ với bạn trước
              ngày khởi hành để xác nhận lại lịch trình.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: color }]}
          onPress={() => {
            navigation.navigate("BookingHistory")
          }}
        >
          <Text style={[styles.secondaryBtnText, { color }]}>Xem đơn hàng</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: color }]}
          onPress={() => navigation.replace("MainTabs")}
        >
          <Text style={styles.primaryBtnText}>Về trang chủ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  iconColor,
  valueStyle,
}: {
  icon: any;
  label: string;
  value: string;
  iconColor: string;
  valueStyle?: any;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },
  content: { padding: theme.spacing.lg, alignItems: "center" },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    opacity: 0.3,
  },

  contentWrapper: { width: "100%" },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },

  amountBox: {
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
  },
  amountValue: { fontSize: 32, fontWeight: "800" },

  detailsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: "700",
    marginTop: 2,
  },
  successText: { fontWeight: "800" },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  stepsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  stepsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    paddingTop: 8,
  },

  infoBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: theme.fontSize.sm, lineHeight: 20 },

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
    flex: 2,
    height: 54,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: theme.fontSize.md, fontWeight: "700" },
});
