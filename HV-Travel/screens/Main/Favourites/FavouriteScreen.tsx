import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../../config/theme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { FavouriteService } from "../../../services/FavouriteService";
import { TourService } from "../../../services/TourService";

type FavouriteTour = {
  favouriteId: string;   // id document favourite
  tourId: string;        // id tour thật để navigate
  cityId?: string;

  name: string;
  rating: number;
  price: { adult: number };
  newPrice?: { adult: number };
  oldPrice?: { adult: number };
  discount?: number;
  thumbnail_url: string;
  images?: string[];
  time: string;
  vehicle: string;
  location?: string;
  category?: string;
};

export default function FavouriteScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favourites, setFavourites] = useState<FavouriteTour[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const catRes = await TourService.getCategories();
      const catList = Array.isArray(catRes) ? catRes : catRes?.data ?? [];
      setCategories(catList);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  }, []);

  const fetchFavourites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FavouriteService.getFavourites();

      // backend: { status: true, data: [...] }
      const list: any[] = res?.data ?? [];

      const mapped: FavouriteTour[] = list.map((f) => {
        const adultPrice = f?.price?.adult ?? 0;
        const adultNew = f?.newPrice?.adult;

        const oldPrice =
          typeof adultNew === "number" && adultNew < adultPrice
            ? { adult: adultPrice }
            : undefined;

        const discount =
          typeof adultNew === "number" && adultNew < adultPrice && adultPrice > 0
            ? Math.round(((adultPrice - adultNew) / adultPrice) * 100)
            : undefined;

        return {
          favouriteId: String(f._id),     // ✅ favouriteId
          tourId: String(f.tour),         // ✅ tourId thật
          cityId: f.city ? String(f.city) : undefined,

          name: f.name,
          time: f.time,
          vehicle: f.vehicle,

          price: f.price ?? { adult: 0 },
          newPrice: f.newPrice,

          thumbnail_url: f.thumbnail_url,

          oldPrice,
          discount,

          rating: f.rating ?? 0,
          location: f.location,
          category: f.category,
        };
      });

      setFavourites(mapped);
    } catch (error: any) {
      console.error("Fetch favourites error:", error);
      MessageBoxService.error(
        "Lỗi",
        error?.message || "Không thể tải danh sách yêu thích",
        "OK"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const cityRes = await TourService.getCities();
      const cityList = Array.isArray(cityRes) ? cityRes : cityRes?.data ?? [];
      setCities(cityList);
    } catch (error) {
      console.error("Fetch cities error:", error);
    }
  }, []);


  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchCities();       // ✅ add
      fetchFavourites();
    }, [fetchCategories, fetchCities, fetchFavourites])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchCities(), fetchFavourites()]); // ✅ add fetchCities
    setRefreshing(false);
  }, [fetchCategories, fetchCities, fetchFavourites]);


  const handleRemoveFavourite = useCallback((tourId: string) => {
    MessageBoxService.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa tour này khỏi danh sách yêu thích?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await FavouriteService.deleteByTourId(tourId);
          setFavourites((prev) => prev.filter((f) => f.tourId !== tourId));
          MessageBoxService.success("Thành công", "Đã xóa khỏi danh sách yêu thích", "OK");
        } catch (error: any) {
          MessageBoxService.error("Lỗi", error?.message || "Không thể xóa", "OK");
        }
      },
    });
  }, []);

  const selectedCityObj = cities.find((c) => String(c?._id) === String(selectedCity));
  const selectedCityName = (selectedCityObj?.name || "").trim().toLowerCase();

  const filteredFavourites = favourites.filter((fav) => {
    // category filter
    const okCategory = !selectedCategory || String(fav.category) === String(selectedCategory);

    // city filter (ưu tiên cityId, fallback bằng location)
    const favCityId = fav.cityId ? String(fav.cityId) : "";
    const favLocation = (fav.location || "").trim().toLowerCase();

    const okCity =
      !selectedCity ||
      favCityId === String(selectedCity) ||
      (!!selectedCityName && (favLocation === selectedCityName || favLocation.includes(selectedCityName)));

    return okCategory && okCity;
  });


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="heart-outline" size={64} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có tour yêu thích</Text>
      <Text style={styles.emptyDesc}>
        Hãy thêm các tour bạn thích vào danh sách để dễ dàng theo dõi và đặt tour
        sau này
      </Text>
      <Pressable
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
        <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
      </Pressable>
    </View>
  );

  const renderTourCard = ({ item }: { item: FavouriteTour }) => (
    <Pressable
      style={styles.tourCard}
      onPress={() => navigation.navigate("TourDetailScreen", { id: item.tourId })}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.tourImage}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {(item.discount ?? 0) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}

        {/* Remove Favourite Button */}
        <Pressable
          style={styles.favouriteButton}
          onPress={() => handleRemoveFavourite(item.tourId)}
        >
          <Ionicons name="heart" size={20} color={theme.colors.error} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.tourContent}>
        {/* Location */}
        {item.location && (
          <View style={styles.locationBadge}>
            <Ionicons
              name="location"
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.tourTitle} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.gray}
            />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons
              name="car-outline"
              size={14}
              color={theme.colors.gray}
            />
            <Text style={styles.metaText}>{item.vehicle}</Text>
          </View>
        </View>

        {/* Footer: Price + Rating */}
        <View style={styles.tourFooter}>
          <View style={styles.priceContainer}>
            {item.oldPrice?.adult ? (
              <Text style={styles.oldPrice}>
                {formatPrice(item.oldPrice.adult)}
              </Text>
            ) : null}
            <Text style={styles.newPrice}>
              {formatPrice(item.newPrice?.adult ?? item.price.adult)}
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={28} color={theme.colors.error} />
          <View>
            <Text style={styles.headerTitle}>Yêu thích</Text>
            <Text style={styles.headerSubtitle}>{favourites.length} tour</Text>
          </View>
        </View>

        {favourites.length > 0 && (
          <Pressable
            style={styles.sortButton}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <View style={{ position: "relative" }}>
              <MaterialCommunityIcons
                name={showFilters ? "filter-off-outline" : "filter-outline"}
                size={20}
                color={theme.colors.text}
              />
              {(selectedCategory || selectedCity) && (
                <View style={styles.filterDot} />
              )}
            </View>
          </Pressable>
        )}
      </View>

      {favourites.length > 0 && showFilters && (
        <>
          {/* Label: Category */}
          {categories.length > 0 && (
            <View style={styles.filterLabelRow}>
              <Text style={styles.filterLabel}>Danh mục</Text>
            </View>
          )}

          {/* Category chips */}
          {categories.length > 0 && (
            <FlatList
              style={{ flexGrow: 0 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item?._id?.toString()}
              contentContainerStyle={styles.categoriesContainer}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.sm }} />}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.categoryChip,
                    selectedCategory === item._id && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(selectedCategory === item._id ? null : item._id)
                  }
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.categoryText,
                      selectedCategory === item._id && styles.categoryTextActive,
                    ]}
                  >
                    {item?.name || "Unknown"}
                  </Text>
                </Pressable>
              )}
            />
          )}

          {/* Label: City */}
          {cities.length > 0 && (
            <View style={styles.filterLabelRow}>
              <Text style={styles.filterLabel}>Thành phố</Text>
            </View>
          )}

          {/* City chips */}
          {cities.length > 0 && (
            <FlatList
              style={{ flexGrow: 0 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={cities}
              keyExtractor={(item) => item?._id?.toString()}
              contentContainerStyle={styles.categoriesContainer}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.sm }} />}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.categoryChip,
                    selectedCity === item._id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCity(selectedCity === item._id ? null : item._id)}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.categoryText,
                      selectedCity === item._id && styles.categoryTextActive,
                    ]}
                  >
                    {item?.name || "Unknown"}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </>
      )}


      {/* Tours List */}
      {favourites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredFavourites}
          keyExtractor={(item) => item.favouriteId}
          renderItem={renderTourCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyFilterContainer}>
              <Ionicons
                name="filter-outline"
                size={48}
                color={theme.colors.gray}
              />
              <Text style={styles.emptyFilterText}>
                Không có tour nào trong danh mục này
              </Text>
            </View>
          }
        />
      )}

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: "600",
    marginTop: 2,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterLabelRow: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
  },
  // Categories
  // Categories (FavouriteScreen) - giống HomeScreen + fix phình
  categoriesContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,   // ✅ giống HomeScreen (xs)
    alignItems: "center",               // ✅ chống stretch
  },
  categoryChip: {
    height: 32,                         // ✅ khóa chiều cao chip
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: "#111827",
  },
  categoryTextActive: {
    color: theme.colors.white,
  },
  filterDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  // List
  scrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },

  // Tour Card
  tourCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  tourImage: {
    width: "100%",
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  discountBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: "800",
  },
  favouriteButton: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Content
  tourContent: {
    padding: theme.spacing.md,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  tourTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: "800",
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: theme.colors.border,
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
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceContainer: {
    gap: 4,
  },
  oldPrice: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray,
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  newPrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
  },
  ratingText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: theme.colors.text,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
    fontWeight: "600",
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  exploreButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.white,
  },

  // Empty Filter State
  emptyFilterContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyFilterText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray,
    marginTop: theme.spacing.md,
    fontWeight: "600",
  },
});