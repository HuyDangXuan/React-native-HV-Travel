import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PaymentFailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const reason = route.params?.reason || "unknown";
  const method = route.params?.method || "Unknown";
  const orderId = route.params?.orderId || "DL" + Date.now();
  const amount = route.params?.amount || "40.500.000đ";

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Error icon animation with shake
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
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
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="close" size={80} color={theme.colors.white} />
          </View>
          <View style={styles.iconRing} />
        </Animated.View>

        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {/* Error Message */}
          <Text style={styles.title}>{failureInfo.title}</Text>
          <Text style={styles.subtitle}>{failureInfo.message}</Text>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <DetailRow
              icon="receipt-outline"
              label="Mã đơn hàng"
              value={orderId}
            />
            <Divider />
            <DetailRow
              icon="cash-outline"
              label="Số tiền"
              value={amount}
            />
            <Divider />
            <DetailRow
              icon="card-outline"
              label="Phương thức"
              value={method}
            />
            <Divider />
            <DetailRow
              icon="time-outline"
              label="Thời gian"
              value={new Date().toLocaleString("vi-VN")}
            />
            <Divider />
            <DetailRow
              icon={failureInfo.icon}
              label="Lý do"
              value={failureInfo.title}
              valueStyle={styles.errorText}
            />
          </View>

          {/* Common Solutions */}
          <View style={styles.solutionsCard}>
            <Text style={styles.solutionsTitle}>💡 Giải pháp</Text>
            
            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="refresh" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Thử lại</Text>
                <Text style={styles.solutionDesc}>
                  Kiểm tra lại thông tin và thử thanh toán lại
                </Text>
              </View>
            </View>

            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="card" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Đổi phương thức khác</Text>
                <Text style={styles.solutionDesc}>
                  Thử thanh toán bằng phương thức khác
                </Text>
              </View>
            </View>

            <View style={styles.solutionItem}>
              <View style={styles.solutionIcon}>
                <Ionicons name="call" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.solutionTitle}>Liên hệ hỗ trợ</Text>
                <Text style={styles.solutionDesc}>
                  Gọi hotline 1900-xxxx để được hỗ trợ
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Box */}
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.warningText}>
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
              <Text style={styles.supportDesc}>
                Liên hệ với chúng tôi qua hotline hoặc email
              </Text>
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
          onPress={() => {
            // Go back to home
            navigation.replace("HomeScreen");
          }}
        >
          <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
        </Pressable>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            // Retry payment - go back to payment method selection
            navigation.replace("PaymentMethodScreen", { amount, orderId });
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
  valueStyle,
}: {
  icon: any;
  label: string;
  value: string;
  valueStyle?: any;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color="#DC2626" />
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

  content: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },

  // Error Icon
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
    backgroundColor: "#DC2626",
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
    borderColor: "#DC2626",
    opacity: 0.3,
  },

  contentWrapper: {
    width: "100%",
  },

  // Title
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

  // Details Card
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
  errorText: {
    color: "#DC2626",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  // Solutions
  solutionsCard: {
    backgroundColor: "#FEF2F2",
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

  // Warning Box
  warningBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#FEF2F2",
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: "#991B1B",
    lineHeight: 20,
  },

  // Support Card
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
    flex: 2,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: "#DC2626",
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