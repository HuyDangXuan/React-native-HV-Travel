import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { useI18n } from "../../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../../context/ThemeModeContext";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string;
  orderId?: string;
};

type UiTokens = {
  screenBackground: string;
  screenSurface: string;
  screenMutedSurface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentSoft: string;
  icon: string;
  white: string;
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

const formatVND = (locale: string, value: number) =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
  }).format(Number.isFinite(value) ? value : 0);

export default function VNPayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { locale, t } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();

  const ui = useMemo<UiTokens>(
    () => ({
      screenBackground: appTheme.semantic.screenBackground,
      screenSurface: appTheme.semantic.screenSurface,
      screenMutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      accent: "#DC2626",
      accentSoft: "#DC262614",
      icon: appTheme.colors.icon,
      white: appTheme.colors.white,
      shadow: appTheme.shadow.md,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

  const params: RouteParams = route?.params ?? {};
  const tourId = params?.id;
  const total = typeof params?.total === "number" ? params.total : 0;
  const orderId = params?.orderId || `DL${Date.now()}`;

  const amountText = useMemo(() => {
    return params?.amountText || formatVND(locale, total);
  }, [locale, params?.amountText, total]);

  const [timeLeft, setTimeLeft] = useState(900);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.replace("PaymentFailedScreen", {
            reason: "timeout",
            method: "VNPay",
            orderId,
            id: tourId,
            total,
            amountText,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigation, orderId, tourId, total, amountText]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenVNPayApp = () => {
    console.log("Opening VNPay app...");
  };

  const handleCheckPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      navigation.replace("PaymentFailedScreen", {
        reason: "failed",
        method: "VNPay",
        orderId,
        id: tourId,
        total,
        amountText,
      });
    }, 2000);
  };

  const createdAt = useMemo(
    () => new Date().toLocaleString(locale === "vi" ? "vi-VN" : "en-US"),
    [locale]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.screenBackground} />

      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={ui.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>{t("paymentFlow.vnpay.title")}</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={20} color={ui.accent} />
          <Text style={styles.timerText}>{t("paymentFlow.common.remainingTime")}</Text>
          <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>{t("paymentFlow.common.amountLabel")}</Text>
          <Text style={styles.amountValue}>{amountText}</Text>
          {!!tourId && <Text style={styles.subInfo}>{t("paymentFlow.common.tourCode", { code: tourId })}</Text>}
          <Text style={styles.subInfo}>{t("paymentFlow.common.orderCode", { code: orderId })}</Text>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>{t("paymentFlow.vnpay.qrTitle")}</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={ui.icon} />
            </View>
            <Text style={styles.qrHint}>{t("paymentFlow.vnpay.qrHint")}</Text>
          </View>
        </View>

        <View style={styles.orDivider}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t("paymentFlow.common.or")}</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.quickActionBtn} onPress={handleOpenVNPayApp}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="phone-portrait-outline" size={32} color={ui.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>{t("paymentFlow.vnpay.openAppTitle")}</Text>
            <Text style={styles.quickActionDesc}>{t("paymentFlow.vnpay.openAppDescription")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={ui.icon} />
        </Pressable>

        <View style={styles.infoBox}>
          <InfoRow
            icon="document-text-outline"
            label={t("paymentFlow.common.orderCodeLabel")}
            value={orderId}
            ui={ui}
            styles={styles}
          />
          <Divider styles={styles} />
          <InfoRow
            icon="card-outline"
            label={t("paymentFlow.common.methodLabel")}
            value={t("paymentFlow.vnpay.methodValue")}
            ui={ui}
            styles={styles}
          />
          <Divider styles={styles} />
          <InfoRow
            icon="time-outline"
            label={t("paymentFlow.common.createdTime")}
            value={createdAt}
            ui={ui}
            styles={styles}
          />
        </View>

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>{t("paymentFlow.vnpay.instructionTitle")}</Text>

          <Text style={styles.methodTitle}>{t("paymentFlow.vnpay.methodOneTitle")}</Text>
          <Step n={1} text={t("paymentFlow.vnpay.step1")} color={ui.accent} styles={styles} />
          <Step n={2} text={t("paymentFlow.vnpay.step2")} color={ui.accent} styles={styles} />
          <Step n={3} text={t("paymentFlow.vnpay.step3")} color={ui.accent} styles={styles} />

          <Text style={styles.methodTitle}>{t("paymentFlow.vnpay.methodTwoTitle")}</Text>
          <Step n={1} text={t("paymentFlow.vnpay.step4")} color={ui.accent} styles={styles} />
          <Step n={2} text={t("paymentFlow.vnpay.step5")} color={ui.accent} styles={styles} />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color={ui.accent} />
          <Text style={styles.noteText}>{t("paymentFlow.vnpay.note")}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>{t("paymentFlow.common.cancel")}</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { flex: 2 }]}
          onPress={handleCheckPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={ui.white} />
          ) : (
            <Text style={styles.primaryBtnText}>{t("paymentFlow.common.checkPayment")}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Step({
  n,
  text,
  color,
  styles,
}: {
  n: number;
  text: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNumber, { backgroundColor: color }]}>
        <Text style={styles.stepNumberText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  ui,
  styles,
}: {
  icon: any;
  label: string;
  value: string;
  ui: UiTokens;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={ui.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

const createStyles = (ui: UiTokens) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: ui.screenBackground },
    header: {
      height: 54,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: ui.screenBackground,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: ui.textPrimary },
    content: { padding: 16 },
    timerBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backgroundColor: ui.accentSoft,
      borderRadius: 16,
      marginBottom: 24,
      gap: 8,
    },
    timerText: { fontSize: 14, color: ui.textPrimary, fontWeight: "600" },
    timerValue: { fontSize: 18, color: ui.accent, fontWeight: "800" },
    amountBox: {
      alignItems: "center",
      padding: 24,
      backgroundColor: ui.screenSurface,
      borderRadius: 16,
      marginBottom: 24,
      gap: 6,
      shadowColor: ui.shadow.shadowColor,
      shadowOffset: ui.shadow.shadowOffset,
      shadowOpacity: ui.shadow.shadowOpacity,
      shadowRadius: ui.shadow.shadowRadius,
      elevation: ui.shadow.elevation,
    },
    amountLabel: { fontSize: 14, color: ui.textSecondary, fontWeight: "600" },
    amountValue: { fontSize: 32, fontWeight: "800", color: ui.accent },
    subInfo: { fontSize: 12, color: ui.textSecondary, fontWeight: "600" },
    quickActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: ui.screenMutedSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
      gap: 16,
      marginBottom: 24,
    },
    quickActionIcon: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: ui.screenSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionTitle: { fontSize: 16, fontWeight: "700", color: ui.textPrimary },
    quickActionDesc: { fontSize: 14, color: ui.textSecondary, marginTop: 2 },
    orDivider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
      gap: 16,
    },
    line: { flex: 1, height: 1, backgroundColor: ui.border },
    orText: { fontSize: 14, color: ui.textSecondary, fontWeight: "600" },
    qrSection: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: ui.textPrimary,
      marginBottom: 16,
      textAlign: "center",
    },
    qrBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 16,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: ui.border,
      shadowColor: ui.shadow.shadowColor,
      shadowOffset: ui.shadow.shadowOffset,
      shadowOpacity: ui.shadow.shadowOpacity,
      shadowRadius: ui.shadow.shadowRadius,
      elevation: ui.shadow.elevation,
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      backgroundColor: ui.screenMutedSurface,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    qrHint: { fontSize: 14, color: ui.textSecondary, textAlign: "center" },
    infoBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: ui.border,
      shadowColor: ui.shadow.shadowColor,
      shadowOffset: ui.shadow.shadowOffset,
      shadowOpacity: ui.shadow.shadowOpacity,
      shadowRadius: ui.shadow.shadowRadius,
      elevation: ui.shadow.elevation,
    },
    infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    infoLabel: { fontSize: 13, color: ui.textSecondary, fontWeight: "700" },
    infoValue: { marginTop: 2, fontSize: 15, color: ui.textPrimary, fontWeight: "700" },
    divider: { height: 1, backgroundColor: ui.border, marginVertical: 12 },
    instructionBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: ui.border,
    },
    instructionTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: ui.textPrimary,
      marginBottom: 12,
    },
    methodTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: ui.textPrimary,
      marginTop: 8,
      marginBottom: 10,
    },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: { color: ui.white, fontWeight: "800", fontSize: 13 },
    stepText: { flex: 1, fontSize: 14, color: ui.textPrimary, lineHeight: 21 },
    noteBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 16,
      backgroundColor: ui.screenMutedSurface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
    },
    noteText: { flex: 1, fontSize: 13, color: ui.textSecondary, lineHeight: 20 },
    bottomBar: {
      flexDirection: "row",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: ui.border,
      backgroundColor: ui.screenBackground,
    },
    secondaryBtn: {
      minHeight: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.screenSurface,
      borderWidth: 1,
      borderColor: ui.border,
    },
    secondaryBtnText: { fontSize: 15, fontWeight: "700", color: ui.textPrimary },
    primaryBtn: {
      minHeight: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.accent,
    },
    primaryBtnText: { fontSize: 15, fontWeight: "800", color: ui.white },
  });
