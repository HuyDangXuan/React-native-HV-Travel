import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderHtml from "react-native-render-html";

import { useAppTheme } from "../../../../../context/ThemeModeContext";
import { useI18n } from "../../../../../context/I18nContext";
import { Tour } from "../../../../../models/Tour";

const { width } = Dimensions.get("window");

type Props = {
  tour: Tour | null;
  galleryImages: string[];
  onOpenGallery: (index: number) => void;
  openInEx: boolean;
  setOpenInEx: React.Dispatch<React.SetStateAction<boolean>>;
  openFAQ: boolean;
  setOpenFAQ: React.Dispatch<React.SetStateAction<boolean>>;
};

type OverviewUi = {
  bg: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
};

type OverviewStyles = ReturnType<typeof createStyles>;

export default function OverviewTab({
  tour,
  galleryImages,
  onOpenGallery,
  openInEx,
  setOpenInEx,
  openFAQ,
  setOpenFAQ,
}: Props) {
  const { t, locale } = useI18n();
  const appTheme = useAppTheme();
  const ui = useMemo<OverviewUi>(
    () => ({
      bg: appTheme.semantic.screenBackground,
      surface: appTheme.semantic.screenSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
    }),
    [appTheme]
  );
  const { styles, htmlTagsStyles } = useMemo(() => createStyles(ui), [ui]);

  if (!tour) {
    return (
      <View style={{ paddingTop: appTheme.spacing.md }}>
        <Text style={styles.paragraph}>{t("tourDetail.overviewLoading")}</Text>
      </View>
    );
  }

  const formatVND = (v?: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(v ?? 0);

  const startDateText = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")
    : t("tourDetail.overviewNoStartDate");

  const photoList = galleryImages;

  return (
    <>
      <Section title={t("tourDetail.overviewIntroTitle")} styles={styles}>
        {tour.description ? (
          <RenderHtml
            contentWidth={width - appTheme.spacing.md * 2}
            source={{ html: tour.description }}
            tagsStyles={htmlTagsStyles}
            baseStyle={styles.paragraph}
          />
        ) : (
          <Text style={styles.paragraph}>{t("tourDetail.overviewNoDescription")}</Text>
        )}
      </Section>

      <Section title={t("tourDetail.overviewHighlightsTitle")} styles={styles}>
        <View style={styles.highlightsGrid}>
          <HighlightCard
            icon="time-outline"
            title={t("tourDetail.overviewDurationLabel")}
            value={tour.duration?.text || t("tourDetail.overviewNoDuration")}
            styles={styles}
            ui={ui}
          />
          {tour.destination?.city && (
            <HighlightCard
              icon="location-outline"
              title={t("tourDetail.overviewDestinationLabel")}
              value={tour.destination.city}
              styles={styles}
              ui={ui}
            />
          )}
          <HighlightCard
            icon="calendar-outline"
            title={t("tourDetail.overviewDepartureLabel")}
            value={startDateText}
            styles={styles}
            ui={ui}
          />
          <HighlightCard
            icon="pricetag-outline"
            title={t("tourDetail.overviewAdultPriceLabel")}
            value={formatVND(tour.price?.adult)}
            styles={styles}
            ui={ui}
          />
        </View>

        <View style={{ marginTop: appTheme.spacing.md }}>
          <Text style={styles.subTitle}>{t("tourDetail.overviewCapacityTitle")}</Text>
          <Bullet
            text={t("tourDetail.overviewMaxParticipantsLabel", {
              count: tour.maxParticipants ?? t("tourDetail.overviewNoCapacity"),
            })}
            styles={styles}
            ui={ui}
          />
          <Bullet
            text={t("tourDetail.overviewRegisteredLabel", {
              count: tour.currentParticipants ?? 0,
            })}
            styles={styles}
            ui={ui}
          />
        </View>
      </Section>

      <Section title={t("tourDetail.overviewGalleryTitle")} styles={styles}>
        {photoList.length === 0 ? (
          <Text style={styles.paragraph}>{t("tourDetail.overviewNoGallery")}</Text>
        ) : (
          <View style={styles.galleryGrid}>
            {photoList.slice(0, 6).map((uri, i) => (
              <Pressable key={`${uri}-${i}`} style={styles.galleryItem} onPress={() => onOpenGallery(i)}>
                <Image source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
                {i === 5 && photoList.length > 6 && (
                  <View style={styles.galleryOverlay}>
                    <Text style={styles.galleryMore}>+{photoList.length - 6}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </Section>

      <Accordion
        title={t("tourDetail.overviewInclusionsTitle")}
        open={openInEx}
        onToggle={() => setOpenInEx((v) => !v)}
        styles={styles}
        ui={ui}
      >
        <Text style={styles.subTitle}>{t("tourDetail.overviewIncludedTitle")}</Text>
        {(() => {
          const list = tour.generatedInclusions;
          return list?.length ? (
            list.map((item, idx) => <Bullet key={`inc-${idx}`} text={item} styles={styles} ui={ui} />)
          ) : (
            <Text style={styles.paragraph}>{t("tourDetail.overviewNoInclusions")}</Text>
          );
        })()}

        <Text style={styles.subTitle}>{t("tourDetail.overviewExcludedTitle")}</Text>
        {(() => {
          const list = tour.generatedExclusions;
          return list?.length ? (
            list.map((item, idx) => <Bullet key={`exc-${idx}`} text={item} styles={styles} ui={ui} />)
          ) : (
            <Text style={styles.paragraph}>{t("tourDetail.overviewNoExclusions")}</Text>
          );
        })()}
      </Accordion>

      <Accordion
        title={t("tourDetail.overviewFAQTitle")}
        open={openFAQ}
        onToggle={() => setOpenFAQ((v) => !v)}
        styles={styles}
        ui={ui}
      >
        <FAQItem
          q={t("tourDetail.overviewFaqCancelQuestion")}
          a={t("tourDetail.overviewFaqCancelAnswer")}
          styles={styles}
        />
        <FAQItem
          q={t("tourDetail.overviewFaqChildrenQuestion")}
          a={t("tourDetail.overviewFaqChildrenAnswer")}
          styles={styles}
        />
      </Accordion>

      <Section title={t("tourDetail.overviewMapTitle")} styles={styles}>
        <View style={styles.mapBox}>
          <Ionicons name="location-outline" size={48} color={ui.textSecondary} />
          <Text style={styles.mapText}>{t("tourDetail.overviewMapText")}</Text>
        </View>
      </Section>
    </>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: OverviewStyles["styles"];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HighlightCard({
  icon,
  title,
  value,
  styles,
  ui,
}: {
  icon: any;
  title: string;
  value: string;
  styles: OverviewStyles["styles"];
  ui: OverviewUi;
}) {
  return (
    <View style={styles.highlightCard}>
      <Ionicons name={icon} size={24} color={ui.primary} />
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
  styles,
  ui,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  styles: OverviewStyles["styles"];
  ui: OverviewUi;
}) {
  return (
    <View style={styles.section}>
      <Pressable style={styles.accordionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={ui.textSecondary}
        />
      </Pressable>

      {open ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}

function Bullet({
  text,
  styles,
  ui,
}: {
  text: string;
  styles: OverviewStyles["styles"];
  ui: OverviewUi;
}) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: ui.primary }]} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function FAQItem({
  q,
  a,
  styles,
}: {
  q: string;
  a: string;
  styles: OverviewStyles["styles"];
}) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQ}>{q}</Text>
      <Text style={styles.faqA}>{a}</Text>
    </View>
  );
}

function createStyles(ui: OverviewUi) {
  return {
    styles: StyleSheet.create({
      section: { marginTop: 32 },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: ui.textPrimary,
        marginBottom: 16,
      },
      paragraph: {
        color: ui.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "400",
      },

      highlightsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
      highlightCard: {
        width: (width - 32 - 8) / 2,
        backgroundColor: ui.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: ui.border,
      },
      highlightTitle: {
        fontSize: 12,
        color: ui.textSecondary,
        marginTop: 4,
      },
      highlightValue: {
        fontSize: 14,
        fontWeight: "600",
        color: ui.textPrimary,
        marginTop: 2,
        maxWidth: "100%",
      },

      galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
      galleryItem: {
        width: (width - 32 - 16) / 3,
        height: (width - 32 - 16) / 3,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: ui.surface,
      },
      galleryImg: { width: "100%", height: "100%" },
      galleryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
      },
      galleryMore: {
        color: ui.onPrimary,
        fontWeight: "700",
        fontSize: 22,
      },

      accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },

      subTitle: {
        marginTop: 16,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "600",
        color: ui.textPrimary,
      },

      bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 8,
      },
      bulletDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginTop: 8,
        marginRight: 8,
      },
      bulletText: {
        flex: 1,
        color: ui.textSecondary,
        fontSize: 14,
        lineHeight: 22,
      },

      faqItem: { marginBottom: 16 },
      faqQ: {
        fontWeight: "600",
        fontSize: 14,
        color: ui.textPrimary,
        marginBottom: 4,
      },
      faqA: { color: ui.textSecondary, fontSize: 14, lineHeight: 22 },

      mapBox: {
        height: 160,
        borderRadius: 16,
        backgroundColor: ui.surface,
        borderWidth: 1,
        borderColor: ui.border,
        alignItems: "center",
        justifyContent: "center",
      },
      mapText: { color: ui.textSecondary, fontSize: 14, marginTop: 4 },
    }),
    htmlTagsStyles: {
      p: {
        color: ui.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "400" as const,
        margin: 0,
        padding: 0,
      },
      strong: {
        fontWeight: "700" as const,
        color: ui.textPrimary,
      },
      ul: {
        margin: 0,
        paddingLeft: 20,
      },
      li: {
        color: ui.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 4,
      },
    },
  };
}
