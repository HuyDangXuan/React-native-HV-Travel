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

  const amountText = useMemo(() => {
    if (typeof params?.amountText === "string" && params.amountText.trim()) return params.amountText;
    if (total > 0) return formatVND(total);
    if (typeof params?.amount === "string" && params.amount.trim()) return params.amount;
    return formatVND(0);
  }, [params?.amountText, params?.amount, total]);

  return (
    <ResultScreenLayout
      tone="success"
      icon="checkmark-done-outline"
      title="Thanh toán thành công"
      subtitle="Đơn hàng của bạn đã được xác nhận và đang chờ những bước chuẩn bị tiếp theo."
      footerActions={[
        {
          label: "Xem đơn hàng",
          onPress: () => {
            navigation.replace("MainTabs");
            setTimeout(() => navigation.navigate("MyBookingScreen"), 100);
          },
          variant: "secondary",
        },
        {
          label: "Về trang chủ",
          onPress: () => navigation.replace("MainTabs"),
        },
      ]}
    >
      <ResultCard>
        <Text style={styles.amountLabel}>Số tiền đã thanh toán</Text>
        <Text style={styles.amountValue}>{amountText}</Text>
      </ResultCard>

      <ResultCard>
        {!!tourId ? <DetailRow icon="pricetag-outline" label="Mã tour" value={tourId} /> : null}
        {!!tourId ? <Divider /> : null}
        <DetailRow icon="receipt-outline" label="Mã đơn hàng" value={orderId} />
        <Divider />
        <DetailRow icon="card-outline" label="Mã giao dịch" value={transactionId} />
        <Divider />
        <DetailRow icon="wallet-outline" label="Phương thức" value={method} />
        <Divider />
        <DetailRow icon="time-outline" label="Thời gian" value={new Date().toLocaleString("vi-VN")} />
      </ResultCard>

      <ResultCard>
        <Text style={styles.sectionTitle}>Các bước tiếp theo</Text>
        <Step icon="mail-outline" text="Email xác nhận đã được gửi tới hộp thư của bạn." />
        <Step icon="calendar-outline" text='Kiểm tra lịch trình trong mục "Chuyến đi đã đặt".' />
        <Step icon="headset-outline" text="Liên hệ hotline nếu bạn cần hỗ trợ trước ngày khởi hành." />
      </ResultCard>
    </ResultScreenLayout>
  );
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
      <Ionicons name={icon} size={18} color={theme.colors.success} />
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
        <Ionicons name={icon} size={18} color={theme.colors.success} />
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "700",
    textAlign: "center",
  },
  amountValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "900",
    color: theme.colors.success,
    textAlign: "center",
  },
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
    backgroundColor: "#D1FAE5",
  },
  stepText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 22,
    fontWeight: "600",
  },
});
