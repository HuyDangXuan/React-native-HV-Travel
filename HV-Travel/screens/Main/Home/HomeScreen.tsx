import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type TabKey = "Tất cả" | "Châu á" | "Châu Âu" | "Châu Mỹ" | "Châu Đại Dương";
type PackageItem = {
  id: string;
  title: string;
  region: string;
  rating: number;
  image: string;
};
type CategoryItem = { id: string; label: string; icon: "terrain" | "beach" | "castle" | "food" };
type MiniPlace = { id: string; title: string; subtitle: string; image: string };
type SpecialItem = { id: string; title: string; desc: string; icon: "shield-check" | "cash-multiple" | "headset" };

const TABS: TabKey[] = ["Tất cả", "Châu á", "Châu Âu", "Châu Mỹ", "Châu Đại Dương"];

const EXCLUSIVE: Record<TabKey, PackageItem[]> = {
  "Tất cả": [
    {
      id: "all1",
      title: "Gói tour Maldives",
      region: "Nam Á",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
    },
    {
      id: "all2",
      title: "Gói tour Kashmir",
      region: "Ấn Độ",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
    },
  ],
  "Châu á": [
    {
      id: "asia1",
      title: "Gói tour Bali",
      region: "Indonesia",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80&auto=format&fit=crop",
    },
    {
      id: "asia2",
      title: "Gói tour Phuket",
      region: "Thái Lan",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format&fit=crop",
    },
  ],
  "Châu Âu": [
    {
      id: "europe1",
      title: "Gói tour Swiss Alps",
      region: "Switzerland",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200&q=80&auto=format&fit=crop",
    },
  ],
  "Châu Mỹ": [
    {
      id: "america1",
      title: "Gói tour California",
      region: "Hoa Kỳ",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop",
    },
  ],
  "Châu Đại Dương": [
    {
      id: "oceania1",
      title: "Gói tour Sydney Escape",
      region: "Úc",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1649716729295-7f934e11b4f8?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ],
};

const CATEGORIES: CategoryItem[] = [
  { id: "c1", label: "Leo núi", icon: "terrain" },
  { id: "c2", label: "Tắm biển", icon: "beach" },
  { id: "c3", label: "Di tích", icon: "castle" },
  { id: "c4", label: "Ẩm thực", icon: "food" },
];

const RECOMMENDED = {
  solo: [
    {
      id: "r1",
      title: "Saintmartin",
      subtitle: "★★★★★",
      image:
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80&auto=format&fit=crop",
    },
    {
      id: "r2",
      title: "Bandarban",
      subtitle: "★★★★★",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
    },
  ],
  family: [
    {
      id: "f1",
      title: "Phú Quốc",
      subtitle: "★★★★★",
      image:
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
    },
    {
      id: "f2",
      title: "Đà Lạt",
      subtitle: "★★★★★",
      image:
        "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80&auto=format&fit=crop",
    },
  ],
};

const KNOW: MiniPlace[] = [
  {
    id: "k1",
    title: "Dubai",
    subtitle: "Thành phố ở Ả Rập Xê Út",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "k2",
    title: "Bangkok",
    subtitle: "Thủ đô của Thailand",
    image:
      "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "k3",
    title: "Sikkim",
    subtitle: "Một bang của Ấn Độ",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "k4",
    title: "Singapore",
    subtitle: "Quốc gia ở Châu Á",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80&auto=format&fit=crop",
  },
];

const SPECIAL: SpecialItem[] = [
  { id: "s1", title: "Đảm bảo an toàn", desc: "There are many variations of passages Lorem.", icon: "shield-check" },
  { id: "s2", title: "Trở thành nhà tài trợ", desc: "There are many variations of passages Lorem.", icon: "cash-multiple" },
  { id: "s3", title: "Hỗ trợ 24/7", desc: "There are many variations of passages Lorem.", icon: "headset" },
];

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("Tất cả");
  const [recSeg, setRecSeg] = useState<"đơn" | "gia đình">("đơn");

  const exclusiveData = useMemo(() => EXCLUSIVE[activeTab], [activeTab]);
  const recommendedData = useMemo(() => (recSeg === "đơn" ? RECOMMENDED.solo : RECOMMENDED.family), [recSeg]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Chào buổi tối</Text>
            <Text style={styles.name}>Huy Đặng Xuân!</Text>
            <Text style={styles.title}>Khám phá thế giới với HV Travel</Text>
          </View>

          <Pressable style={styles.bellWrap} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
            <View style={styles.redDot} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Bạn muốn đi đâu?"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        {/* Exclusive Package */}
        <SectionHeader title="Gói độc quyền" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          style={styles.tabRow}>
          {TABS.map((t) => {
            const active = t === activeTab;
            return (
              <Pressable
                key={t}
                onPress={() => setActiveTab(t)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={exclusiveData}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, gap: 14 }}
          renderItem={({ item }) => <ExclusiveCard item={item} />}
        />

        {/* Explore Category */}
        <SectionHeader title="Khám phá các danh mục" />
        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <Pressable key={c.id} style={styles.categoryCard} onPress={() => {}}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name={c.icon} size={22} color="#3B82F6" />
              </View>
              <Text style={styles.categoryLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recommended Package */}
        <SectionHeader title="Gói tour đề xuất" />
        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segmentBtn, recSeg === "đơn" && styles.segmentBtnActive]}
            onPress={() => setRecSeg("đơn")}
          >
            <Text style={[styles.segmentText, recSeg === "đơn" && styles.segmentTextActive]}>Tour đơn</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, recSeg === "gia đình" && styles.segmentBtnActive]}
            onPress={() => setRecSeg("gia đình")}
          >
            <Text style={[styles.segmentText, recSeg === "gia đình" && styles.segmentTextActive]}>Tour gia đình</Text>
          </Pressable>
        </View>

        <View style={styles.recRow}>
          {recommendedData.map((r) => (
            <Pressable key={r.id} style={styles.recCard} onPress={() => {}}>
              <Image source={{ uri: r.image }} style={styles.recImg} />
              <View style={styles.recOverlay} />
              <View style={styles.recMeta}>
                <View style={styles.pinRow}>
                  <Ionicons name="location-outline" size={14} color="#fff" />
                  <Text style={styles.recName}>{r.title}</Text>
                </View>
                <Text style={styles.recStars}>{r.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Know Your World */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Khám phá thêm</Text>
          <Text style={styles.sectionSub}>Mở rộng tầm hiểu biết thế giới của bạn!</Text>
        </View>

        <View style={styles.knowGrid}>
          {KNOW.map((k) => (
            <Pressable key={k.id} style={styles.knowItem} onPress={() => {}}>
              <Image source={{ uri: k.image }} style={styles.knowImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.knowTitle}>{k.title}</Text>
                <Text style={styles.knowSub}>{k.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* App Special */}
        <SectionHeader title="Chức năng đặc biệt" />
        <View style={{ marginTop: 12, gap: 12, paddingBottom: 18 }}>
          {SPECIAL.map((s) => (
            <View key={s.id} style={styles.specialRow}>
              <View style={styles.specialIcon}>
                <MaterialCommunityIcons name={s.icon} size={22} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.specialTitle}>{s.title}</Text>
                <Text style={styles.specialDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ExclusiveCard({ item }: { item: PackageItem }) {
  const cardW = Math.min(290, width * 0.72);
  const navigation = useNavigation<any>();
  return (
    <Pressable style={[styles.exCard, { width: cardW }]} onPress={() => {
      navigation.navigate("TourDetailScreen");
    }}>
      <View style={styles.exImgWrap}>
        <Image source={{ uri: item.image }} style={styles.exImg} />
        <Pressable style={styles.bookmark} onPress={() => {}}>
          <Ionicons name="bookmark-outline" size={18} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.exMeta}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.exSub} numberOfLines={1}>
            {item.region}
          </Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { paddingHorizontal: 18, paddingTop: 10 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: "#6B7280", fontSize: 14, marginBottom: 4 },
  name: { color: "#111827", fontSize: 22, fontWeight: "800", marginBottom: 2 },
  title: { color: "#111827", fontSize: 22, fontWeight: "800" },

  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  redDot: { position: "absolute", top: 10, right: 12, width: 8, height: 8, borderRadius: 99, backgroundColor: theme.colors.danger },

  searchBox: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  sectionSub: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  tabRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  tabChip: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 999,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  tabChipActive: { backgroundColor: "#2563EB" },
  tabText: { color: "#6B7280", fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },

  exCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: "hidden",
  },
  exImgWrap: { position: "relative" },
  exImg: { width: "100%", height: 150 },
  bookmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  exMeta: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  exTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  exSub: { marginTop: 3, fontSize: 12, color: "#6B7280" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontWeight: "800", color: "#111827" },

  categoryRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 12 },
  categoryCard: {
    flex: 1,
    height: 86,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontWeight: "800", color: "#111827", fontSize: 12 },

  segmentWrap: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    padding: 4,
  },
  segmentBtn: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segmentBtnActive: { backgroundColor: "#2563EB" },
  segmentText: { fontWeight: "800", color: "#6B7280" },
  segmentTextActive: { color: "#FFFFFF" },

  recRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  recCard: {
    flex: 1,
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  recImg: { width: "100%", height: "100%" },
  recOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.20)" },
  recMeta: { position: "absolute", left: 12, right: 12, bottom: 10 },
  pinRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  recName: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  recStars: { marginTop: 6, color: "#FFFFFF", fontWeight: "800", fontSize: 12 },

  knowGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, paddingBottom: 6 },
  knowItem: {
    width: (width - 18 * 2 - 12) / 2,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  knowImg: { width: 46, height: 46, borderRadius: 12, backgroundColor: "#F3F4F6" },
  knowTitle: { fontWeight: "900", color: "#111827" },
  knowSub: { marginTop: 3, fontSize: 12, color: "#6B7280" },

  specialRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  specialIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  specialTitle: { fontWeight: "900", color: "#111827" },
  specialDesc: { marginTop: 4, fontSize: 12, color: "#6B7280", lineHeight: 16 },
});
