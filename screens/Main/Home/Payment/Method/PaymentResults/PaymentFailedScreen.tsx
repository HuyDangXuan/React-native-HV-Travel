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
  orderId?: string;
  method?: string;
  reason?: string;
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

export default function PaymentFailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params: RouteParams = route?.params ?? {};
  const { t } = useI18n();
  const appTheme = useAppTheme();

  const ui = useMemo<UiTokens>(
    () => ({
      accent: appTheme.colors.error,
      accentSoft: `${appTheme.colors.error}14`,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      divider: appTheme.semantic.divider,
    }),
    [appTheme]
  );

  const sheet = useMemo(() => createStyles(ui), [ui]);

  const reason = params?.reason || "unknown";
  const method = params?.method || t("paymentResult.common.unknown");
  const orderId = params?.orderId || `DL${Date.now()}`;
  const tourId = params?.id;
  const total = typeof params?.total === "number" ? params.total : 0;

  const amountText = useMemo(() => {
    if (typeof params?.amountText === "string" && params.amountText.trim()) return params.amountText;
    if (total > 0) return formatVND(total);
    if (typeof params?.amount === "string" && params.amount.trim()) return params.amount;
    return formatVND(0);
  }, [params?.amountText, params?.amount, total]);

  const failureInfo = getFailureInfo(reason, t);

  return (
    <ResultScreenLayout
      tone="error"
      icon="close-circle-outline"
      title={failureInfo.title}
      subtitle={failureInfo.message}
      footerActions={[
        {
          label: t("paymentResult.failed.actions.home"),
          onPress: () => navigation.navigate("MainTabs"),
          variant: "secondary",
        },
        {
          label: t("paymentResult.failed.actions.retry"),
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
        {!!tourId ? (
          <DetailRow
            icon="pricetag-outline"
            label={t("paymentResult.failed.fields.tourCode")}
            value={tourId}
            ui={ui}
            sheet={sheet}
          />
        ) : null}
        {!!tourId ? <Divider sheet={sheet} /> : null}
        <DetailRow
          icon="receipt-outline"
          label={t("paymentResult.failed.fields.orderCode")}
          value={orderId}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="cash-outline"
          label={t("paymentResult.failed.fields.amount")}
          value={amountText}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="wallet-outline"
          label={t("paymentResult.failed.fields.method")}
          value={method}
          ui={ui}
          sheet={sheet}
        />
        <Divider sheet={sheet} />
        <DetailRow
          icon="alert-circle-outline"
          label={t("paymentResult.failed.fields.reason")}
          value={failureInfo.reasonLabel}
          ui={ui}
          sheet={sheet}
        />
      </ResultCard>

      <ResultCard style={sheet.cardTinted}>
        <Text style={sheet.sectionTitle}>{t("paymentResult.failed.solutionTitle")}</Text>
        <Step
          icon="refresh-outline"
          text={t("paymentResult.failed.solutions.review")}
          ui={ui}
          sheet={sheet}
        />
        <Step
          icon="card-outline"
          text={t("paymentResult.failed.solutions.alternateMethod")}
          ui={ui}
          sheet={sheet}
        />
        <Step
          icon="headset-outline"
          text={t("paymentResult.failed.solutions.support")}
          ui={ui}
          sheet={sheet}
        />
      </ResultCard>
    </ResultScreenLayout>
  );
}

function getFailureInfo(reason: string, t: (key: string) => string) {
  switch (reason) {
    case "timeout":
      return {
        title: t("paymentResult.failed.reasons.timeout.title"),
        message: t("paymentResult.failed.reasons.timeout.message"),
        reasonLabel: t("paymentResult.failed.reasons.timeout.label"),
      };
    case "insufficient_funds":
      return {
        title: t("paymentResult.failed.reasons.insufficientFunds.title"),
        message: t("paymentResult.failed.reasons.insufficientFunds.message"),
        reasonLabel: t("paymentResult.failed.reasons.insufficientFunds.label"),
      };
    case "cancelled":
      return {
        title: t("paymentResult.failed.reasons.cancelled.title"),
        message: t("paymentResult.failed.reasons.cancelled.message"),
        reasonLabel: t("paymentResult.failed.reasons.cancelled.label"),
      };
    case "network_error":
      return {
        title: t("paymentResult.failed.reasons.networkError.title"),
        message: t("paymentResult.failed.reasons.networkError.message"),
        reasonLabel: t("paymentResult.failed.reasons.networkError.label"),
      };
    default:
      return {
        title: t("paymentResult.failed.reasons.unknown.title"),
        message: t("paymentResult.failed.reasons.unknown.message"),
        reasonLabel: t("paymentResult.failed.reasons.unknown.label"),
      };
  }
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
