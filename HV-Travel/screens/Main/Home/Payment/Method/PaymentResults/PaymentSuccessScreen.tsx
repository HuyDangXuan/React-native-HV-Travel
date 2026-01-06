import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const method = route.params?.method || "Unknown";
  const orderId = route.params?.orderId || "DL" + Date.now();
  const amount = route.params?.amount || "40.500.000đ";
  const transactionId = route.params?.transactionId || "TX" + Date.now();

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success icon animation
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

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getMethodColor = () => {
    switch (method.toLowerCase()) {
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
    switch (method.toLowerCase()) {
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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: shakeAnim },
              ],
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: getMethodColor() }]}>
            <Ionicons name="checkmark" size={80} color={theme.colors.white} />
          </View>
          <View style={[styles.iconRing, { borderColor: getMethodColor() }]} />
        </Animated.View>

        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {/* Success Message */}
          <Text style={styles.title}>Thanh toán thành công!</Text>
          <Text style={styles.subtitle}>
            Đơn hàng của bạn đã được xác nhận và đang được xử lý
          </Text>

          {/* Amount */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Số tiền đã thanh toán</Text>
            <Text style={[styles.amountValue, { color: getMethodColor() }]}>{amount}</Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <DetailRow
              icon="receipt-outline"
              label="Mã đơn hàng"
              value={orderId}
              iconColor={getMethodColor()}
            />
            <Divider />
            <DetailRow
              icon="card-outline"
              label="Mã giao dịch"
              value={transactionId}
              iconColor={getMethodColor()}
            />
            <Divider />
            <DetailRow
              icon={getMethodIcon()}
              label="Phương thức"
              value={method}
              iconColor={getMethodColor()}
            />
            <Divider />
            <DetailRow
              icon="time-outline"
              label="Thời gian"
              value={new Date().toLocaleString("vi-VN")}
              iconColor={getMethodColor()}
            />
            <Divider />
            <DetailRow
              icon="shield-checkmark-outline"
              label="Trạng thái"
              value="Đã xác nhận"
              iconColor={getMethodColor()}
              valueStyle={styles.successText}
            />
          </View>

          {/* Next Steps */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Các bước tiếp theo</Text>
            
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: getMethodColor() }]}>
                <Ionicons name="mail" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>
                Email xác nhận đã được gửi đến hộp thư của bạn
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: getMethodColor() }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>
                Kiểm tra lịch trình chi tiết trong mục "Đơn hàng của tôi"
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: getMethodColor() }]}>
                <Ionicons name="headset" size={20} color={theme.colors.white} />
              </View>
              <Text style={styles.stepText}>
                Liên hệ hotline 1900-xxxx nếu cần hỗ trợ
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: getMethodColor() + "15" }]}>
            <Ionicons name="information-circle" size={20} color={getMethodColor()} />
            <Text style={[styles.infoText, { color: getMethodColor() }]}>
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
          style={[styles.secondaryBtn, { borderColor: getMethodColor() }]}
          onPress={() => {
            // Navigate to order details
            // navigation.navigate("OrderDetails", { orderId });
          }}
        >
          <Text style={[styles.secondaryBtnText, { color: getMethodColor() }]}>
            Xem chi tiết
          </Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: getMethodColor() }]}
          onPress={() => {
            // Navigate to home
            navigation.replace("MainTabs");
          }}
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

  content: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },

  // Success Icon
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

  // Amount
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
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
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
  successText: {
    color: "#059669",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  // Steps
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

  // Info Box
  infoBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
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
  secondaryBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});