import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import SuccessTick from "../../../../../components/SuccessTick";
import { useI18n } from "../../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../../context/ThemeModeContext";

type RouteParams = {
  id?: string;
  amountText?: string;
  orderId?: string;
};

export default function BankTransferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useI18n();
  const theme = useAppTheme();
  const { themeName } = useThemeMode();

  const params: RouteParams = route?.params ?? {};
  const tourId = params.id;
  const amountText = params.amountText || "0 VND";
  const orderId = params.orderId || `DL${Date.now()}`;

  const ui = useMemo(
    () => ({
      bg: theme.semantic.screenBackground,
      surface: theme.semantic.screenSurface,
      muted: theme.semantic.screenMutedSurface,
      text: theme.semantic.textPrimary,
      subtext: theme.semantic.textSecondary,
      border: theme.semantic.divider,
      success: theme.colors.success,
      successSoft: `${theme.colors.success}14`,
      warnBg: themeName === "dark" ? "rgba(245, 158, 11, 0.18)" : "rgba(245, 158, 11, 0.14)",
      warnText: themeName === "dark" ? "#fcd34d" : "#92400e",
      white: theme.colors.white,
    }),
    [theme, themeName]
  );

  const styles = useMemo(() => {
    return StyleSheet.create({
      safe: {
        flex: 1,
        backgroundColor: ui.bg,
      },
      container: {
        padding: theme.spacing.lg,
        paddingBottom: 120,
      },
      title: {
        ...theme.typography.heroTitle,
        color: ui.text,
        textAlign: "center",
        marginTop: theme.spacing.lg,
      },
      subtitle: {
        ...theme.typography.body,
        color: ui.subtext,
        textAlign: "center",
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xl,
      },
      card: {
        backgroundColor: ui.surface,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: ui.border,
      },
      mutedCard: {
        backgroundColor: ui.muted,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: theme.spacing.md,
        marginBottom: theme.spacing.sm,
      },
      label: {
        fontSize: theme.fontSize.sm,
        color: ui.subtext,
        fontWeight: "600",
        flex: 1,
      },
      value: {
        fontSize: theme.fontSize.md,
        color: ui.text,
        fontWeight: "700",
        flex: 1,
        textAlign: "right",
      },
      accentValue: {
        color: ui.success,
      },
      divider: {
        height: 1,
        backgroundColor: ui.border,
        marginVertical: theme.spacing.sm,
      },
      sectionTitle: {
        ...theme.typography.sectionTitle,
        color: ui.text,
        marginBottom: theme.spacing.md,
      },
      warningBox: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: ui.warnBg,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.lg,
      },
      warningContent: {
        flex: 1,
      },
      warningTitle: {
        fontSize: theme.fontSize.md,
        color: ui.warnText,
        fontWeight: "800",
        marginBottom: 4,
      },
      warningText: {
        ...theme.typography.body,
        color: ui.warnText,
      },
      stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
      },
      stepNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ui.success,
      },
      stepNumberText: {
        color: ui.white,
        fontSize: 13,
        fontWeight: "800",
      },
      stepText: {
        flex: 1,
        ...theme.typography.body,
        color: ui.subtext,
      },
      supportBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: ui.successSoft,
      },
      supportText: {
        flex: 1,
        ...theme.typography.body,
        color: ui.subtext,
      },
      footer: {
        flexDirection: "row",
        gap: theme.spacing.sm,
        padding: theme.layout.bottomBarPadding,
        borderTopWidth: 1,
        borderTopColor: ui.border,
        backgroundColor: ui.surface,
      },
      secondaryBtn: {
        flex: 1,
        minHeight: 54,
        borderRadius: theme.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: ui.border,
        backgroundColor: ui.muted,
      },
      secondaryBtnText: {
        fontSize: theme.fontSize.md,
        fontWeight: "800",
        color: ui.text,
      },
      primaryBtn: {
        flex: 1,
        minHeight: 54,
        borderRadius: theme.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ui.success,
      },
      primaryBtnText: {
        fontSize: theme.fontSize.md,
        fontWeight: "800",
        color: ui.white,
      },
    });
  }, [theme, ui]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.bg} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SuccessTick color={ui.success} />

        <Text style={styles.title}>{t("paymentFlow.bank.title")}</Text>
        <Text style={styles.subtitle}>{t("paymentFlow.bank.subtitle")}</Text>

        <View style={styles.card}>
          <InfoRow styles={styles} label={t("paymentFlow.bank.orderCode")} value={orderId} />
          {tourId ? <InfoRow styles={styles} label={t("paymentFlow.bank.tourCode")} value={tourId} /> : null}
          <View style={styles.divider} />
          <InfoRow
            styles={styles}
            label={t("paymentFlow.bank.amount")}
            value={amountText}
            accent
          />
        </View>

        <View style={[styles.card, styles.mutedCard]}>
          <Text style={styles.sectionTitle}>{t("paymentFlow.bank.bankInfoTitle")}</Text>
          <InfoRow styles={styles} label={t("paymentFlow.bank.bankName")} value={t("paymentFlow.bank.bankNameValue")} />
          <InfoRow styles={styles} label={t("paymentFlow.bank.accountNumber")} value={t("paymentFlow.bank.accountNumberValue")} />
          <InfoRow styles={styles} label={t("paymentFlow.bank.accountHolder")} value={t("paymentFlow.bank.accountHolderValue")} />
          <InfoRow styles={styles} label={t("paymentFlow.bank.transferContent")} value={`${orderId} DAT VE`} accent />
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="time-outline" size={22} color={ui.warnText} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>{t("paymentFlow.bank.warningTitle")}</Text>
            <Text style={styles.warningText}>{t("paymentFlow.bank.warningBody")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("paymentFlow.bank.stepsTitle")}</Text>
          <Step styles={styles} n={1} text={t("paymentFlow.bank.step1")} />
          <Step styles={styles} n={2} text={t("paymentFlow.bank.step2")} />
          <Step styles={styles} n={3} text={t("paymentFlow.bank.step3")} />
          <Step styles={styles} n={4} text={t("paymentFlow.bank.step4")} />
        </View>

        <View style={styles.supportBox}>
          <Ionicons name="headset-outline" size={20} color={ui.success} />
          <Text style={styles.supportText}>{t("paymentFlow.bank.support")} 1900 1234</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.replace("MyBookingScreen")}>
          <Text style={styles.secondaryBtnText}>{t("paymentFlow.bank.viewOrder")}</Text>
        </Pressable>

        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("MainTabs")}>
          <Text style={styles.primaryBtnText}>{t("paymentFlow.bank.backHome")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  styles,
  label,
  value,
  accent,
}: {
  styles: any;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? styles.accentValue : null]}>{value}</Text>
    </View>
  );
}

function Step({
  styles,
  n,
  text,
}: {
  styles: any;
  n: number;
  text: string;
}) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}
