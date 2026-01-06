import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../../../config/theme";

type SegKey = "Chưa Đi" | "Đã Đi";

type BookingItem = {
  id: string;
  title: string;
  duration: string;
  dateText: string;
  status: SegKey;
  image: string;
};

const DATA: BookingItem[] = [
  {
    id: "b1",
    title: "Bandarbans Package",
    duration: "2 Days 3 Night",
    dateText: "November 4, 2020",
    status: "Chưa Đi",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "b2",
    title: "Kashmir Package",
    duration: "3 Days 2 Night",
    dateText: "December 1, 2020",
    status: "Đã Đi",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&q=80&auto=format&fit=crop",
  },
];

export default function MyBookingScreen() {
  const navigation = useNavigation<any>();
  const [seg, setSeg] = useState<SegKey>("Chưa Đi");

  const list = useMemo(() => DATA.filter((x) => x.status === seg), [seg]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header (clone ProfileScreen header) */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Chuyến đi đã đặt</Text>

        {/* icon phải để cân layout giống ProfileScreen (có thể đổi/hoặc bỏ) */}
        <Pressable style={styles.headerIcon} onPress={() => {}}>
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Segment */}
      <View style={styles.segmentWrap}>
        <Pressable
          onPress={() => setSeg("Chưa Đi")}
          style={[styles.segBtn, seg === "Chưa Đi" && styles.segBtnActive]}
        >
          <Text style={[styles.segText, seg === "Chưa Đi" && styles.segTextActive]}>Chưa Đi</Text>
        </Pressable>

        <Pressable
          onPress={() => setSeg("Đã Đi")}
          style={[styles.segBtn, seg === "Đã Đi" && styles.segBtnActive]}
        >
          <Text style={[styles.segText, seg === "Đã Đi" && styles.segTextActive]}>Đã Đi</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          list.length === 0 && { flexGrow: 1 },
        ]}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.thumb} />

            <View style={{ flex: 1 }}>
              <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.sub}>{item.duration}</Text>

              <View style={styles.bottomRow}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.dateText}>{item.dateText}</Text>
                </View>

                <Pressable onPress={() => navigation.navigate("TourDetailScreen")} style={styles.detailsBtn}>
                  <Text style={styles.detailsText}>Details</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-clear-outline" size={34} color={theme.colors.primary} />
            </View>

            <Text style={styles.emptyTitle}>
              {seg === "Chưa Đi" ? "Bạn chưa có chuyến đi nào" : "Chưa có lịch sử chuyến đi"}
            </Text>

            <Text style={styles.emptyDesc}>
              {seg === "Chưa Đi"
                ? "Hãy chọn một tour phù hợp và đặt ngay để bắt đầu hành trình."
                : "Khi bạn hoàn thành chuyến đi, lịch sử sẽ hiển thị ở đây."}
            </Text>

            <Pressable
              style={styles.emptyBtn}
              onPress={() => navigation.replace("MainTabs")}
            >
              <Ionicons name="compass-outline" size={18} color={theme.colors.white} />
              <Text style={styles.emptyBtnText}>Khám phá tour</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ giống ProfileScreen
  safe: { flex: 1, backgroundColor: theme.colors.surface },

  // ✅ clone header từ ProfileScreen
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    color: theme.colors.text,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentWrap: {
    marginTop: 10,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },
  segBtn: {
    paddingHorizontal: 18,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  segBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  segText: { fontSize: 14, fontWeight: "700", color: theme.colors.gray },
  segTextActive: { color: theme.colors.white },

  list: { paddingHorizontal: theme.spacing.md, paddingTop: 18, paddingBottom: 18 },

  card: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: "800", color: theme.colors.text },
  badge: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(0,122,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: theme.colors.primary, fontWeight: "800", fontSize: 12 },

  sub: { marginTop: 6, color: theme.colors.gray, fontWeight: "600" },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { color: theme.colors.primary, fontWeight: "800" },

  detailsBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailsText: { color: theme.colors.primary, fontWeight: "900" },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "rgba(0,122,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
  },
  emptyDesc: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyBtnText: {
    color: theme.colors.white,
    fontWeight: "900",
    fontSize: 14,
  },
});
