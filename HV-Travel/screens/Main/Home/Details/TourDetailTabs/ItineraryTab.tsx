import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../../../config/theme";

export default function ItineraryTab() {
  const itinerary = [
    {
      day: 1,
      title: "Khởi hành - Tham quan thành phố",
      activities: [
        { time: "06:00", desc: "Tập trung tại sân bay Tân Sơn Nhất" },
        { time: "09:00", desc: "Đến nơi, làm thủ tục check-in khách sạn" },
        { time: "12:00", desc: "Ăn trưa tại nhà hàng địa phương với đặc sản" },
        { time: "14:00", desc: "Tham quan chợ đêm và khu phố cổ" },
        { time: "18:00", desc: "Thưởng thức ẩm thực đường phố" },
        { time: "19:30", desc: "Về khách sạn nghỉ ngơi tự do" },
      ],
    },
    {
      day: 2,
      title: "Khám phá thiên nhiên",
      activities: [
        { time: "07:00", desc: "Ăn sáng tại khách sạn" },
        { time: "08:30", desc: "Xuất phát đi tham quan núi và thác" },
        { time: "12:00", desc: "Ăn trưa tại khu sinh thái" },
        { time: "14:00", desc: "Trekking và chụp ảnh thiên nhiên" },
        { time: "17:00", desc: "Trở về thành phố" },
        { time: "19:00", desc: "Tự do khám phá hoặc mua sắm" },
      ],
    },
    {
      day: 3,
      title: "Trải nghiệm văn hóa",
      activities: [
        { time: "07:30", desc: "Ăn sáng và chuẩn bị" },
        { time: "09:00", desc: "Thăm làng nghề truyền thống" },
        { time: "11:00", desc: "Trải nghiệm làm đồ thủ công" },
        { time: "12:30", desc: "Ăn trưa với gia đình bản địa" },
        { time: "15:00", desc: "Tham quan chùa chiền và di tích lịch sử" },
        { time: "18:00", desc: "Về khách sạn nghỉ ngơi" },
      ],
    },
    {
      day: 4,
      title: "Trở về",
      activities: [
        { time: "08:00", desc: "Ăn sáng và làm thủ tục check-out" },
        { time: "10:00", desc: "Mua sắm quà lưu niệm tại chợ" },
        { time: "12:00", desc: "Ăn trưa và di chuyển ra sân bay" },
        { time: "15:00", desc: "Bay về điểm xuất phát, kết thúc chuyến đi" },
      ],
    },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Lịch trình chi tiết</Text>
      <Text style={styles.desc}>
        Khám phá từng hoạt động theo ngày với thời gian cụ thể
      </Text>

      <View style={styles.itineraryList}>
        {itinerary.map((item, idx) => (
          <DayCard key={idx} data={item} isLast={idx === itinerary.length - 1} />
        ))}
      </View>
    </View>
  );
}

function DayCard({
  data,
  isLast,
}: {
  data: {
    day: number;
    title: string;
    activities: { time: string; desc: string }[];
  };
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
              {idx < data.activities.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTime}>{activity.time}</Text>
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
  wrap: {
    marginTop: theme.spacing.xl,
  },
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

  // Itinerary
  itineraryList: {
    gap: theme.spacing.md,
  },
  dayCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayHeader: {
    marginBottom: theme.spacing.md,
  },
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
  activitiesWrap: {
    gap: theme.spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  timelineCol: {
    alignItems: "center",
    width: 20,
  },
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
  activityContent: {
    flex: 1,
    paddingBottom: theme.spacing.sm,
  },
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