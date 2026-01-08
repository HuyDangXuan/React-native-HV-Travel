import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import theme from "../../../config/theme";
import { TourService } from "../../../services/TourService";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../Loading/LoadingOverlay";

const { width } = Dimensions.get("window");

type MiniPlace = { id: string; title: string; subtitle: string; image: string };
type SpecialItem = {
  id: string;
  title: string;
  desc: string;
  icon: "shield-check" | "cash-multiple" | "headset";
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
  {
    id: "s1",
    title: "Đảm bảo an toàn",
    desc: "Chuyến đi của bạn luôn được bảo vệ bởi chúng tôi",
    icon: "shield-check",
  },
  {
    id: "s2",
    title: "Giá tốt nhất",
    desc: "Cam kết giá tour tốt nhất thị trường",
    icon: "cash-multiple",
  },
  {
    id: "s3",
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ hỗ trợ nhiệt tình suốt 24/7",
    icon: "headset",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, tourRes] = await Promise.all([
        TourService.getCategories(),
        TourService.getTours(),
      ]);

      const catList = Array.isArray(catRes) ? catRes : catRes?.data ?? [];
      const tourList = Array.isArray(tourRes) ? tourRes : tourRes?.data ?? [];

      setCategories(catList);
      setTours(tourList);
    } catch (e: any) {
      console.log("Fetch home error:", e);
      MessageBoxService.error("Lỗi", e?.message || "Không lấy được dữ liệu.", "OK");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHomeData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchHomeData]);

  // Filter tours theo category và search
  const filteredTours = useMemo(() => {
    let result = tours;

    // Filter by category
    if (selectedCategory) {
      result = result.filter((t) => t?.category === selectedCategory);
    }

    // Filter by search
    const key = search.trim().toLowerCase();
    if (key) {
      result = result.filter((t) => (t?.name || "").toLowerCase().includes(key));
    }

    return result;
  }, [tours, selectedCategory, search]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Chào buổi tối</Text>
            <Text style={styles.name}>Huy Đặng Xuân!</Text>
          </View>

          <Pressable style={styles.bellWrap} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            <View style={styles.redDot} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={20} color={theme.colors.gray} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm kiếm tour, địa điểm..."
            placeholderTextColor={theme.colors.gray}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.gray} />
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <SectionHeader title="Danh mục tour" />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item, idx) => item?._id?.toString() || idx.toString()}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryChip,
                selectedCategory === item._id && styles.categoryChipActive,
              ]}
              onPress={() => {
                setSelectedCategory(
                  selectedCategory === item._id ? null : item._id
                );
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item._id && styles.categoryTextActive,
                ]}
              >
                {item?.name || "Unknown"}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có danh mục</Text>
          }
        />

        {/* Tours List */}
        <SectionHeader
          title={
            selectedCategory
              ? `Tours (${filteredTours.length})`
              : `Tất cả tours (${tours.length})`
          }
        />

        {filteredTours.length === 0 ? (
          <View style={[styles.emptyContainer, { paddingHorizontal: theme.spacing.md }]}>
            <Ionicons name="boat-outline" size={64} color={theme.colors.gray} />
            <Text style={styles.emptyTitle}>Không tìm thấy tour</Text>
            <Text style={styles.emptyDesc}>
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTours}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(tour, idx) => tour?._id?.toString() || idx.toString()}
            contentContainerStyle={styles.toursGrid}
            renderItem={({ item: tour }) => (
              <Pressable
                style={[styles.tourCard, { width: 280 }]} // 👈 bắt buộc set width để thấy scroll ngang
                onPress={() => navigation.navigate("TourDetailScreen", { id: tour._id })}
              >
                <Image
                  source={{
                    uri:
                      tour?.thumbnail_url ||
                      tour?.images?.[0] ||
                      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80&auto=format&fit=crop",
                  }}
                  style={styles.tourImage}
                  resizeMode="cover"
                />

                {/* Discount Badge */}
                {tour?.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{tour.discount}%</Text>
                  </View>
                )}

                <View style={styles.tourContent}>
                  <Text style={styles.tourName} numberOfLines={2}>
                    {tour?.name || "Tour Name"}
                  </Text>

                  <View style={styles.tourMeta}>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.gray} />
                      <Text style={styles.metaText}>{tour?.time || "N/A"}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="car-outline" size={14} color={theme.colors.gray} />
                      <Text style={styles.metaText}>{tour?.vehicle || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={styles.tourFooter}>
                    <View>
                      {tour?.oldPrice?.adult && (
                        <Text style={styles.oldPrice}>{formatPrice(tour.oldPrice.adult)}</Text>
                      )}
                      <Text style={styles.newPrice}>
                        {formatPrice(tour?.newPrice?.adult || tour?.price?.adult || 0)}
                      </Text>
                    </View>

                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.ratingText}>{tour?.rating || "5.0"}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}


        {/* Know Your World */}
        <SectionHeader title="Khám phá thêm" />
        <Text style={styles.sectionSub}>Mở rộng tầm hiểu biết thế giới của bạn!</Text>

        <View style={styles.knowGrid}>
          {KNOW.map((k) => (
            <Pressable
              key={k.id}
              style={styles.knowItem}
              onPress={() => navigation.navigate("Explore", { location: k.title })}
            >
              <Image source={{ uri: k.image }} style={styles.knowImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.knowTitle}>{k.title}</Text>
                <Text style={styles.knowSub}>{k.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* App Special */}
        <SectionHeader title="Tại sao chọn chúng tôi?" />
        <View style={styles.specialContainer}>
          {SPECIAL.map((s) => (
            <View key={s.id} style={styles.specialRow}>
              <View style={styles.specialIcon}>
                <MaterialCommunityIcons name={s.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.specialTitle}>{s.title}</Text>
                <Text style={styles.specialDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.white },
  container: { paddingBottom: 20 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  greeting: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    marginBottom: 4,
    fontWeight: "600",
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
  },

  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  searchBox: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
  },

  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    color: theme.colors.text,
  },
  sectionSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: 4,
    paddingHorizontal: theme.spacing.md,
    fontWeight: "600",
  },

  // Categories
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },

  // Tours Grid
  toursGrid: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  tourCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tourImage: {
    width: "100%",
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  discountBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "#DC2626",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "800",
  },
  tourContent: {
    padding: theme.spacing.md,
  },
  tourName: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  tourMeta: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "600",
  },
  tourFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  oldPrice: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  newPrice: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  ratingText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.text,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    marginTop: theme.spacing.xs,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },

  // Know Your World
  knowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  knowItem: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: "center",
  },
  knowImg: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  knowTitle: {
    fontWeight: "800",
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  knowSub: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    fontWeight: "600",
  },

  // Special
  specialContainer: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  specialRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    alignItems: "center",
  },
  specialIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  specialTitle: {
    fontWeight: "800",
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  specialDesc: {
    marginTop: 4,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    lineHeight: 18,
    fontWeight: "600",
  },
});