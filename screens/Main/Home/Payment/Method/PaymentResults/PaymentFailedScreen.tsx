import React, { useMemo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import theme from "../../../../../../config/theme";
import ResultScreenLayout, {
  ResultCard,
} from "../../../../../../components/ui/ResultScreenLayout";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string;
  amount?: string;
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

  const failureInfo = getFailureInfo(reason);

  return (
    <ResultScreenLayout
      tone="error"
      icon="close-circle-outline"
      title={failureInfo.title}
      subtitle={failureInfo.message}
      footerActions={[
        {
          label: "Về trang chủ",
          onPress: () => navigation.navigate("MainTabs"),
          variant: "secondary",
        },
        {
          label: "Thử lại",
          onPress: () =>
            navigation.navigate("PaymentMethodScreen", {
              id: tourId,
              total,
              amountText,
              orderId,
            }),
        },
      ]}
    >
      <ResultCard>
        {!!tourId ? <DetailRow icon="pricetag-outline" label="Mã tour" value={tourId} /> : null}
        {!!tourId ? <Divider /> : null}
        <DetailRow icon="receipt-outline" label="Mã đơn hàng" value={orderId} />
        <Divider />
        <DetailRow icon="cash-outline" label="Số tiền" value={amountText} />
        <Divider />
        <DetailRow icon="wallet-outline" label="Phương thức" value={method} />
        <Divider />
        <DetailRow icon="alert-circle-outline" label="Lý do" value={failureInfo.title} />
      </ResultCard>

      <ResultCard style={styles.solutionCard}>
        <Text style={styles.sectionTitle}>Giải pháp gợi ý</Text>
        <Step icon="refresh-outline" text="Kiểm tra lại thông tin và thử thanh toán lại." />
        <Step icon="card-outline" text="Thử một phương thức thanh toán khác nếu cần." />
        <Step icon="headset-outline" text="Liên hệ hotline để được hỗ trợ khi giao dịch đã bị trừ tiền." />
      </ResultCard>
    </ResultScreenLayout>
  );
}

function getFailureInfo(reason: string) {
  switch (reason) {
    case "timeout":
      return {
        title: "Hết thời gian thanh toán",
        message: "Phiên thanh toán đã hết hạn. Vui lòng thử lại với một phiên mới.",
      };
    case "insufficient_funds":
      return {
        title: "Số dư không đủ",
        message: "Tài khoản của bạn không đủ số dư để hoàn tất giao dịch.",
      };
    case "cancelled":
      return {
        title: "Đã huỷ thanh toán",
        message: "Bạn đã huỷ giao dịch trước khi hệ thống xác nhận thành công.",
      };
    case "network_error":
      return {
        title: "Lỗi kết nối",
        message: "Không thể kết nối đến cổng thanh toán. Hãy kiểm tra kết nối mạng và thử lại.",
      };
    default:
      return {
        title: "Thanh toán thất bại",
        message: "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
      };
  }
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={theme.colors.error} />
      <View style={styles.detailMeta}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function Step({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepIconWrap}>
        <Ionicons name={icon} size={18} color={theme.colors.error} />
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailMeta: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "700",
  },
  detailValue: {
    marginTop: 2,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  solutionCard: {
    backgroundColor: "#FEF2F2",
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 22,
    fontWeight: "600",
  },
});
