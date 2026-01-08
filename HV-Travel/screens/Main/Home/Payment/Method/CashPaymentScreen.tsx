import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string;
  orderId?: string;
};

export default function CashPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params: RouteParams = route?.params ?? {};
  const { id: tourId, amountText, orderId } = params;

  const handleCall = () => {
    Linking.openURL("tel:19001234");
  };

  const handleOpenMap = () => {
    const address =
      "Tầng 8, Tòa nhà HV Travel, 123 Trần Duy Hưng, Cầu Giấy, Hà Nội";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="document-text"
              size={80}
              color={theme.colors.primary}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Đã ghi nhận đơn hàng</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đã ghi nhận yêu cầu thanh toán tiền mặt của bạn
        </Text>

        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>{orderId}</Text>
          </View>

          {!!tourId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã tour</Text>
              <Text style={styles.infoValue}>{tourId}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền cần thanh toán</Text>
            <Text style={[styles.infoValue, styles.amountHighlight]}>
              {amountText}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hình thức</Text>
            <Text style={styles.infoValue}>Tiền mặt tại văn phòng</Text>
          </View>
        </View>

        {/* Office Info Card */}
        <View style={styles.officeCard}>
          <View style={styles.officeHeader}>
            <Ionicons
              name="business"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.officeTitle}>Thông tin văn phòng</Text>
          </View>

          <View style={styles.officeRow}>
            <Ionicons name="location" size={20} color={theme.colors.gray} />
            <View style={styles.officeContent}>
              <Text style={styles.officeLabel}>Địa chỉ</Text>
              <Text style={styles.officeValue}>
                Tầng 8, Tòa nhà HV Travel{"\n"}
                123 Trần Duy Hưng, Cầu Giấy, Hà Nội
              </Text>
              <Pressable style={styles.mapBtn} onPress={handleOpenMap}>
                <Text style={styles.mapBtnText}>Xem bản đồ</Text>
                <Ionicons
                  name="navigate"
                  size={16}
                  color={theme.colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.officeRow}>
            <Ionicons name="time" size={20} color={theme.colors.gray} />
            <View style={styles.officeContent}>
              <Text style={styles.officeLabel}>Giờ làm việc</Text>
              <Text style={styles.officeValue}>
                08:00 - 17:30 (Thứ 2 - Thứ 7)
              </Text>
            </View>
          </View>

          <View style={styles.officeRow}>
            <Ionicons name="call" size={20} color={theme.colors.gray} />
            <View style={styles.officeContent}>
              <Text style={styles.officeLabel}>Hotline</Text>
              <Pressable onPress={handleCall}>
                <Text style={[styles.officeValue, styles.phoneLink]}>
                  1900 1234
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeBox}>
          <Ionicons
            name="information-circle"
            size={24}
            color="#2563EB"
          />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Lưu ý khi đến thanh toán</Text>
            <Text style={styles.noticeText}>
              • Mang theo <Text style={styles.bold}>mã đơn hàng</Text> để nhân viên xác nhận
              {"\n"}• Nhận biên nhận ngay sau khi thanh toán
              {"\n"}• Đơn hàng được xác nhận trong vòng <Text style={styles.bold}>15 phút</Text>
              {"\n"}• Vui lòng thanh toán trong <Text style={styles.bold}>24 giờ</Text> để giữ chỗ
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Quy trình thanh toán</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Bước 1</Text>
              <Text style={styles.timelineDesc}>
                Đến văn phòng HV Travel trong giờ làm việc
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Bước 2</Text>
              <Text style={styles.timelineDesc}>
                Cung cấp mã đơn <Text style={styles.codeInline}>{orderId}</Text> cho nhân viên
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Bước 3</Text>
              <Text style={styles.timelineDesc}>
                Thanh toán tiền mặt và nhận biên nhận
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotLast]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStep}>Hoàn tất</Text>
              <Text style={styles.timelineDesc}>
                Đơn hàng được xác nhận và bạn nhận thông tin tour qua email
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Cần hỗ trợ thêm?</Text>
          <Text style={styles.contactText}>
            Đội ngũ chăm sóc khách hàng của chúng tôi sẵn sàng hỗ trợ bạn
          </Text>
          <Pressable style={styles.contactBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color={theme.colors.white} />
            <Text style={styles.contactBtnText}>Gọi ngay: 1900 1234</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("BookingHistory")}
        >
          <Text style={styles.secondaryBtnText}>Xem đơn hàng</Text>
        </Pressable>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.primaryBtnText}>Về trang chủ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },

  iconContainer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
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
    paddingHorizontal: theme.spacing.md,
  },

  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "700",
  },
  amountHighlight: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },

  officeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  officeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  officeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  officeRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  officeContent: {
    flex: 1,
  },
  officeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
    marginBottom: 4,
  },
  officeValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
    lineHeight: 22,
  },
  phoneLink: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: theme.spacing.sm,
  },
  mapBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "700",
  },

  noticeBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: "#DBEAFE",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: theme.spacing.xs,
  },
  noticeText: {
    fontSize: theme.fontSize.sm,
    color: "#1E40AF",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "800",
  },

  timelineCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    borderWidth: 4,
    borderColor: "#DBEAFE",
  },
  timelineDotLast: {
    backgroundColor: "#10B981",
    borderColor: "#D1FAE5",
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 11,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: theme.spacing.xs,
  },
  timelineStep: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 20,
  },
  codeInline: {
    fontWeight: "700",
    color: theme.colors.primary,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  contactBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  contactText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  contactBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: 34,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  secondaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },
});