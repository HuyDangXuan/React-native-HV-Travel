import { SafeAreaView } from "react-native-safe-area-context";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../context/ThemeModeContext";
import { BookingService } from "../../../../services/BookingService";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";

type Method = {
  id: "zalopay" | "vnpay" | "momo" | "bank" | "cash";
  nameKey: string;
  descriptionKey: string;
  logoSource?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
};

const PAYMENT_LOGOS = {
  zalopay: require("./assets/zalopay.png"),
  vnpay: require("./assets/vnpay.png"),
  momo: require("./assets/momo.png"),
} satisfies Record<"zalopay" | "vnpay" | "momo", ImageSourcePropType>;

const METHODS: Method[] = [
  {
    id: "zalopay",
    nameKey: "paymentMethod.methods.zalopayName",
    descriptionKey: "paymentMethod.methods.zalopayDescription",
    logoSource: PAYMENT_LOGOS.zalopay,
  },
  {
    id: "vnpay",
    nameKey: "paymentMethod.methods.vnpayName",
    descriptionKey: "paymentMethod.methods.vnpayDescription",
    logoSource: PAYMENT_LOGOS.vnpay,
  },
  {
    id: "momo",
    nameKey: "paymentMethod.methods.momoName",
    descriptionKey: "paymentMethod.methods.momoDescription",
    logoSource: PAYMENT_LOGOS.momo,
  },
  {
    id: "bank",
    nameKey: "paymentMethod.methods.bankName",
    descriptionKey: "paymentMethod.methods.bankDescription",
    icon: "swap-horizontal-outline",
  },
  {
    id: "cash",
    nameKey: "paymentMethod.methods.cashName",
    descriptionKey: "paymentMethod.methods.cashDescription",
    icon: "cash-outline",
  },
];

type RouteParams = {
  id?: string;
  total?: number;
  adults?: number;
  children?: number;
  infants?: number;
  orderId?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    selectedDate: string;
  };
};

function getCurrencyLocale(locale: string) {
  return locale === "vi" ? "vi-VN" : "en-US";
}

export default function PaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();

  const [showBankModal, setShowBankModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      elevated: appTheme.semantic.screenElevated,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
      overlay: appTheme.colors.overlay,
      warningSurface:
        themeName === "dark" ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.16)",
      warningText: themeName === "dark" ? "#fcd34d" : "#92400e",
      infoSurface:
        themeName === "dark" ? "rgba(37, 99, 235, 0.18)" : "rgba(59, 130, 246, 0.12)",
      infoText: themeName === "dark" ? "#93c5fd" : "#1d4ed8",
    }),
    [appTheme, themeName]
  );
  const styles = useMemo(() => createStyles(appTheme, ui), [appTheme, ui]);

  const params: RouteParams = route?.params ?? {};
  const tourId = params?.id;
  const total = typeof params?.total === "number" ? params.total : 0;
  const currencyLocale = useMemo(() => getCurrencyLocale(locale), [locale]);

  const orderId = useMemo(() => params?.orderId || `DL${Date.now()}`, [params?.orderId]);
  const amountText = useMemo(
    () =>
      new Intl.NumberFormat(currencyLocale, {
        style: "currency",
        currency: "VND",
      }).format(Number.isFinite(total) ? total : 0),
    [currencyLocale, total]
  );

  const generatePassengers = () => {
    const passengers: any[] = [];
    const contactName = params?.contactInfo?.name || "Adult 1";

    const adultsCount = params?.adults || 1;
    for (let i = 0; i < adultsCount; i++) {
      passengers.push({
        type: "Adult",
        fullName: i === 0 ? contactName : `Adult ${i + 1}`,
        birthDate: null,
        gender: null,
        passportNumber: null,
      });
    }

    const childrenCount = params?.children || 0;
    for (let i = 0; i < childrenCount; i++) {
      passengers.push({
        type: "Child",
        fullName: `Child ${i + 1}`,
        birthDate: null,
        gender: null,
        passportNumber: null,
      });
    }

    const infantsCount = params?.infants || 0;
    for (let i = 0; i < infantsCount; i++) {
      passengers.push({
        type: "Infant",
        fullName: `Infant ${i + 1}`,
        birthDate: null,
        gender: null,
        passportNumber: null,
      });
    }

    return passengers;
  };

  const processBookingAndNavigate = async (methodId: string) => {
    if (!token) {
      MessageBoxService.error(
        t("paymentMethod.errors.authTitle"),
        t("paymentMethod.errors.authMessage"),
        t("common.ok")
      );
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        tourId: tourId || "",
        passengers: generatePassengers(),
        contactInfo: {
          name: params?.contactInfo?.name || "",
          email: params?.contactInfo?.email || "",
          phone: params?.contactInfo?.phone || "",
          selectedDate: params?.contactInfo?.selectedDate || "",
        },
        adultCount: params?.adults || 0,
        childCount: params?.children || 0,
        infantCount: params?.infants || 0,
        notes: params?.contactInfo?.notes || "",
      };

      const booking = await BookingService.createBooking(token, bookingData);
      if (!booking) {
        MessageBoxService.error(
          t("paymentMethod.errors.bookingTitle"),
          t("paymentMethod.errors.bookingMessage"),
          t("common.ok")
        );
        return;
      }

      const newOrderId = booking.bookingCode || orderId;
      navigation.navigate("PaymentSuccessScreen", {
        id: tourId,
        total,
        amountText,
        orderId: newOrderId,
        method: methodId,
      });
    } catch (error: any) {
      console.log("Create booking error:", error);
      MessageBoxService.error(
        t("paymentMethod.errors.connectionTitle"),
        error?.message || t("paymentMethod.errors.connectionMessage"),
        t("common.ok")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodPress = (method: Method) => {
    switch (method.id) {
      case "zalopay":
        processBookingAndNavigate("ZaloPay");
        break;
      case "vnpay":
        processBookingAndNavigate("VNPay");
        break;
      case "momo":
        processBookingAndNavigate("MoMo");
        break;
      case "bank":
        setShowBankModal(true);
        break;
      case "cash":
        setShowCashModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.bg} />
      <LoadingOverlay visible={isLoading} />

      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={ui.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>{t("paymentMethod.title")}</Text>

        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t("paymentMethod.selectTitle")}</Text>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t("paymentMethod.totalLabel")}</Text>
          <Text style={styles.amountValue}>{amountText}</Text>
          {!!tourId && <Text style={styles.subInfo}>{t("paymentMethod.tourCode", { code: tourId })}</Text>}
          <Text style={styles.subInfo}>{t("paymentMethod.orderCode", { code: orderId })}</Text>
        </View>

        {METHODS.map((method) => (
          <Pressable
            key={method.id}
            style={styles.methodCard}
            onPress={() => handleMethodPress(method)}
            android_ripple={{ color: ui.overlay }}
          >
            <View style={styles.methodLeft}>
              <View style={styles.logoBox}>
                {method.logoSource ? (
                  <Image source={method.logoSource} style={styles.logoImage} resizeMode="contain" />
                ) : (
                  <Ionicons name={method.icon || "wallet-outline"} size={28} color={ui.primary} />
                )}
              </View>

              <View style={styles.methodTextWrap}>
                <Text style={styles.methodText}>{t(method.nameKey)}</Text>
                <Text style={styles.methodDesc}>{t(method.descriptionKey)}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={22} color={ui.textSecondary} />
          </Pressable>
        ))}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color={ui.primary} />
          <Text style={styles.noteText}>{t("paymentMethod.note")}</Text>
        </View>
      </ScrollView>

      <Modal visible={showBankModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowBankModal(false)} />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("paymentMethod.bankModal.title")}</Text>
              <Pressable onPress={() => setShowBankModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={ui.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.bankInfo}>
                <InfoRow
                  label={t("paymentMethod.bankModal.bankLabel")}
                  value={t("paymentMethod.bankModal.bankValue")}
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.bankModal.accountNumber")}
                  value="1234567890"
                  copyable
                  styles={styles}
                  ui={ui}
                />
                <InfoRow
                  label={t("paymentMethod.bankModal.accountHolder")}
                  value={t("paymentMethod.bankModal.accountHolderValue")}
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.bankModal.amount")}
                  value={amountText}
                  highlight
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.bankModal.content")}
                  value={`${orderId} DAT VE`}
                  copyable
                  styles={styles}
                  ui={ui}
                />
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color={ui.warningText} />
                <Text style={styles.warningText}>{t("paymentMethod.bankModal.warning")}</Text>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>{t("paymentMethod.bankModal.instructionTitle")}</Text>
                <Text style={styles.instructionText}>{t("paymentMethod.bankModal.instructionSteps")}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setShowBankModal(false);
                  processBookingAndNavigate("Bank");
                }}
              >
                <Text style={styles.modalBtnText}>{t("paymentMethod.bankModal.continue")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCashModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCashModal(false)} />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("paymentMethod.cashModal.title")}</Text>
              <Pressable onPress={() => setShowCashModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={ui.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.bankInfo}>
                <InfoRow
                  label={t("paymentMethod.cashModal.method")}
                  value={t("paymentMethod.cashModal.methodValue")}
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.cashModal.amount")}
                  value={amountText}
                  highlight
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.cashModal.orderCode")}
                  value={orderId}
                  copyable
                  styles={styles}
                  ui={ui}
                />
                {!!tourId && (
                  <InfoRow
                    label={t("paymentMethod.cashModal.tourCode")}
                    value={tourId}
                    copyable
                    styles={styles}
                    ui={ui}
                  />
                )}
                <InfoRow
                  label={t("paymentMethod.cashModal.officeAddress")}
                  value={t("paymentMethod.cashModal.officeAddressValue")}
                  copyable
                  styles={styles}
                  ui={ui}
                />
                <InfoRow
                  label={t("paymentMethod.cashModal.officeHours")}
                  value={t("paymentMethod.cashModal.officeHoursValue")}
                  styles={styles}
                />
                <InfoRow
                  label={t("paymentMethod.cashModal.hotline")}
                  value={t("paymentMethod.cashModal.hotlineValue")}
                  copyable
                  styles={styles}
                  ui={ui}
                />
              </View>

              <View style={styles.warningBoxCash}>
                <Ionicons name="information-circle-outline" size={20} color={ui.infoText} />
                <Text style={styles.warningTextCash}>{t("paymentMethod.cashModal.warning")}</Text>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>{t("paymentMethod.cashModal.instructionTitle")}</Text>
                <Text style={styles.instructionText}>{t("paymentMethod.cashModal.instructionSteps")}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalBtn}
                onPress={() => {
                  setShowCashModal(false);
                  processBookingAndNavigate("Cash");
                }}
              >
                <Text style={styles.modalBtnText}>{t("paymentMethod.cashModal.continue")}</Text>
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
  styles,
  ui,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
  styles: ReturnType<typeof createStyles>;
  ui?: { primary: string };
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>

        {copyable && ui ? (
          <Pressable
            style={styles.copyBtn}
            onPress={() => {
              console.log("Copied:", value);
            }}
          >
            <Ionicons name="copy-outline" size={16} color={ui.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(
  appTheme: ReturnType<typeof useAppTheme>,
  ui: {
    bg: string;
    surface: string;
    mutedSurface: string;
    elevated: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    primary: string;
    onPrimary: string;
    overlay: string;
    warningSurface: string;
    warningText: string;
    infoSurface: string;
    infoText: string;
  }
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: ui.bg,
    },
    header: {
      height: 56,
      paddingHorizontal: appTheme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: ui.bg,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    headerIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...appTheme.typography.pageTitle,
      color: ui.textPrimary,
    },
    content: {
      padding: appTheme.spacing.md,
      paddingBottom: appTheme.spacing.xl,
    },
    sectionTitle: {
      ...appTheme.typography.sectionTitle,
      color: ui.textPrimary,
      marginBottom: appTheme.spacing.md,
    },
    amountCard: {
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.xl,
      padding: appTheme.spacing.lg,
      alignItems: "center",
      marginBottom: appTheme.spacing.lg,
      borderWidth: 1,
      borderColor: ui.border,
      gap: 6,
      ...appTheme.shadow.sm,
    },
    amountLabel: {
      ...appTheme.typography.label,
      color: ui.textSecondary,
    },
    amountValue: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800",
      color: ui.primary,
    },
    subInfo: {
      ...appTheme.typography.label,
      color: ui.textSecondary,
    },
    methodCard: {
      minHeight: 80,
      borderRadius: appTheme.radius.lg,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.surface,
      paddingHorizontal: appTheme.spacing.md,
      paddingVertical: appTheme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
      marginBottom: appTheme.spacing.md,
    },
    methodLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: appTheme.spacing.md,
      flex: 1,
    },
    logoBox: {
      width: 54,
      height: 54,
      borderRadius: appTheme.radius.md,
      backgroundColor: ui.mutedSurface,
      alignItems: "center",
      justifyContent: "center",
      padding: appTheme.spacing.xs,
    },
    logoImage: {
      width: "100%",
      height: "100%",
      borderRadius: appTheme.radius.sm,
    },
    methodTextWrap: {
      flex: 1,
    },
    methodText: {
      fontSize: appTheme.fontSize.md,
      lineHeight: 22,
      color: ui.textPrimary,
      fontWeight: "700",
    },
    methodDesc: {
      ...appTheme.typography.body,
      color: ui.textSecondary,
      marginTop: 2,
    },
    note: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.spacing.md,
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.lg,
      marginTop: appTheme.spacing.md,
      borderWidth: 1,
      borderColor: ui.border,
    },
    noteText: {
      flex: 1,
      ...appTheme.typography.body,
      color: ui.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: ui.overlay,
    },
    modalContent: {
      backgroundColor: ui.surface,
      borderTopLeftRadius: appTheme.radius.xl,
      borderTopRightRadius: appTheme.radius.xl,
      maxHeight: "90%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: appTheme.spacing.lg,
      paddingVertical: appTheme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    modalTitle: {
      fontSize: appTheme.fontSize.lg,
      lineHeight: 24,
      fontWeight: "700",
      color: ui.textPrimary,
    },
    modalBody: {
      padding: appTheme.spacing.lg,
    },
    modalFooter: {
      paddingHorizontal: appTheme.spacing.lg,
      paddingVertical: appTheme.spacing.md,
      paddingBottom: 34,
      borderTopWidth: 1,
      borderTopColor: ui.border,
    },
    modalBtn: {
      height: 54,
      borderRadius: appTheme.radius.lg,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    modalBtnText: {
      color: ui.onPrimary,
      fontSize: appTheme.fontSize.md,
      fontWeight: "700",
    },
    bankInfo: {
      backgroundColor: ui.mutedSurface,
      borderRadius: appTheme.radius.lg,
      padding: appTheme.spacing.md,
      gap: appTheme.spacing.md,
      marginBottom: appTheme.spacing.lg,
    },
    infoRow: {
      gap: 4,
    },
    infoLabel: {
      fontSize: appTheme.fontSize.sm,
      lineHeight: 20,
      color: ui.textSecondary,
      fontWeight: "600",
    },
    infoValueWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: appTheme.spacing.sm,
    },
    infoValue: {
      fontSize: appTheme.fontSize.md,
      lineHeight: 22,
      color: ui.textPrimary,
      fontWeight: "700",
      flex: 1,
    },
    infoValueHighlight: {
      color: ui.primary,
      fontSize: appTheme.fontSize.lg,
      lineHeight: 24,
    },
    copyBtn: {
      padding: appTheme.spacing.xs,
    },
    warningBox: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.spacing.md,
      backgroundColor: ui.warningSurface,
      borderRadius: appTheme.radius.lg,
      marginBottom: appTheme.spacing.lg,
    },
    warningText: {
      flex: 1,
      ...appTheme.typography.body,
      color: ui.warningText,
    },
    instructionBox: {
      padding: appTheme.spacing.md,
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.lg,
      borderWidth: 1,
      borderColor: ui.border,
    },
    instructionTitle: {
      fontSize: appTheme.fontSize.md,
      lineHeight: 22,
      fontWeight: "700",
      color: ui.textPrimary,
      marginBottom: appTheme.spacing.sm,
    },
    instructionText: {
      ...appTheme.typography.body,
      color: ui.textSecondary,
    },
    warningBoxCash: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.spacing.md,
      backgroundColor: ui.infoSurface,
      borderRadius: appTheme.radius.lg,
      marginBottom: appTheme.spacing.lg,
    },
    warningTextCash: {
      flex: 1,
      ...appTheme.typography.body,
      color: ui.infoText,
    },
  });
}
