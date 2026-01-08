import React, { useEffect, useState } from "react";
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
import theme from "../../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import SuccessTick from "../../../../../components/SuccessTick";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string;
  orderId?: string;
};

export default function BankTransferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params: RouteParams = route?.params ?? {};
  const { id: tourId, amountText, orderId } = params;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Success Icon */}
        <SuccessTick color={theme.colors.primary || "#10B981"} />

        {/* Title */}
        <Text style={styles.title}>Đã ghi nhận yêu cầu</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã chọn phương thức chuyển khoản ngân hàng
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
            <Text style={styles.infoLabel}>Số tiền cần chuyển</Text>
            <Text style={[styles.infoValue, styles.amountHighlight]}>
              {amountText}
            </Text>
          </View>
        </View>

        {/* Bank Info Reminder */}
        <View style={styles.bankInfoCard}>
          <Text style={styles.bankInfoTitle}>Thông tin chuyển khoản</Text>
          
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Ngân hàng:</Text>
            <Text style={styles.bankValue}>Vietcombank</Text>
          </View>

          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Số tài khoản:</Text>
            <Text style={styles.bankValue}>1234567890</Text>
          </View>

          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Chủ TK:</Text>
            <Text style={styles.bankValue}>CÔNG TY DU LỊCH HV TRAVEL</Text>
          </View>

          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Nội dung:</Text>
            <Text style={[styles.bankValue, styles.contentHighlight]}>
              {orderId} DAT VE
            </Text>
          </View>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Ionicons name="time-outline" size={22} color="#F59E0B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
            <Text style={styles.warningText}>
              • Vui lòng hoàn tất chuyển khoản trong vòng <Text style={styles.bold}>24 giờ</Text>
              {"\n"}• Ghi đúng nội dung chuyển khoản để xác nhận nhanh
              {"\n"}• Hệ thống sẽ tự động xác nhận sau <Text style={styles.bold}>1-2 giờ</Text>
              {"\n"}• Bạn sẽ nhận thông báo qua email và app
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Các bước tiếp theo</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Chuyển khoản theo thông tin trên
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Chụp ảnh/lưu biên lai giao dịch
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Chờ xác nhận từ hệ thống (1-2 giờ)
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              Nhận xác nhận và thông tin tour qua email
            </Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.supportBox}>
          <Ionicons
            name="headset-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.supportText}>
            Cần hỗ trợ? Liên hệ: <Text style={styles.supportPhone}>1900 1234</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.replace("MyBookingScreen")}
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
    backgroundColor: "#D1FAE5",
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

  bankInfoCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  bankInfoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: theme.spacing.md,
  },
  bankRow: {
    marginBottom: theme.spacing.sm,
  },
  bankLabel: {
    fontSize: theme.fontSize.sm,
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 2,
  },
  bankValue: {
    fontSize: theme.fontSize.md,
    color: "#78350F",
    fontWeight: "700",
  },
  contentHighlight: {
    color: "#F59E0B",
    fontSize: theme.fontSize.lg,
  },

  warningBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: "#FFF7ED",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: "#92400E",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "800",
  },

  stepsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },

  supportBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    justifyContent: "center",
  },
  supportText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
  },
  supportPhone: {
    color: theme.colors.primary,
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