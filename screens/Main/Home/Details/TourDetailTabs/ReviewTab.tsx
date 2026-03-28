import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../../../../context/ThemeModeContext";
import { useI18n } from "../../../../../context/I18nContext";

type Review = {
  id?: string;
  customerId?: string;
  customerName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  isApproved?: boolean;
};

type Tour = {
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
};

type ReviewUi = {
  surface: string;
  mutedSurface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
};

const STAR_COLOR = "#FFB800";

function clampRating(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

function formatReviewDate(iso: string | undefined, locale: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
}

export default function ReviewTab({ tour }: { tour: Tour | null }) {
  const [showAll, setShowAll] = useState(false);
  const { t, locale } = useI18n();
  const appTheme = useAppTheme();
  const ui = useMemo<ReviewUi>(
    () => ({
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      border: appTheme.semantic.divider,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

  const reviews = useMemo<Review[]>(
    () => (Array.isArray(tour?.reviews) ? tour.reviews : []),
    [tour?.reviews]
  );

  const ratingStats = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    let reviewSum = 0;

    if (reviews.length === 0) {
      if (typeof tour?.rating === "number" && typeof tour?.reviewCount === "number") {
        return {
          avg: clampRating(tour.rating),
          total: Math.max(0, Number(tour.reviewCount) || 0),
          counts,
        };
      }
      return { avg: 0, total: 0, counts };
    }

    for (const review of reviews) {
      const rounded = Math.round(clampRating(review.rating));
      const safeStar = Math.max(1, Math.min(5, rounded));
      counts[safeStar] += 1;
      reviewSum += clampRating(review.rating);
    }

    const computedAverage = reviewSum / reviews.length;

    return {
      avg: computedAverage,
      total: reviews.length,
      counts,
    };
  }, [reviews, tour?.rating, tour?.reviewCount]);

  const topReviews = useMemo(() => (showAll ? reviews : reviews.slice(0, 4)), [reviews, showAll]);

  const bars = useMemo(() => {
    const total = ratingStats.total || 0;
    const getPct = (star: 1 | 2 | 3 | 4 | 5) =>
      total === 0 ? 0 : Math.round((ratingStats.counts[star] / total) * 100);

    return [
      { star: 5 as const, pct: getPct(5), count: ratingStats.counts[5] },
      { star: 4 as const, pct: getPct(4), count: ratingStats.counts[4] },
      { star: 3 as const, pct: getPct(3), count: ratingStats.counts[3] },
      { star: 2 as const, pct: getPct(2), count: ratingStats.counts[2] },
      { star: 1 as const, pct: getPct(1), count: ratingStats.counts[1] },
    ];
  }, [ratingStats]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t("tourDetail.reviewTitle")}</Text>

      <View style={styles.ratingSummary}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingScore}>
            {ratingStats.total > 0 ? ratingStats.avg.toFixed(1) : "0.0"}
          </Text>

          <View style={styles.starsRow}>{renderStars(ratingStats.avg)}</View>

          <Text style={styles.reviewCount}>
            {t("tourDetail.reviewCountLabel", { count: ratingStats.total })}
          </Text>
        </View>

        <View style={styles.ratingBars}>
          {bars.map((bar) => (
            <RatingBar
              key={bar.star}
              star={bar.star}
              percentage={bar.pct}
              count={bar.count}
              styles={styles}
            />
          ))}
        </View>
      </View>

      <View style={styles.reviewsList}>
        <Text style={styles.reviewsHeader}>{t("tourDetail.reviewCustomerFeedbackTitle")}</Text>

        {topReviews.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={ui.textSecondary} />
            <Text style={styles.emptyTitle}>{t("tourDetail.reviewEmptyTitle")}</Text>
            <Text style={styles.emptyDesc}>{t("tourDetail.reviewEmptyDescription")}</Text>
          </View>
        ) : (
          <FlatList
            data={topReviews}
            keyExtractor={(item, idx) => item?.id || `${idx}`}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <ReviewCard data={item} styles={styles} locale={locale} t={t} ui={ui} />
            )}
          />
        )}
      </View>

      {reviews.length > 4 && (
        <Pressable style={styles.loadMoreBtn} onPress={() => setShowAll((value) => !value)}>
          <Text style={styles.loadMoreText}>
            {showAll ? t("tourDetail.reviewShowLess") : t("tourDetail.reviewShowMore")}
          </Text>
          <Ionicons
            name={showAll ? "chevron-up" : "chevron-down"}
            size={16}
            color={ui.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

function renderStars(avg: number) {
  const rating = clampRating(avg);
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return [1, 2, 3, 4, 5].map((i) => {
    const name = i <= full ? "star" : i === full + 1 && hasHalf ? "star-half" : "star-outline";
    return <Ionicons key={i} name={name as any} size={16} color={STAR_COLOR} />;
  });
}

function RatingBar({
  star,
  percentage,
  count,
  styles,
}: {
  star: number;
  percentage: number;
  count: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.ratingBarRow}>
      <View style={styles.ratingLabelWrap}>
        <Text style={styles.ratingLabel}>{star}</Text>
        <Ionicons name="star" size={10} color={STAR_COLOR} />
      </View>
      <View style={styles.ratingBarBg}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
}

function ReviewCard({
  data,
  styles,
  locale,
  t,
  ui,
}: {
  data: Review;
  styles: ReturnType<typeof createStyles>;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  ui: ReviewUi;
}) {
  const name = data.customerName || t("tourDetail.reviewAnonymousCustomer");
  const rating = clampRating(data.rating);
  const date = formatReviewDate(data.createdAt, locale);

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.reviewInfo}>
          <Text style={styles.reviewName}>{name}</Text>

          <View style={styles.reviewMeta}>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(rating) ? "star" : "star-outline"}
                  size={12}
                  color={STAR_COLOR}
                />
              ))}
            </View>

            {!!date && <Text style={styles.reviewDate}>{date}</Text>}
          </View>
        </View>
      </View>

      {data.comment ? (
        <Text style={styles.reviewComment}>{data.comment}</Text>
      ) : (
        <Text style={[styles.reviewComment, { color: ui.textSecondary }]}>
          {t("tourDetail.reviewNoComment")}
        </Text>
      )}
    </View>
  );
}

function createStyles(ui: ReviewUi) {
  return StyleSheet.create({
    wrap: { marginTop: 32 },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: ui.textPrimary,
      marginBottom: 24,
    },
    ratingSummary: {
      flexDirection: "row",
      backgroundColor: ui.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: ui.border,
      gap: 24,
      marginBottom: 24,
    },
    ratingLeft: {
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 24,
      borderRightWidth: 1,
      borderRightColor: ui.border,
      minWidth: 110,
    },
    ratingScore: { fontSize: 36, fontWeight: "700", color: ui.textPrimary },
    starsRow: { flexDirection: "row", gap: 2, marginVertical: 4 },
    reviewCount: { fontSize: 12, color: ui.textSecondary, fontWeight: "600" },
    ratingBars: { flex: 1, justifyContent: "center", gap: 8 },
    ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    ratingLabelWrap: {
      width: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    ratingLabel: { fontSize: 12, color: ui.textSecondary },
    ratingBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: ui.mutedSurface,
      borderRadius: 3,
      overflow: "hidden",
    },
    ratingBarFill: { height: "100%", backgroundColor: STAR_COLOR, borderRadius: 3 },
    ratingCount: {
      fontSize: 12,
      color: ui.textSecondary,
      width: 28,
      textAlign: "right",
    },
    reviewsList: { gap: 16 },
    reviewsHeader: {
      fontSize: 16,
      fontWeight: "600",
      color: ui.textPrimary,
      marginBottom: 8,
    },
    emptyBox: {
      backgroundColor: ui.surface,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: ui.border,
      alignItems: "center",
      gap: 4,
    },
    emptyTitle: { marginTop: 6, fontWeight: "800", color: ui.textPrimary, fontSize: 16 },
    emptyDesc: {
      color: ui.textSecondary,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    reviewCard: {
      backgroundColor: ui.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: ui.border,
    },
    reviewHeader: { flexDirection: "row", gap: 8, marginBottom: 8 },
    reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: ui.onPrimary, fontSize: 16, fontWeight: "700" },
    reviewInfo: { flex: 1 },
    reviewName: { fontSize: 14, fontWeight: "700", color: ui.textPrimary, marginBottom: 2 },
    reviewMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
    reviewStars: { flexDirection: "row", gap: 2 },
    reviewDate: { fontSize: 12, color: ui.textSecondary, fontWeight: "600" },
    reviewComment: { fontSize: 14, color: ui.textPrimary, lineHeight: 20 },
    loadMoreBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 16,
      marginTop: 16,
    },
    loadMoreText: { fontSize: 14, color: ui.primary, fontWeight: "700" },
  });
}
