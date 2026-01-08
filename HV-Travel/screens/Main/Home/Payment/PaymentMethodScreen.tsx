import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";

type Method = {
  id: string;
  name: string;
  logo?: string;
  icon?: string;
  description?: string;
};

const METHODS: Method[] = [
  {
    id: "zalopay",
    name: "ZaloPay",
    logo:
      "https://cdn.brandfetch.io/id_T-oXJkN/w/820/h/184/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
    description: "Thanh toán nhanh qua ví ZaloPay",
  },
  {
    id: "vnpay",
    name: "VNPay",
    logo:
      "https://cdn.brandfetch.io/idV02t6WJs/w/820/h/249/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
    description: "Thanh toán qua VNPay QR",
  },
  {
    id: "momo",
    name: "MoMo",
    logo:
      "https://cdn.brandfetch.io/idn4xaCzTm/w/180/h/180/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B",
    description: "Thanh toán qua ví MoMo",
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    icon: "card-outline",
    description: "Chuyển khoản vào tài khoản công ty",
  },
  {
    id: "cash",
    name: "Tiền mặt",
    icon: "cash-outline",
    description: "Thanh toán tiền mặt tại văn phòng",
  },
];

type RouteParams = {
  id?: string;
  total?: number; // bạn truyền từ BookingScreen
  orderId?: string;
};

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number.isFinite(v) ? v : 0
  );

export default function PaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);


  const params: RouteParams = route?.params ?? {};
  const tourId = params?.id;

  // total là NUMBER
  const total: number = typeof params?.total === "number" ? params.total : 0;

  // orderId: nếu không truyền thì tự gen
  const orderId = useMemo(() => {
    return params?.orderId || "DL" + Date.now();
  }, [params?.orderId]);

  // text hiển thị
  const amountText = useMemo(() => formatVND(total), [total]);

  const handleMethodPress = (method: Method) => {
    const paymentParams = {
      id: tourId,
      total,       // number
      amountText,  // string để hiển thị
      orderId,
    };

    switch (method.id) {
      case "zalopay":
        navigation.navigate("ZaloPayScreen", paymentParams);
        break;
      case "vnpay":
        navigation.navigate("VNPayScreen", paymentParams);
        break;
      case "momo":
        navigation.navigate("MoMoScreen", paymentParams);
        break;
      case "bank":
        setShowBankModal(true);
        break;
      case "cash":
        setShowCashModal(true);
        break;

      default:
        console.log("Unknown payment method:", method.id);
    }
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

        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>

        {/* spacer để title centered */}
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

        {/* Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Tổng thanh toán</Text>
          <Text style={styles.amountValue}>{amountText}</Text>
          {!!tourId && (
            <Text style={styles.subInfo}>Mã tour: {tourId}</Text>
          )}
          <Text style={styles.subInfo}>Mã đơn: {orderId}</Text>
        </View>

        {METHODS.map((m) => (
          <Pressable
            key={m.id}
            style={styles.methodCard}
            onPress={() => handleMethodPress(m)}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          >
            <View style={styles.methodLeft}>
              <View style={styles.logoBox}>
                {m.logo ? (
                  <Image
                    source={{ uri: m.logo }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={m.icon as any}
                    size={28}
                    color={theme.colors.primary}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.methodText}>{m.name}</Text>
                {!!m.description && (
                  <Text style={styles.methodDesc}>{m.description}</Text>
                )}
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color={theme.colors.gray}
            />
          </Pressable>
        ))}

        <View style={styles.note}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.noteText}>
            Vui lòng hoàn tất thanh toán trong vòng 24h để giữ chỗ. Sau thời gian
            này, đơn hàng sẽ tự động hủy.
          </Text>
        </View>
      </ScrollView>

      {/* Bank Transfer Modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowBankModal(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin chuyển khoản</Text>
              <Pressable
                onPress={() => setShowBankModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.bankInfo}>
                <InfoRow
                  label="Ngân hàng"
                  value="Vietcombank - Chi nhánh Hà Nội"
                />
                <InfoRow label="Số tài khoản" value="1234567890" copyable />
                <InfoRow
                  label="Chủ tài khoản"
                  value="CÔNG TY DU LỊCH HV TRAVEL"
                />
                <InfoRow label="Số tiền" value={amountText} highlight />
                <InfoRow
                  label="Nội dung"
                  value={`${orderId} DAT VE`}
                  copyable
                />
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Vui lòng ghi đúng nội dung chuyển khoản để chúng tôi xác nhận
                  thanh toán nhanh nhất.
                </Text>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>Hướng dẫn:</Text>
                <Text style={styles.instructionText}>
                  1. Mở ứng dụng ngân hàng{"\n"}
                  2. Chuyển khoản đến số tài khoản trên{"\n"}
                  3. Nhập đúng số tiền và nội dung{"\n"}
                  4. Chụp ảnh hoặc lưu lại biên lai{"\n"}
                  5. Chờ xác nhận từ hệ thống (1-2 giờ)
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setShowBankModal(false);
                  navigation.navigate("BankTransferScreen", {
                    id: tourId,
                    total,
                    amountText,
                    orderId,
                  });
                }}
              >
                <Text style={styles.modalBtnText}>Tiếp tục</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cash Payment Modal */}
      <Modal visible={showCashModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCashModal(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thanh toán tiền mặt</Text>
              <Pressable onPress={() => setShowCashModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.bankInfo}>
                <InfoRow label="Hình thức" value="Tiền mặt tại văn phòng" />
                <InfoRow label="Số tiền" value={amountText} highlight />
                <InfoRow label="Mã đơn" value={orderId} copyable />
                {!!tourId && <InfoRow label="Mã tour" value={tourId} copyable />}

                <InfoRow
                  label="Địa chỉ văn phòng"
                  value="Tầng 8, Tòa nhà HV Travel, 123 Trần Duy Hưng, Cầu Giấy, Hà Nội"
                  copyable
                />
                <InfoRow
                  label="Giờ làm việc"
                  value="08:00 - 17:30 (Thứ 2 - Thứ 7)"
                />
                <InfoRow
                  label="Hotline"
                  value="1900 1234"
                  copyable
                />
              </View>

              <View style={styles.warningBoxCash}>
                <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                <Text style={styles.warningTextCash}>
                  Khi đến thanh toán, bạn vui lòng cung cấp <Text style={styles.bold}>mã đơn</Text> để nhân viên xác nhận nhanh.
                  Sau khi thu tiền, hệ thống sẽ cập nhật trạng thái trong vòng <Text style={styles.bold}>15 phút</Text>.
                </Text>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>Hướng dẫn:</Text>
                <Text style={styles.instructionText}>
                  1. Đến văn phòng HV Travel trong giờ làm việc{"\n"}
                  2. Cung cấp mã đơn để đối chiếu{"\n"}
                  3. Thanh toán tiền mặt và nhận biên nhận{"\n"}
                  4. Đơn hàng được xác nhận và giữ chỗ ngay sau khi cập nhật
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setShowCashModal(false);
                  navigation.navigate("CashPaymentScreen", {
                    id: tourId,
                    total,
                    amountText,
                    orderId,
                  });
                }}
              >
                <Text style={styles.modalBtnText}>Tiếp tục</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  copyable,
  highlight,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
          {value}
        </Text>

        {copyable && (
          <Pressable
            style={styles.copyBtn}
            onPress={() => {
              // TODO: Clipboard.setStringAsync(value)
              console.log("Copied:", value);
            }}
          >
            <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
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

  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  amountLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  subInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "600",
  },

  methodCard: {
    minHeight: 80,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xs,
  },
  logoImage: { width: "100%", height: "100%" },

  methodText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "700",
  },
  methodDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: 2,
  },

  note: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 20,
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  modalBody: { padding: theme.spacing.lg },
  modalFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalBtn: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
  },

  bankInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoRow: { gap: 4 },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  infoValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "700",
    flex: 1,
  },
  infoValueHighlight: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
  },
  copyBtn: { padding: theme.spacing.xs },

  warningBox: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#FEF3C7",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: "#92400E",
    lineHeight: 20,
  },

  instructionBox: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  instructionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  instructionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 22,
  },
  warningBoxCash: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: "#DBEAFE",
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  warningTextCash: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: "#1E40AF",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "800",
    color: "#1E40AF",
  },

});
