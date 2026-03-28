import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import SuccessTick from "../../../../../components/SuccessTick";
import { useI18n } from "../../../../../context/I18nContext";
import { useAppTheme, useThemeMode } from "../../../../../context/ThemeModeContext";

type RouteParams = {
  id?: string;
  total?: number;
  amountText?: string;
  orderId?: string;
};

export default function CashPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useI18n();
  const appTheme = useAppTheme();
  const { themeName } = useThemeMode();

  const ui = useMemo(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      accent: appTheme.colors.primary,
      accentSoft: `${appTheme.colors.primary}14`,
      infoSurface:
        themeName === "dark" ? "rgba(37, 99, 235, 0.18)" : "rgba(59, 130, 246, 0.12)",
      infoText: themeName === "dark" ? "#93c5fd" : "#1d4ed8",
      onPrimary: appTheme.colors.white,
    }),
    [appTheme, themeName]
  );
  const styles = useMemo(() => createStyles(appTheme, ui), [appTheme, ui]);

  const params: RouteParams = route?.params ?? {};
  const tourId = params?.id;
  const amountText = params?.amountText || "0 VND";
  const orderId = params?.orderId || `DL${Date.now()}`;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const handleCall = () => {
    Linking.openURL("tel:19001234");
  };

  const handleOpenMap = () => {
    const address = t("paymentFlow.cash.addressValue");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} backgroundColor={ui.bg} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SuccessTick color={ui.accent} />

        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={80} color={ui.accent} />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.title}>{t("paymentFlow.cash.title")}</Text>
          <Text style={styles.subtitle}>{t("paymentFlow.cash.subtitle")}</Text>
        </Animated.View>

        <View style={styles.infoCard}>
          <Row label={t("paymentFlow.cash.orderCode")} value={orderId} styles={styles} />
          {!!tourId && <Row label={t("paymentFlow.cash.tourCode")} value={tourId} styles={styles} />}
          <Divider styles={styles} />
          <Row label={t("paymentFlow.cash.amount")} value={amountText} styles={styles} highlight />
          <Row
            label={t("paymentFlow.cash.method")}
            value={t("paymentFlow.cash.methodValue")}
            styles={styles}
          />
        </View>

        <View style={styles.officeCard}>
          <View style={styles.officeHeader}>
            <Ionicons name="business" size={24} color={ui.accent} />
            <Text style={styles.officeTitle}>{t("paymentFlow.cash.officeTitle")}</Text>
          </View>

          <OfficeRow
            icon="location"
            label={t("paymentFlow.cash.address")}
            value={t("paymentFlow.cash.addressValue")}
            extra={
              <Pressable style={styles.mapBtn} onPress={handleOpenMap}>
                <Text style={styles.mapBtnText}>{t("paymentFlow.cash.map")}</Text>
                <Ionicons name="navigate" size={16} color={ui.accent} />
              </Pressable>
            }
            styles={styles}
            ui={ui}
          />

          <OfficeRow
            icon="time"
            label={t("paymentFlow.cash.hours")}
            value={t("paymentFlow.cash.hoursValue")}
            styles={styles}
            ui={ui}
          />

          <OfficeRow
            icon="call"
            label={t("paymentFlow.cash.hotline")}
            value="1900 1234"
            extra={
              <Pressable onPress={handleCall}>
                <Text style={styles.phoneLink}>{t("paymentFlow.cash.callNow")}</Text>
              </Pressable>
            }
            styles={styles}
            ui={ui}
          />
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="information-circle" size={24} color={ui.infoText} />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>{t("paymentFlow.cash.noticeTitle")}</Text>
            <Text style={styles.noticeText}>{t("paymentFlow.cash.noticeBody")}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>{t("paymentFlow.cash.timelineTitle")}</Text>

          <TimelineItem
            title={t("paymentFlow.cash.timelineStep1Title")}
            description={t("paymentFlow.cash.timelineStep1Description")}
            styles={styles}
            ui={ui}
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            title={t("paymentFlow.cash.timelineStep2Title")}
            description={t("paymentFlow.cash.timelineStep2Description", { orderId })}
            styles={styles}
            ui={ui}
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            title={t("paymentFlow.cash.timelineStep3Title")}
            description={t("paymentFlow.cash.timelineStep3Description")}
            styles={styles}
            ui={ui}
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            title={t("paymentFlow.cash.timelineCompleteTitle")}
            description={t("paymentFlow.cash.timelineCompleteDescription")}
            styles={styles}
            ui={ui}
          />
        </View>

        <View style={styles.supportBox}>
          <Ionicons name="headset-outline" size={20} color={ui.accent} />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>{t("paymentFlow.cash.supportTitle")}</Text>
            <Text style={styles.supportBody}>{t("paymentFlow.cash.supportBody")}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.replace("MyBookingScreen")}>
          <Text style={styles.secondaryBtnText}>{t("paymentFlow.cash.viewOrder")}</Text>
        </Pressable>

        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("MainTabs")}>
          <Text style={styles.primaryBtnText}>{t("paymentFlow.cash.backHome")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  styles,
  highlight,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.amountHighlight]}>{value}</Text>
    </View>
  );
}

function OfficeRow({
  icon,
  label,
  value,
  extra,
  styles,
  ui,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  extra?: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  ui: { textSecondary: string };
}) {
  return (
    <View style={styles.officeRow}>
      <Ionicons name={icon} size={20} color={ui.textSecondary} />
      <View style={styles.officeContent}>
        <Text style={styles.officeLabel}>{label}</Text>
        <Text style={styles.officeValue}>{value}</Text>
        {extra}
      </View>
    </View>
  );
}

function TimelineItem({
  title,
  description,
  styles,
  ui,
}: {
  title: string;
  description: string;
  styles: ReturnType<typeof createStyles>;
  ui: { accent: string };
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: ui.accent }]} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineStep}>{title}</Text>
        <Text style={styles.timelineDesc}>{description}</Text>
      </View>
    </View>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

function createStyles(
  appTheme: ReturnType<typeof useAppTheme>,
  ui: {
    bg: string;
    surface: string;
    mutedSurface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentSoft: string;
    infoSurface: string;
    infoText: string;
    onPrimary: string;
  }
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: ui.bg,
    },
    container: {
      padding: appTheme.spacing.lg,
      paddingBottom: 120,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: appTheme.spacing.lg,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: ui.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...appTheme.typography.heroTitle,
      color: ui.textPrimary,
      textAlign: "center",
    },
    subtitle: {
      ...appTheme.typography.body,
      color: ui.textSecondary,
      textAlign: "center",
      marginTop: appTheme.spacing.sm,
      marginBottom: appTheme.spacing.xl,
    },
    infoCard: {
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.xl,
      padding: appTheme.spacing.lg,
      marginBottom: appTheme.spacing.lg,
      borderWidth: 1,
      borderColor: ui.border,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: appTheme.spacing.md,
      marginBottom: appTheme.spacing.sm,
    },
    infoLabel: {
      fontSize: appTheme.fontSize.sm,
      color: ui.textSecondary,
      fontWeight: "600",
      flex: 1,
    },
    infoValue: {
      fontSize: appTheme.fontSize.md,
      color: ui.textPrimary,
      fontWeight: "700",
      flex: 1,
      textAlign: "right",
    },
    amountHighlight: {
      color: ui.accent,
    },
    divider: {
      height: 1,
      backgroundColor: ui.border,
      marginVertical: appTheme.spacing.sm,
    },
    officeCard: {
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.xl,
      padding: appTheme.spacing.lg,
      marginBottom: appTheme.spacing.lg,
      borderWidth: 1,
      borderColor: ui.border,
    },
    officeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: appTheme.spacing.sm,
      marginBottom: appTheme.spacing.md,
    },
    officeTitle: {
      ...appTheme.typography.sectionTitle,
      color: ui.textPrimary,
    },
    officeRow: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      marginBottom: appTheme.spacing.md,
    },
    officeContent: {
      flex: 1,
    },
    officeLabel: {
      fontSize: appTheme.fontSize.sm,
      color: ui.textSecondary,
      fontWeight: "700",
      marginBottom: 4,
    },
    officeValue: {
      ...appTheme.typography.body,
      color: ui.textPrimary,
    },
    mapBtn: {
      marginTop: appTheme.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    mapBtnText: {
      fontSize: appTheme.fontSize.sm,
      color: ui.accent,
      fontWeight: "700",
    },
    phoneLink: {
      marginTop: appTheme.spacing.sm,
      fontSize: appTheme.fontSize.sm,
      color: ui.accent,
      fontWeight: "700",
    },
    noticeBox: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.spacing.md,
      borderRadius: appTheme.radius.lg,
      backgroundColor: ui.infoSurface,
      marginBottom: appTheme.spacing.lg,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      fontSize: appTheme.fontSize.md,
      color: ui.infoText,
      fontWeight: "800",
      marginBottom: 4,
    },
    noticeText: {
      ...appTheme.typography.body,
      color: ui.infoText,
    },
    timelineCard: {
      backgroundColor: ui.surface,
      borderRadius: appTheme.radius.xl,
      padding: appTheme.spacing.lg,
      borderWidth: 1,
      borderColor: ui.border,
      marginBottom: appTheme.spacing.lg,
    },
    timelineTitle: {
      ...appTheme.typography.sectionTitle,
      color: ui.textPrimary,
      marginBottom: appTheme.spacing.md,
    },
    timelineItem: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 6,
    },
    timelineContent: {
      flex: 1,
    },
    timelineStep: {
      fontSize: appTheme.fontSize.sm,
      color: ui.textPrimary,
      fontWeight: "800",
      marginBottom: 4,
    },
    timelineDesc: {
      ...appTheme.typography.body,
      color: ui.textSecondary,
    },
    timelineLine: {
      width: 2,
      height: 20,
      backgroundColor: ui.border,
      marginLeft: 5,
      marginVertical: 6,
    },
    supportBox: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.spacing.md,
      borderRadius: appTheme.radius.lg,
      backgroundColor: ui.accentSoft,
    },
    supportContent: {
      flex: 1,
    },
    supportTitle: {
      fontSize: appTheme.fontSize.md,
      color: ui.textPrimary,
      fontWeight: "800",
      marginBottom: 4,
    },
    supportBody: {
      ...appTheme.typography.body,
      color: ui.textSecondary,
    },
    footer: {
      flexDirection: "row",
      gap: appTheme.spacing.sm,
      padding: appTheme.layout.bottomBarPadding,
      borderTopWidth: 1,
      borderTopColor: ui.border,
      backgroundColor: ui.surface,
    },
    secondaryBtn: {
      flex: 1,
      minHeight: 54,
      borderRadius: appTheme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: ui.border,
      backgroundColor: ui.mutedSurface,
    },
    secondaryBtnText: {
      fontSize: appTheme.fontSize.md,
      fontWeight: "800",
      color: ui.textPrimary,
    },
    primaryBtn: {
      flex: 1,
      minHeight: 54,
      borderRadius: appTheme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: ui.accent,
    },
    primaryBtnText: {
      fontSize: appTheme.fontSize.md,
      fontWeight: "800",
      color: ui.onPrimary,
    },
  });
}
