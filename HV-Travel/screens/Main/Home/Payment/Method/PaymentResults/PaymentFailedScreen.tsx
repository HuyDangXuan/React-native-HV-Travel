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
import FailureIcon from "../../../../../../components/FailureIcon";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string; // flow mới
  amount?: string;     // fallback cũ
  orderId?: string;
  method?: string;
  reason?: string;
};

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number.isFinite(v) ? v : 0
  );

export default function PaymentFailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params: RouteParams = route?.params ?? {};

  const reason = params?.reason || "unknown";
  const method = params?.method || "Unknown";
  const orderId = params?.orderId || "DL" + Date.now();
  const tourId = params?.id;

  const total = typeof params?.total === "number" ? params.total : 0;

  const amountText = useMemo(() => {
    if (typeof params?.amountText === "string" && params.amountText.trim()) return params.amountText;
    if (total > 0) return formatVND(total);
    if (typeof params?.amount === "string" && params.amount.trim()) return params.amount;
    return formatVND(0);
  }, [params?.amountText, params?.amount, total]);

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
        return "#DC2626";
    }
  };

  const color = getMethodColor();

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
  }, []);

  const getFailureInfo = () => {
    switch (reason) {
      case "timeout":
        return {
          title: "Hết thời gian thanh toán",
          message: "Phiên thanh toán đã hết hạn. Vui lòng thử lại.",
          icon: "time-outline",
        };
      case "insufficient_funds":
        return {
          title: "Số dư không đủ",
          message: "Tài khoản của bạn không đủ số dư để thực hiện giao dịch.",
          icon: "wallet-outline",
        };
      case "cancelled":
        return {
          title: "Đã hủy thanh toán",
          message: "Bạn đã hủy giao dịch thanh toán.",
          icon: "close-circle-outline",
        };
      case "network_error":
        return {
          title: "Lỗi kết nối",
          message: "Không thể kết nối đến máy chủ thanh toán. Vui lòng kiểm tra kết nối mạng.",
          icon: "wifi-outline",
        };
      case "bank_error":
        return {
          title: "Lỗi từ ngân hàng",
          message: "Ngân hàng từ chối giao dịch. Vui lòng liên hệ ngân hàng để biết thêm chi tiết.",
          icon: "card-outline",
        };
      default:
        return {
          title: "Thanh toán thất bại",
          message: "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
          icon: "alert-circle-outline",
        };
    }
  };

  const failureInfo = getFailureInfo();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Error Icon */}
        <FailureIcon color={color} iconName="close" shakeAxis="x" />


        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{failureInfo.title}</Text>
          <Text style={styles.subtitle}>{failureInfo.message}</Text>

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
            <DetailRow icon="cash-outline" label="Số tiền" value={amountText} iconColor={color} />
            <Divider />
            <DetailRow icon="card-outline" label="Phương thức" value={method} iconColor={color} />
            <Divider />
            <DetailRow icon="time-outline" label="Thời gian" value={new Date().toLocaleString("vi-VN")} iconColor={color} />
            <Divider />
            <DetailRow
              icon={failureInfo.icon}
              label="Lý do"
              value={failureInfo.title}
              iconColor={color}
              valueStyle={[styles.errorText, { color }]}
            />
          </View>

          {/* Common Solutions */}
          <View style={[styles.solutionsCard, { backgroundColor: color + "12" }]}>
            <Text style={styles.solutionsTitle}>💡 Giải pháp</Text>

            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="refresh" size={20} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Thử lại</Text>
                <Text style={styles.solutionDesc}>Kiểm tra lại thông tin và thử thanh toán lại</Text>
              </View>
            </View>

            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="card" size={20} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Đổi phương thức khác</Text>
                <Text style={styles.solutionDesc}>Thử thanh toán bằng phương thức khác</Text>
              </View>
            </View>

            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="call" size={20} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Liên hệ hỗ trợ</Text>
                <Text style={styles.solutionDesc}>Gọi hotline 1900-xxxx để được hỗ trợ</Text>
              </View>
            </View>
          </View>

          {/* Warning Box */}
          <View style={[styles.warningBox, { borderColor: color + "22", backgroundColor: color + "10" }]}>
            <Ionicons name="warning" size={20} color={color} />
            <Text style={[styles.warningText, { color }]}>
              Đơn hàng của bạn chưa được xác nhận. Nếu bạn đã thanh toán thành công,
              vui lòng liên hệ với chúng tôi để được hỗ trợ.
            </Text>
          </View>

          {/* Contact Support */}
          <Pressable style={styles.supportCard} onPress={() => {}}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset" size={28} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Cần hỗ trợ?</Text>
              <Text style={styles.supportDesc}>Liên hệ với chúng tôi qua hotline hoặc email</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.gray} />
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.replace("MainTabs")}
        >
          <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: color }]}
          onPress={() => {
            // Retry -> quay về chọn phương thức, giữ nguyên data
            navigation.replace("PaymentMethodScreen", {
              id: tourId,
              total,
              amountText,
              orderId,
            });
          }}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.white} />
          <Text style={styles.primaryBtnText}>Thử lại</Text>
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
  errorText: { fontWeight: "800" },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  solutionsCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  solutionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  solutionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  solutionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  solutionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  solutionDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 18,
  },

  warningBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },

  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
  },
  supportDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },

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
    flexDirection: "row",
    gap: theme.spacing.xs,
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
