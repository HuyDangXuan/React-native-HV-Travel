import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useAppTheme } from "../../../../../context/ThemeModeContext";
import { useI18n } from "../../../../../context/I18nContext";
import RichHtmlText from "../../../../../components/ui/RichHtmlText";

type Tour = {
  schedule?: {
    day?: number;
    title?: string;
    description?: string;
    activities?: string[];
  }[];
  duration?: { text?: string };
  description?: string;
};

type ItineraryDay = {
  day: number;
  title: string;
  activities: { desc: string }[];
};

type ItineraryUi = {
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
};

export default function ItineraryTab({ tour }: { tour: Tour | null }) {
  const { t } = useI18n();
  const appTheme = useAppTheme();
  const ui = useMemo<ItineraryUi>(
    () => ({
      surface: appTheme.semantic.screenSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

  const itinerary = useMemo<ItineraryDay[]>(() => {
    if (!tour) return [];

    if (Array.isArray(tour.schedule) && tour.schedule.length > 0) {
      return tour.schedule.map((s, idx) => {
        const activitiesArr =
          Array.isArray(s.activities) && s.activities.length > 0
            ? s.activities.map((a) => ({ desc: a }))
            : [{ desc: s.description || t("tourDetail.itineraryNoActivityDescription") }];

        return {
          day: s.day ?? idx + 1,
          title: s.title || t("tourDetail.itineraryDefaultDayTitle", { day: idx + 1 }),
          activities: activitiesArr,
        };
      });
    }

    const fallbackDesc = tour.description || t("tourDetail.itineraryFallbackDescription");
    return [
      {
        day: 1,
        title: tour.duration?.text
          ? t("tourDetail.itineraryFallbackTitleWithDuration", { duration: tour.duration.text })
          : t("tourDetail.itineraryFallbackTitle"),
        activities: [{ desc: fallbackDesc }],
      },
    ];
  }, [t, tour]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t("tourDetail.itineraryTitle")}</Text>
      <Text style={styles.desc}>{t("tourDetail.itineraryDescription")}</Text>

      {itinerary.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>{t("tourDetail.itineraryEmptyTitle")}</Text>
          <Text style={styles.emptyDesc}>{t("tourDetail.itineraryEmptyDescription")}</Text>
        </View>
      ) : (
        <View style={styles.itineraryList}>
          {itinerary.map((item, idx) => (
            <DayCard
              key={`${item.day}-${idx}`}
              data={item}
              isLast={idx === itinerary.length - 1}
              styles={styles}
              t={t}
              ui={ui}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function DayCard({
  data,
  isLast,
  styles,
  t,
  ui,
}: {
  data: ItineraryDay;
  isLast: boolean;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, params?: Record<string, string | number>) => string;
  ui: ItineraryUi;
}) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>{t("tourDetail.itineraryDayLabel", { day: data.day })}</Text>
        </View>
        <Text style={styles.dayTitle}>{data.title}</Text>
      </View>

      <View style={styles.activitiesWrap}>
        {data.activities.map((activity, idx) => (
          <View key={idx} style={styles.activityRow}>
            <View style={styles.timelineCol}>
              <View style={styles.timelineDot} />
              {idx < data.activities.length - 1 && <View style={styles.timelineLine} />}
            </View>

            <View style={styles.activityContent}>
              <RichHtmlText
                html={activity.desc}
                compact
                palette={{
                  textPrimary: ui.textPrimary,
                  textSecondary: ui.textPrimary,
                  link: ui.primary,
                  border: ui.border,
                  surface: ui.surface,
                }}
                textColor={ui.textPrimary}
              />
            </View>
          </View>
        ))}
      </View>

      {!isLast && <View style={styles.dayConnector} />}
    </View>
  );
}

function createStyles(ui: ItineraryUi) {
  return StyleSheet.create({
    wrap: { marginTop: 32 },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: ui.textPrimary,
      marginBottom: 8,
    },
    desc: {
      color: ui.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 24,
    },
    emptyBox: {
      backgroundColor: ui.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: ui.border,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: ui.textPrimary,
    },
    emptyDesc: {
      marginTop: 4,
      fontSize: 14,
      color: ui.textSecondary,
      lineHeight: 20,
    },
    itineraryList: { gap: 16 },
    dayCard: {
      backgroundColor: ui.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: ui.border,
    },
    dayHeader: { marginBottom: 16 },
    dayBadge: {
      backgroundColor: ui.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    dayBadgeText: {
      color: ui.onPrimary,
      fontSize: 12,
      fontWeight: "600",
    },
    dayTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: ui.textPrimary,
    },
    activitiesWrap: { gap: 8 },
    activityRow: { flexDirection: "row", gap: 8 },
    timelineCol: { alignItems: "center", width: 20 },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: ui.primary,
      borderWidth: 2,
      borderColor: ui.onPrimary,
      shadowColor: ui.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: ui.border,
      marginTop: 4,
    },
    activityContent: { flex: 1, paddingBottom: 8 },
    activityDesc: {
      fontSize: 14,
      color: ui.textPrimary,
      lineHeight: 20,
    },
    dayConnector: {
      height: 20,
      width: 2,
      backgroundColor: ui.border,
      alignSelf: "center",
      marginTop: 8,
    },
  });
}
