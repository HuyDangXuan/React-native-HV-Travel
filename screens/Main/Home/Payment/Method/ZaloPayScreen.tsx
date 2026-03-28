import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

export default function ZaloPayScreen() {
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
      accent: "#0ea5e9",
      accentSoft: "#0ea5e914",
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

  const amountText = useMemo(
    () => params?.amountText || formatVND(locale, total),
    [locale, params?.amountText, total]
  );

  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.replace("PaymentFailedScreen", {
            reason: "timeout",
            method: "ZaloPay",
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
  }, [amountText, navigation, orderId, total, tourId]);

  const createdAt = useMemo(
    () => new Date().toLocaleString(locale === "vi" ? "vi-VN" : "en-US"),
    [locale]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenZaloPayApp = () => {
    console.log("Opening ZaloPay app...");
  };

  const handleCheckPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      navigation.replace("PaymentSuccessScreen", {
        method: "ZaloPay",
        orderId,
        id: tourId,
        total,
        amountText,
      });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.screenBackground} />

      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={ui.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>{t("paymentFlow.zalopay.title")}</Text>
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
          <Text style={styles.sectionTitle}>{t("paymentFlow.zalopay.qrTitle")}</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={120} color={ui.icon} />
            </View>
            <Text style={styles.qrHint}>{t("paymentFlow.zalopay.qrHint")}</Text>
          </View>
        </View>

        <View style={styles.orDivider}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t("paymentFlow.common.or")}</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.quickActionBtn} onPress={handleOpenZaloPayApp}>
          <View style={styles.quickActionIcon}>
            <Ionicons name="phone-portrait-outline" size={32} color={ui.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>{t("paymentFlow.zalopay.openAppTitle")}</Text>
            <Text style={styles.quickActionDesc}>{t("paymentFlow.zalopay.openAppDescription")}</Text>
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
            icon="wallet-outline"
            label={t("paymentFlow.common.methodLabel")}
            value={t("paymentFlow.zalopay.methodValue")}
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
          <Text style={styles.instructionTitle}>{t("paymentFlow.zalopay.instructionTitle")}</Text>
          <Step n={1} text={t("paymentFlow.zalopay.step1")} color={ui.accent} styles={styles} />
          <Step n={2} text={t("paymentFlow.zalopay.step2")} color={ui.accent} styles={styles} />
          <Step n={3} text={t("paymentFlow.zalopay.step3")} color={ui.accent} styles={styles} />
          <Step n={4} text={t("paymentFlow.zalopay.step4")} color={ui.accent} styles={styles} />
          <Step n={5} text={t("paymentFlow.zalopay.step5")} color={ui.accent} styles={styles} />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color={ui.accent} />
          <Text style={styles.noteText}>{t("paymentFlow.zalopay.note")}</Text>
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
  icon: keyof typeof Ionicons.glyphMap;
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
      backgroundColor: ui.screenSurface,
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
      gap: 6,
      backgroundColor: ui.accentSoft,
      borderRadius: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    timerText: { fontSize: 14, color: ui.textSecondary, fontWeight: "600" },
    timerValue: { fontSize: 16, fontWeight: "800", color: ui.accent },
    amountBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: ui.border,
      gap: 6,
      ...ui.shadow,
    },
    amountLabel: { fontSize: 13, color: ui.textSecondary, fontWeight: "700" },
    amountValue: { fontSize: 28, fontWeight: "800", color: ui.accent },
    subInfo: { fontSize: 12, color: ui.textSecondary, fontWeight: "600" },
    qrSection: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: ui.textPrimary, marginBottom: 12 },
    qrBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: ui.border,
      padding: 20,
      alignItems: "center",
      ...ui.shadow,
    },
    qrPlaceholder: {
      width: 220,
      height: 220,
      borderRadius: 20,
      backgroundColor: ui.screenMutedSurface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    qrHint: { fontSize: 14, color: ui.textSecondary, textAlign: "center" },
    orDivider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginVertical: 16,
    },
    line: { flex: 1, height: 1, backgroundColor: ui.border },
    orText: { fontSize: 12, fontWeight: "800", color: ui.textSecondary },
    quickActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: ui.screenSurface,
      borderWidth: 1,
      borderColor: ui.border,
      marginBottom: 16,
    },
    quickActionIcon: {
      width: 54,
      height: 54,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.accentSoft,
    },
    quickActionTitle: { fontSize: 16, fontWeight: "700", color: ui.textPrimary },
    quickActionDesc: { fontSize: 14, color: ui.textSecondary, marginTop: 2 },
    infoBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: ui.border,
      padding: 16,
      marginBottom: 16,
    },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoLabel: { fontSize: 13, color: ui.textSecondary, fontWeight: "700" },
    infoValue: { fontSize: 15, color: ui.textPrimary, fontWeight: "700", marginTop: 2 },
    divider: { height: 1, backgroundColor: ui.border, marginVertical: 14 },
    instructionBox: {
      backgroundColor: ui.screenSurface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: ui.border,
      padding: 16,
      marginBottom: 16,
    },
    instructionTitle: { fontSize: 16, fontWeight: "800", color: ui.textPrimary, marginBottom: 12 },
    stepRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: { color: ui.white, fontSize: 13, fontWeight: "800" },
    stepText: { flex: 1, fontSize: 14, lineHeight: 20, color: ui.textSecondary },
    noteBox: {
      flexDirection: "row",
      gap: 10,
      padding: 16,
      borderRadius: 18,
      backgroundColor: ui.accentSoft,
    },
    noteText: { flex: 1, fontSize: 14, lineHeight: 20, color: ui.textSecondary },
    bottomBar: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
      backgroundColor: ui.screenSurface,
      borderTopWidth: 1,
      borderTopColor: ui.border,
    },
    secondaryBtn: {
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.screenMutedSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: { fontSize: 15, fontWeight: "700", color: ui.textPrimary },
    primaryBtn: {
      height: 52,
      borderRadius: 16,
      backgroundColor: ui.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: { fontSize: 15, fontWeight: "800", color: ui.white },
  });
