import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";

export default function ReviewTab() {
  const reviews = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      date: "20/12/2024",
      comment:
        "Chuyến đi tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Gia đình tôi rất hài lòng và sẽ quay lại.",
    },
    {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4,
      date: "15/12/2024",
      comment:
        "Tour tốt, địa điểm đẹp. Tuy nhiên thời gian di chuyển hơi dài. Nhìn chung vẫn đáng để trải nghiệm.",
    },
    {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=8",
      rating: 5,
      date: "10/12/2024",
      comment:
        "Xuất sắc! Khách sạn sạch sẽ, đồ ăn ngon. Đặc biệt là HDV rất am hiểu và vui tính.",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=9",
      rating: 4,
      date: "05/12/2024",
      comment: "Chuyến đi đáng nhớ với nhiều kỷ niệm đẹp. Phù hợp cho gia đình có trẻ nhỏ.",
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Đánh giá & Xếp hạng</Text>

      {/* Rating Summary */}
      <View style={styles.ratingSummary}>
        <View style={styles.ratingLeft}>
          <Text style={styles.ratingScore}>4.8</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= 4 ? "star" : "star-half"}
                size={16}
                color="#FFB800"
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>128 đánh giá</Text>
        </View>

        <View style={styles.ratingBars}>
          <RatingBar star={5} percentage={75} count={96} />
          <RatingBar star={4} percentage={15} count={19} />
          <RatingBar star={3} percentage={7} count={9} />
          <RatingBar star={2} percentage={2} count={3} />
          <RatingBar star={1} percentage={1} count={1} />
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        <Text style={styles.reviewsHeader}>Nhận xét từ khách hàng</Text>
        {reviews.map((review) => (
          <ReviewCard key={review.id} data={review} />
        ))}
      </View>

      {/* Load More */}
      <Pressable style={styles.loadMoreBtn}>
        <Text style={styles.loadMoreText}>Xem thêm đánh giá</Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

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

function ReviewCard({
  data,
}: {
  data: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  };
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.avatarText}>{data.name.charAt(0)}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewName}>{data.name}</Text>
          <View style={styles.reviewMeta}>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= data.rating ? "star" : "star-outline"}
                  size={12}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.reviewDate}>{data.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{data.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },

  // Rating Summary
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
  },
  ratingScore: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.text,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginVertical: theme.spacing.xs,
  },
  reviewCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
  },
  ratingBars: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  ratingLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    width: 24,
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    width: 24,
    textAlign: "right",
  },

  // Reviews
  reviewsList: {
    gap: theme.spacing.md,
  },
  reviewsHeader: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeader: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
  },
  reviewComment: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },

  // Load More
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  loadMoreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});