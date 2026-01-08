import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";

type Review = {
  _id?: string;
  name?: string; // hoặc userName
  rating?: number; // 1..5
  comment?: string;
  createdAt?: string; // ISO
};

type Tour = {
  reviews?: Review[];
  rating?: number; // nếu backend có sẵn avg
  ratingCount?: number; // nếu backend có sẵn count
};

function formatDateVN(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function clampRating(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

export default function ReviewTab({ tour }: { tour: Tour | null }) {
  const [showAll, setShowAll] = useState(false);

  const reviews = useMemo<Review[]>(() => {
    return Array.isArray(tour?.reviews) ? tour!.reviews! : [];
  }, [tour]);

  const ratingStats = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;

    // ✅ nếu backend có rating + ratingCount sẵn thì ưu tiên dùng
    const hasBackendAvg = typeof tour?.rating === "number" && typeof tour?.ratingCount === "number";

    if (hasBackendAvg) {
      return {
        avg: clampRating(tour!.rating),
        total: Math.max(0, Number(tour!.ratingCount) || 0),
        counts, // không có breakdown thì để 0
      };
    }

    // ✅ tự tính từ reviews
    if (reviews.length === 0) {
      return { avg: 0, total: 0, counts };
    }

    let sum = 0;
    for (const r of reviews) {
      const star = Math.round(clampRating(r.rating));
      const s = Math.max(1, Math.min(5, star));
      counts[s] += 1;
      sum += clampRating(r.rating);
    }
    const avg = sum / reviews.length;

    return { avg, total: reviews.length, counts };
  }, [reviews, tour]);

  const topReviews = useMemo(() => {
    if (showAll) return reviews;
    return reviews.slice(0, 4);
  }, [reviews, showAll]);

  const bars = useMemo(() => {
    const total = ratingStats.total || 0;
    const getPct = (star: 1 | 2 | 3 | 4 | 5) =>
      total === 0 ? 0 : Math.round((ratingStats.counts[star] / total) * 100);

    return ([
      { star: 5 as const, pct: getPct(5), count: ratingStats.counts[5] },
      { star: 4 as const, pct: getPct(4), count: ratingStats.counts[4] },
      { star: 3 as const, pct: getPct(3), count: ratingStats.counts[3] },
      { star: 2 as const, pct: getPct(2), count: ratingStats.counts[2] },
      { star: 1 as const, pct: getPct(1), count: ratingStats.counts[1] },
    ]);
  }, [ratingStats]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Đánh giá & Xếp hạng</Text>

      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingScore}>
            {ratingStats.total > 0 ? ratingStats.avg.toFixed(1) : "0.0"}
          </Text>

          <View style={styles.starsRow}>
            {renderStars(ratingStats.avg)}
          </View>

          <Text style={styles.reviewCount}>
            {ratingStats.total} đánh giá
          </Text>
        </View>

        <View style={styles.ratingBars}>
          {bars.map((b) => (
            <RatingBar key={b.star} star={b.star} percentage={b.pct} count={b.count} />
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        <Text style={styles.reviewsHeader}>Nhận xét từ khách hàng</Text>

        {topReviews.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.colors.gray} />
            <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
            <Text style={styles.emptyDesc}>Hãy là người đầu tiên để lại nhận xét cho tour này.</Text>
          </View>
        ) : (
          <FlatList
            data={topReviews}
            keyExtractor={(item, idx) => item?._id || `${idx}`}
            scrollEnabled={false} // vì tab đang nằm trong ScrollView
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
            renderItem={({ item }) => <ReviewCard data={item} />}
          />
        )}
      </View>

      {/* Load More */}
      {reviews.length > 4 && (
        <Pressable style={styles.loadMoreBtn} onPress={() => setShowAll((v) => !v)}>
          <Text style={styles.loadMoreText}>
            {showAll ? "Thu gọn" : "Xem thêm đánh giá"}
          </Text>
          <Ionicons
            name={showAll ? "chevron-up" : "chevron-down"}
            size={16}
            color={theme.colors.primary}
          />
        </Pressable>
      )}
    </View>
  );
}

/* ---------------- Helpers ---------------- */

function renderStars(avg: number) {
  // hiển thị dạng full/half/outline theo điểm trung bình
  const a = clampRating(avg);
  const full = Math.floor(a);
  const hasHalf = a - full >= 0.5;

  return [1, 2, 3, 4, 5].map((i) => {
    const name =
      i <= full ? "star" : i === full + 1 && hasHalf ? "star-half" : "star-outline";
    return <Ionicons key={i} name={name as any} size={16} color="#FFB800" />;
  });
}

/* ---------------- Components ---------------- */

function RatingBar({
  star,
  percentage,
  count,
}: {
  star: number;
  percentage: number;
  count: number;
}) {
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingLabel}>{star}★</Text>
      <View style={styles.ratingBarBg}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
}

function ReviewCard({ data }: { data: Review }) {
  const name = data?.name || "Khách hàng";
  const rating = clampRating(data?.rating);
  const date = formatDateVN(data?.createdAt);

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
                  color="#FFB800"
                />
              ))}
            </View>

            {!!date && <Text style={styles.reviewDate}>{date}</Text>}
          </View>
        </View>
      </View>

      {!!data?.comment && <Text style={styles.reviewComment}>{data.comment}</Text>}
      {!data?.comment && (
        <Text style={[styles.reviewComment, { color: theme.colors.gray }]}>
          (Không có nội dung nhận xét)
        </Text>
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  wrap: { marginTop: theme.spacing.xl },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },

  ratingSummary: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  ratingLeft: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: theme.spacing.lg,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    minWidth: 110,
  },
  ratingScore: { fontSize: 36, fontWeight: "700", color: theme.colors.text },
  starsRow: { flexDirection: "row", gap: 2, marginVertical: theme.spacing.xs },
  reviewCount: { fontSize: theme.fontSize.xs, color: theme.colors.gray, fontWeight: "600" },

  ratingBars: { flex: 1, justifyContent: "center", gap: theme.spacing.xs },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  ratingLabel: { fontSize: theme.fontSize.xs, color: theme.colors.gray, width: 24 },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: { height: "100%", backgroundColor: "#FFB800", borderRadius: 3 },
  ratingCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    width: 28,
    textAlign: "right",
  },

  reviewsList: { gap: theme.spacing.md },
  reviewsHeader: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  emptyBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emptyTitle: { marginTop: 6, fontWeight: "800", color: theme.colors.text, fontSize: theme.fontSize.md },
  emptyDesc: { color: theme.colors.gray, fontSize: theme.fontSize.sm, textAlign: "center", lineHeight: 20 },

  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeader: { flexDirection: "row", gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: theme.colors.white, fontSize: theme.fontSize.md, fontWeight: "700" },

  reviewInfo: { flex: 1 },
  reviewName: { fontSize: theme.fontSize.sm, fontWeight: "700", color: theme.colors.text, marginBottom: 2 },
  reviewMeta: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewDate: { fontSize: theme.fontSize.xs, color: theme.colors.gray, fontWeight: "600" },
  reviewComment: { fontSize: theme.fontSize.sm, color: theme.colors.text, lineHeight: 20 },

  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  loadMoreText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: "700" },
});
