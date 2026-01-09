import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../../../../config/theme";

type Tour = {
  // ✅ NEW: backend trả itinerary theo format vừa tạo
  itinerary?: { day?: number; title?: string; description?: string }[];

  // ✅ OLD: backend cũ schedules (giữ lại để không break)
  schedules?: {
    title?: string;
    description?: string;
    day?: number;
    activities?: { time?: string; desc?: string }[];
  }[];

  time?: string;
  description?: string;
};

type ItineraryDay = {
  day: number;
  title: string;
  activities: { time?: string; desc: string }[];
};

export default function ItineraryTab({ tour }: { tour: Tour | null }) {
  const itinerary = useMemo<ItineraryDay[]>(() => {
    if (!tour) return [];

    // ✅ Case 0 (NEW): backend có itinerary: [{day,title,description}]
    // -> convert thành mỗi ngày 1 activity (desc = description)
    if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
      return tour.itinerary.map((d, idx) => ({
        day: d.day ?? idx + 1,
        title: d.title || `Lịch trình ngày ${idx + 1}`,
        activities: [
          {
            desc: d.description || "Chưa có mô tả lịch trình.",
          },
        ],
      }));
    }

    // ✅ Case 1 (OLD): backend có schedules dạng đơn giản: [{title, description}] hoặc có activities
    if (Array.isArray(tour.schedules) && tour.schedules.length > 0) {
      return tour.schedules.map((s, idx) => {
        // ✅ nếu backend trả s.activities thì ưu tiên hiển thị chi tiết
        if (Array.isArray(s.activities) && s.activities.length > 0) {
          return {
            day: s.day ?? idx + 1,
            title: s.title || `Lịch trình ngày ${idx + 1}`,
            activities: s.activities.map((a) => ({
              time: a.time || "--:--",
              desc: a.desc || "",
            })),
          };
        }

        return {
          day: s.day ?? idx + 1,
          title: s.title || `Lịch trình ngày ${idx + 1}`,
          activities: [
            {
              time: "--:--",
              desc: s.description || "Chưa có mô tả lịch trình.",
            },
          ],
        };
      });
    }

    // ❗ Fallback: chưa có itinerary/schedules -> hiện tổng quan từ description + time
    const fallbackDesc =
      tour.description || "Hiện tour chưa cập nhật lịch trình chi tiết.";
    return [
      {
        day: 1,
        title: tour.time ? `Tổng quan (${tour.time})` : "Tổng quan",
        activities: [{ time: "--:--", desc: fallbackDesc }],
      },
    ];
  }, [tour]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Lịch trình chi tiết</Text>
      <Text style={styles.desc}>
        Khám phá từng hoạt động theo ngày với thời gian cụ thể
      </Text>

      {itinerary.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Chưa có lịch trình</Text>
          <Text style={styles.emptyDesc}>
            Tour này chưa được cập nhật lịch trình từ hệ thống.
          </Text>
        </View>
      ) : (
        <View style={styles.itineraryList}>
          {itinerary.map((item, idx) => (
            <DayCard
              key={`${item.day}-${idx}`}
              data={item}
              isLast={idx === itinerary.length - 1}
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
}: {
  data: ItineraryDay;
  isLast: boolean;
}) {
  return (
    <View style={styles.dayCard}>
      {/* Day Header */}
      <View style={styles.dayHeader}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>Ngày {data.day}</Text>
        </View>
        <Text style={styles.dayTitle}>{data.title}</Text>
      </View>

      {/* Activities */}
      <View style={styles.activitiesWrap}>
        {data.activities.map((activity, idx) => (
          <View key={idx} style={styles.activityRow}>
            <View style={styles.timelineCol}>
              <View style={styles.timelineDot} />
              {idx < data.activities.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>

            <View style={styles.activityContent}>
              {activity.time ? (
                <Text style={styles.activityTime}>{activity.time}</Text>
              ) : null}
              <Text style={styles.activityDesc}>{activity.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Connector to next day */}
      {!isLast && <View style={styles.dayConnector} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: theme.spacing.xl },

  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  desc: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },

  emptyBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
  },
  emptyDesc: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 20,
  },

  itineraryList: { gap: theme.spacing.md },

  dayCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayHeader: { marginBottom: theme.spacing.md },
  dayBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  dayBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },
  dayTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },

  activitiesWrap: { gap: theme.spacing.sm },
  activityRow: { flexDirection: "row", gap: theme.spacing.sm },

  timelineCol: { alignItems: "center", width: 20 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },

  activityContent: { flex: 1, paddingBottom: theme.spacing.sm },
  activityTime: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },

  dayConnector: {
    height: 20,
    width: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginTop: theme.spacing.sm,
  },
});
