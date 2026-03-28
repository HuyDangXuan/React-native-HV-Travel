import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useI18n } from "../../../../../../context/I18nContext";
import { useAppTheme } from "../../../../../../context/ThemeModeContext";
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

type UiTokens = {
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
};

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number.isFinite(value) ? value : 0
  );

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params: RouteParams = route?.params ?? {};
  const { locale, t } = useI18n();
  const appTheme = useAppTheme();

  const ui = useMemo<UiTokens>(
    () => ({
      accent: appTheme.colors.success,
      accentSoft: `${appTheme.colors.success}14`,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      divider: appTheme.semantic.divider,
    }),
    [appTheme]
  );

  const sheet = useMemo(() => createStyles(ui), [ui]);

  const method = params?.method || t("paymentResult.common.unknown");
  const orderId = params?.orderId || `DL${Date.now()}`;
  const transactionId = params?.transactionId || `TX${Date.now()}`;
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
      title={t("paymentResult.success.title")}
      subtitle={t("paymentResult.success.subtitle")}
      footerActions={[
        {
          label: t("paymentResult.success.actions.viewOrder"),
          onPress: () => {
            navigation.replace("MainTabs");
            setTimeout(() => navigation.navigate("MyBookingScreen"), 100);
          },
          variant: "secondary",
        },
        {
          label: t("paymentResult.success.actions.home"),
          onPress: () => navigation.replace("MainTabs"),
        },
      ]}
    >
      <ResultCard>
        <Text style={sheet.amountLabel}>{t("paymentResult.success.amountLabel")}</Text>
        <Text style={sheet.amountValue}>{amountText}</Text>
      </ResultCard>

      <ResultCard>
        {!!tourId ? (
          <DetailRow
            icon="pricetag-outline"
            label={t("paymentResult.success.fields.tourCode")}
            value={tourId}
            ui={ui}
            sheet={sheet}
          />
        ) : null}
        {!!tourId ? <Divider sheet={sheet} /> : null}
        <DetailRow
          icon="receipt-outline"
          label={t("paymentResult.success.fields.orderCode")}
          value={orderId}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="card-outline"
          label={t("paymentResult.success.fields.transactionCode")}
          value={transactionId}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="wallet-outline"
          label={t("paymentResult.success.fields.method")}
          value={method}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="time-outline"
          label={t("paymentResult.success.fields.time")}
          value={new Date().toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
          ui={ui}
          sheet={sheet}
        />
      </ResultCard>

      <ResultCard style={[sheet.cardTinted]}>
        <Text style={sheet.sectionTitle}>{t("paymentResult.success.nextStepsTitle")}</Text>
        <Step
          icon="mail-outline"
          text={t("paymentResult.success.nextSteps.email")}
          ui={ui}
          sheet={sheet}
        />
        <Step
          icon="calendar-outline"
          text={t("paymentResult.success.nextSteps.booking")}
          ui={ui}
          sheet={sheet}
        />
        <Step
          icon="headset-outline"
          text={t("paymentResult.success.nextSteps.support")}
          ui={ui}
          sheet={sheet}
        />
      </ResultCard>
    </ResultScreenLayout>
  );
}

function DetailRow({
  icon,
  label,
  value,
  ui,
  sheet,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  ui: UiTokens;
  sheet: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={sheet.detailRow}>
      <Ionicons name={icon} size={18} color={ui.accent} />
      <View style={sheet.detailMeta}>
        <Text style={sheet.detailLabel}>{label}</Text>
        <Text style={sheet.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function Step({
  icon,
  text,
  ui,
  sheet,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  ui: UiTokens;
  sheet: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={sheet.step}>
      <View style={[sheet.stepIconWrap, { backgroundColor: ui.accentSoft }]}>
        <Ionicons name={icon} size={18} color={ui.accent} />
      </View>
      <Text style={sheet.stepText}>{text}</Text>
    </View>
  );
}

function Divider({ sheet }: { sheet: ReturnType<typeof createStyles> }) {
  return <View style={sheet.divider} />;
}

const createStyles = (ui: UiTokens) =>
  StyleSheet.create({
    amountLabel: {
      fontSize: 13,
      color: ui.textSecondary,
      fontWeight: "700",
      textAlign: "center",
    },
    amountValue: {
      marginTop: 8,
      fontSize: 32,
      fontWeight: "900",
      color: ui.accent,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: ui.textPrimary,
      marginBottom: 12,
    },
    cardTinted: {
      backgroundColor: `${ui.accent}0F`,
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
      fontSize: 13,
      color: ui.textSecondary,
      fontWeight: "700",
    },
    detailValue: {
      marginTop: 2,
      fontSize: 15,
      color: ui.textPrimary,
      fontWeight: "700",
    },
    divider: {
      height: 1,
      backgroundColor: ui.divider,
      marginVertical: 12,
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
    },
    stepText: {
      flex: 1,
      fontSize: 13,
      color: ui.textPrimary,
      lineHeight: 22,
      fontWeight: "600",
    },
  });
